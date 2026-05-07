// Mock PaymentService for NexaPay.one simulation
// This simulates the hosted checkout flow: Create Charge -> Redirect User -> Webhook -> Success

export interface PaymentRequest {
  amount: number; // in USD
  currency: string;
  userId: string;
  planId: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  chargeId?: string;
  hostedUrl?: string;
  error?: string;
}

export interface WebhookPayload {
  event: string;
  data: {
    chargeId: string;
    amount: number;
    currency: string;
    userId: string;
    planId: string;
    status: string;
    timestamp: number;
  };
  signature: string;
}

// Calculate total with 3% processing fee
export function calculateTotalWithFee(baseAmount: number): number {
  const fee = baseAmount * 0.03;
  return baseAmount + fee;
}

// Mock NexaPay API - Create a charge
export async function createCharge(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // In production, this would call the actual NexaPay API
    // For mock mode, we simulate the response
    
    const chargeId = `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate hosted checkout URL (in production, this comes from NexaPay)
    const hostedUrl = `/mock-checkout?chargeId=${chargeId}&amount=${request.amount}&planId=${request.planId}`;
    
    console.log('[PaymentService] Mock charge created:', { chargeId, request });
    
    return {
      success: true,
      chargeId,
      hostedUrl,
    };
  } catch (error) {
    console.error('[PaymentService] Error creating charge:', error);
    return {
      success: false,
      error: 'Failed to create payment charge',
    };
  }
}

// Verify webhook signature (mock implementation)
export function verifyWebhookSignature(payload: WebhookPayload, webhookSecret: string): boolean {
  // In production, this would verify the actual signature from NexaPay
  // For mock mode, we accept all signatures
  console.log('[PaymentService] Verifying webhook signature:', { chargeId: payload.data.chargeId });
  return true;
}

// Process webhook event
export async function processWebhookEvent(payload: WebhookPayload): Promise<boolean> {
  try {
    if (payload.event !== 'charge.succeeded') {
      console.log('[PaymentService] Ignoring non-success event:', payload.event);
      return false;
    }

    console.log('[PaymentService] Processing successful charge:', payload.data);
    
    // In production, this would update the user's subscription in the database
    // For mock mode, we just log it
    
    return true;
  } catch (error) {
    console.error('[PaymentService] Error processing webhook:', error);
    return false;
  }
}

// Mock webhook secret (in production, this would be in environment variables)
export const WEBHOOK_SECRET = 'nexapay_webhook_secret_mock';
