class RateLimiterMiddleware {
  constructor(options) {
    this.rateLimitStore = new Map();
    this.maxRequests = options.maxRequests;
    this.timeWindow = options.timeWindow;
    this.options = options;
  }

  middleware() {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress
      const currentTime = Date.now();

      let requestData = this.rateLimitStore.get(clientIP) || {
        requestCount: 0,
        firstRequestTime: currentTime
      };

      if (currentTime - requestData.firstRequestTime >= this.timeWindow) {
        requestData.requestCount = 1;
        requestData.firstRequestTime = currentTime;
      } else {
        requestData.requestCount += 1;
      }

      if (requestData.requestCount > this.maxRequests) {
        res.set('X-RateLimit-Limit', this.maxRequests);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', requestData.firstRequestTime + +(this.timeWindow));

        return res.status(429).json({ message: "You have exceeded the rate limit. Please try again later." });
      }

      this.rateLimitStore.set(clientIP, requestData);
      res.set('X-RateLimit-Limit', this.maxRequests);
      res.set('X-RateLimit-Remaining', this.maxRequests - requestData.requestCount);
      res.set('X-RateLimit-Reset', requestData.firstRequestTime + +(this.timeWindow));

      next();
    };
  }

  reset() {
    this.rateLimitStore.clear();
  }
}

module.exports = RateLimiterMiddleware;
