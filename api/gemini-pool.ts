export enum KeyStatus {
  HEALTHY = "healthy",
  COOLING_DOWN = "cooling_down",
  EXHAUSTED = "exhausted",
  INVALID = "invalid",
  DISABLED = "disabled",
}

interface KeyState {
  key: string;
  status: KeyStatus;
  lastFailureReason?: string;
  cooldownUntil?: number;
  lastUsedAt?: number;
  failureCount: number;
}

export class GeminiPoolManager {
  private keys: KeyState[] = [];
  private currentIndex = 0;

  private lastResetDay: number = new Date().getUTCDay();

  constructor(apiKeys: string[]) {
    this.keys = apiKeys.map((key) => ({
      key,
      status: KeyStatus.HEALTHY,
      failureCount: 0,
    }));
    console.log(`GeminiPoolManager initialized with ${this.keys.length} keys.`);
  }

  public getNextAvailableKey(): KeyState | null {
    const now = Date.now();
    
    // Daily reset at midnight (UTC)
    const today = new Date().getUTCDay();
    if (this.lastResetDay !== today) {
      console.log('Daily reset triggered for Gemini API key pool.');
      this.keys.forEach(state => {
        if (state.status !== KeyStatus.INVALID) {
          state.status = KeyStatus.HEALTHY;
          state.failureCount = 0;
          state.cooldownUntil = undefined;
        }
      });
      this.lastResetDay = today;
    }

    // Refresh cooling down keys
    this.keys.forEach((state) => {
      if (state.status === KeyStatus.COOLING_DOWN && state.cooldownUntil && now > state.cooldownUntil) {
        state.status = KeyStatus.HEALTHY;
        state.failureCount = 0;
        console.log(`Key ${this.maskKey(state.key)} has cooled down and is now healthy.`);
      }
    });

    const healthyKeys = this.keys.filter((k) => k.status === KeyStatus.HEALTHY);
    if (healthyKeys.length === 0) return null;

    // Round-robin selection among healthy keys
    // Find the next healthy key starting from currentIndex
    for (let i = 0; i < this.keys.length; i++) {
      const index = (this.currentIndex + i) % this.keys.length;
      const state = this.keys[index];
      if (state.status === KeyStatus.HEALTHY) {
        this.currentIndex = (index + 1) % this.keys.length;
        state.lastUsedAt = now;
        return state;
      }
    }

    return null;
  }

  public markKeyFailed(key: string, reason: string, isFatal: boolean = false) {
    const state = this.keys.find((k) => k.key === key);
    if (!state) return;

    state.lastFailureReason = reason;
    state.failureCount++;

    if (isFatal) {
      state.status = KeyStatus.INVALID;
      console.error(`Key ${this.maskKey(key)} marked as INVALID. Reason: ${reason}`);
    } else if (reason && (reason.includes("429") || reason.toLowerCase().includes("quota") || reason.toLowerCase().includes("rate limit"))) {
      state.status = KeyStatus.COOLING_DOWN;
      // Exponential backoff for cooldown: 1min, 5min, 15min, 1hr
      const cooldownMinutes = Math.min(60, Math.pow(state.failureCount, 2) * 1);
      state.cooldownUntil = Date.now() + cooldownMinutes * 60 * 1000;
      console.warn(`Key ${this.maskKey(key)} marked as COOLING_DOWN for ${cooldownMinutes}m. Reason: ${reason}`);
    } else {
      // For other transient errors, maybe just a short cooldown
      state.status = KeyStatus.COOLING_DOWN;
      state.cooldownUntil = Date.now() + 30 * 1000; // 30 seconds
      console.warn(`Key ${this.maskKey(key)} marked as COOLING_DOWN (transient) for 30s. Reason: ${reason}`);
    }
  }

  public maskKey(key: string): string {
    if (key.length <= 8) return "***";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  public getPoolStatus() {
    return this.keys.map(k => ({
      key: this.maskKey(k.key),
      status: k.status,
      failureCount: k.failureCount,
      cooldownUntil: k.cooldownUntil ? new Date(k.cooldownUntil).toISOString() : null
    }));
  }
}
