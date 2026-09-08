/**
 * In-memory sliding-window rate limiter for Fayzee AI Chat.
 * Prevents spam, abuse, and API budget exhaustion.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 25, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Prune stale records every 5 minutes
    if (typeof setInterval !== "undefined") {
      const interval = setInterval(() => {
        this.prune();
      }, 5 * 60 * 1000);
      if (interval.unref) interval.unref();
    }
  }

  /**
   * Checks if an identifier (IP address or sessionToken) is within the rate limit.
   */
  public check(identifier: string): {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.records.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(identifier, record);
    }

    // Filter out timestamps older than current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterMs = Math.max(0, oldestInWindow + this.windowMs - now);
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000) || 1,
      };
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Resets rate limit for a specific identifier (useful for tests or admin overrides).
   */
  public reset(identifier: string): void {
    this.records.delete(identifier);
  }

  /**
   * Remove expired identifiers from memory.
   */
  private prune(): void {
    const windowStart = Date.now() - this.windowMs;
    const expiredKeys: string[] = [];

    this.records.forEach((record, id) => {
      record.timestamps = record.timestamps.filter((ts: number) => ts > windowStart);
      if (record.timestamps.length === 0) {
        expiredKeys.push(id);
      }
    });

    for (let i = 0; i < expiredKeys.length; i++) {
      this.records.delete(expiredKeys[i]);
    }
  }
}

// Global default rate limiter: 25 requests per minute per client IP/session
export const chatRateLimiter = new SlidingWindowRateLimiter(25, 60000);
