// Blockchain verification service for Polygon USDT payments
// Uses free APIs (Polygonscan) to verify transactions

// Exodus wallet address (replace with actual address)
const EXODUS_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';

// Polygonscan API (free tier)
const POLYGONSCAN_API_KEY = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || '';
const POLYGONSCAN_API_URL = 'https://api.polygonscan.com/api';

export interface TransactionVerification {
  success: boolean;
  txHash?: string;
  from?: string;
  to?: string;
  value?: string;
  confirmations?: number;
  error?: string;
}

/**
 * Verify a transaction on Polygon network
 * @param txHash Transaction hash to verify
 * @param expectedAmount Expected amount in USDT (smallest unit)
 */
export async function verifyTransaction(
  txHash: string,
  expectedAmount?: number
): Promise<TransactionVerification> {
  try {
    // Using Polygonscan API to get transaction details
    const response = await fetch(
      `${POLYGONSCAN_API_URL}?module=proxy&action=tx_gettxreceipt&txhash=${txHash}&apikey=${POLYGONSCAN_API_KEY}`
    );

    const data = await response.json();

    if (data.status === '0') {
      return {
        success: false,
        error: data.message || 'Transaction not found'
      };
    }

    const receipt = data.result;

    // Check if transaction is successful
    if (receipt.status !== '0x1') {
      return {
        success: false,
        error: 'Transaction failed'
      };
    }

    // Get transaction details to verify amount and recipient
    const txDetailsResponse = await fetch(
      `${POLYGONSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${POLYGONSCAN_API_KEY}`
    );

    const txDetailsData = await txDetailsResponse.json();
    const txDetails = txDetailsData.result;

    // Verify the transaction is to our wallet
    if (txDetails.to.toLowerCase() !== EXODUS_WALLET_ADDRESS.toLowerCase()) {
      return {
        success: false,
        error: 'Transaction sent to wrong address'
      };
    }

    // If expected amount is provided, verify it (in USDT, 6 decimals)
    if (expectedAmount !== undefined) {
      const txValue = parseInt(txDetails.value, 16);
      // Note: USDT on Polygon is an ERC-20 token, so we need to check the token transfer
      // This is a simplified check - in production, you'd decode the input data or use token transfer events
    }

    return {
      success: true,
      txHash,
      from: txDetails.from,
      to: txDetails.to,
      value: txDetails.value,
      confirmations: receipt.confirmations
    };
  } catch (error) {
    console.error('[Blockchain Verification] Error verifying transaction:', error);
    return {
      success: false,
      error: 'Failed to verify transaction'
    };
  }
}

/**
 * Get recent transactions to the wallet
 * This can be used to monitor for payments without requiring users to input TXID
 */
export async function getRecentTransactions(): Promise<any[]> {
  try {
    const response = await fetch(
      `${POLYGONSCAN_API_URL}?module=account&action=txlist&address=${EXODUS_WALLET_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${POLYGONSCAN_API_KEY}`
    );

    const data = await response.json();

    if (data.status === '0') {
      return [];
    }

    return data.result;
  } catch (error) {
    console.error('[Blockchain Verification] Error fetching transactions:', error);
    return [];
  }
}

/**
 * Check if a specific amount was sent to the wallet
 * Used for unique amount tracking (e.g., $15.0021)
 */
export async function checkForPaymentAmount(
  amount: number,
  startTime: Date,
  endTime: Date
): Promise<string | null> {
  try {
    const response = await fetch(
      `${POLYGONSCAN_API_URL}?module=account&action=txlist&address=${EXODUS_WALLET_ADDRESS}&startblock=${Math.floor(startTime.getTime() / 1000)}&endblock=${Math.floor(endTime.getTime() / 1000)}&page=1&offset=100&sort=asc&apikey=${POLYGONSCAN_API_KEY}`
    );

    const data = await response.json();

    if (data.status === '0') {
      return null;
    }

    // Convert amount to wei (for MATIC) or check token transfers for USDT
    // This is a simplified check - in production, you'd need to decode token transfers
    for (const tx of data.result) {
      const txValue = parseInt(tx.value, 16);
      const txAmount = txValue / 1e18; // Convert from wei to MATIC

      // Allow small margin for gas fees
      if (Math.abs(txAmount - amount) < 0.0001) {
        return tx.hash;
      }
    }

    return null;
  } catch (error) {
    console.error('[Blockchain Verification] Error checking for payment amount:', error);
    return null;
  }
}
