class RateLimiterMiddleware {
  constructor(options) {
    this.rateLimitStore = new Map();
    this.options = options;
  }

  middleware() {
    return (req, res, next) => {
      next();
    };
  }

  reset() {
    this.rateLimitStore.clear();
  }
}

module.exports = RateLimiterMiddleware;
