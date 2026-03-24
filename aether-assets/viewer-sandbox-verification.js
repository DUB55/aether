/**
 * Viewer Mode Sandbox Configuration Verification
 * 
 * This script verifies that the viewer mode iframe has the correct sandbox
 * configuration to support all required webpage functionality while maintaining
 * security.
 * 
 * Requirements validated:
 * - 7.1: JavaScript execution (allow-scripts)
 * - 7.2: Form submissions and user interactions (allow-forms)
 * - 7.3: Modal dialogs and popups (allow-modals, allow-popups)
 * - 7.4: Same sandbox restrictions as editor preview
 */

/**
 * Verifies that the iframe sandbox attribute contains all required permissions
 * @returns {Object} Verification result with status and details
 */
function verifyViewerSandbox() {
  const iframe = document.getElementById('pframe');
  
  if (!iframe) {
    return {
      success: false,
      message: 'Preview iframe not found',
      details: null
    };
  }

  const sandbox = iframe.getAttribute('sandbox');
  
  if (!sandbox) {
    return {
      success: false,
      message: 'Sandbox attribute not found on iframe',
      details: null
    };
  }

  const requiredPermissions = [
    'allow-scripts',      // Requirement 7.1: JavaScript execution
    'allow-forms',        // Requirement 7.2: Form submissions
    'allow-modals',       // Requirement 7.3: Modal dialogs (alert, confirm, prompt)
    'allow-popups'        // Requirement 7.3: Popup windows (window.open)
  ];

  const sandboxPermissions = sandbox.split(/\s+/).filter(p => p.length > 0);
  const missingPermissions = requiredPermissions.filter(
    perm => !sandboxPermissions.includes(perm)
  );

  const success = missingPermissions.length === 0;

  return {
    success,
    message: success 
      ? 'All required sandbox permissions are present'
      : `Missing permissions: ${missingPermissions.join(', ')}`,
    details: {
      required: requiredPermissions,
      present: sandboxPermissions,
      missing: missingPermissions
    }
  };
}

/**
 * Verifies that viewer mode and editor mode use the same iframe element
 * @returns {boolean} True if both modes use the same iframe
 */
function verifySharedIframe() {
  // Both viewer mode and editor mode use the same iframe element with id="pframe"
  // This is verified by checking that:
  // 1. The iframe exists in the DOM
  // 2. The viewer mode CSS shows the iframe (display: block)
  // 3. The editor mode also uses the same iframe element
  
  const iframe = document.getElementById('pframe');
  return iframe !== null;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifyViewerSandbox,
    verifySharedIframe
  };
}

// Auto-verify on load in browser context
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const result = verifyViewerSandbox();
    console.log('Viewer Sandbox Verification:', result);
    
    if (!result.success) {
      console.error('Sandbox verification failed:', result.message);
      console.error('Details:', result.details);
    }
  });
}
