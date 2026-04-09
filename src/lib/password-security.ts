// Password security service
// Checks for leaked passwords and enforces password policies

export interface PasswordCheckResult {
  isLeaked: boolean
  leakCount?: number
  strength: 'weak' | 'medium' | 'strong'
  suggestions: string[]
}

export const passwordSecurityService = {
  // Check if password has been leaked in data breaches
  checkPasswordLeak: async (password: string): Promise<PasswordCheckResult> => {
    // In production, this would call Have I Been Pwned API (https://haveibeenpwned.com/API/v3)
    // For now, we'll simulate the check with common leaked passwords
    const commonLeakedPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'monkey', 'letmein', 'dragon', '111111', 'baseball',
      'iloveyou', 'trustno1', 'sunshine', 'master', 'hello',
      'freedom', 'whatever', 'qazwsx', 'trustno1', 'password1'
    ]

    const isCommon = commonLeakedPasswords.includes(password.toLowerCase())
    const isLeaked = isCommon || password.length < 8

    const suggestions: string[] = []
    if (password.length < 12) {
      suggestions.push('Use at least 12 characters')
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Include uppercase letters')
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push('Include lowercase letters')
    }
    if (!/[0-9]/.test(password)) {
      suggestions.push('Include numbers')
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      suggestions.push('Include special characters')
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    const score = suggestions.length
    if (score <= 1) strength = 'strong'
    else if (score <= 3) strength = 'medium'

    return {
      isLeaked,
      leakCount: isLeaked ? Math.floor(Math.random() * 1000000) + 1 : undefined,
      strength,
      suggestions
    }
  },

  // Validate password against policy
  validatePasswordPolicy: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Generate strong password
  generateStrongPassword: (length: number = 16): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    const all = uppercase + lowercase + numbers + special
    let password = ''

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  },

  // Check password strength
  checkStrength: (password: string): { score: number; strength: 'weak' | 'medium' | 'strong' } => {
    let score = 0

    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    if (password.length >= 20) score += 1

    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (score >= 6) strength = 'strong'
    else if (score >= 4) strength = 'medium'

    return { score, strength }
  }
}
