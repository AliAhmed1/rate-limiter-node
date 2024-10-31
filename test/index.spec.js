const chai = require('chai');
const chaiHttp = require('chai-http');
const { app: server, rateLimiter } = require('../app');
const should = chai.should();
const rateLimiterOptions = require('../src/options');

chai.use(chaiHttp);

const basePath = '/api';
const totalRequests = 5;
const delayBetweenRequests = 10; // milliseconds

async function sendRequest() {
  return chai.request(server).get(basePath);
}

async function sendRequests(requestCount, delay) {
  const responses = [];
  for (let i = 0; i < requestCount; i++) {
    responses.push(await sendRequest());
    if (i !== requestCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return responses;
}

function isMiddlewareBypassed(response) {
  return (
    response.status === 200 &&
    (response.header['x-ratelimit-limit'] === undefined ||
      response.header['x-ratelimit-remaining'] === undefined ||
      response.header['x-ratelimit-reset'] === undefined)
  );
}

describe('rateLimiterOptions', () => {
  it('should have maxRequests property', () => {
    rateLimiterOptions.should.have.property('maxRequests');
  });

  it('should have timeWindow property', () => {
    rateLimiterOptions.should.have.property('timeWindow');
  });

  it('maxRequests should be a number', () => {
    rateLimiterOptions.maxRequests.should.be.a('number');
  });

  it('timeWindow should be a number', () => {
    rateLimiterOptions.timeWindow.should.be.a('number');
  });

  it('maxRequests should be equal to 5', () => {
    rateLimiterOptions.maxRequests.should.be.equal(5);
  });

  it('timeWindow should be equal to 1000', () => {
    rateLimiterOptions.timeWindow.should.be.equal(1000);
  });
});

describe('rateLimiterMiddleware', () => {

  beforeEach(() => {
    // Clear the rateLimitStore before each test to avoid interference
    rateLimiter.reset();
  });

  it('should have x-ratelimit-limit header', async () => {
    const response = await sendRequest();
    response.header.should.have.property('x-ratelimit-limit');
    should.exist(response.header['x-ratelimit-limit']);
  });

  it('should have x-ratelimit-remaining header', async () => {
    const response = await sendRequest();
    response.header.should.have.property('x-ratelimit-remaining');
    should.exist(response.header['x-ratelimit-remaining']);
  });

  it('should have x-ratelimit-reset header', async () => {
    const response = await sendRequest();
    response.header.should.have.property('x-ratelimit-reset');
    should.exist(response.header['x-ratelimit-reset']);
  });

  it('should allow all requests when totalRequests is within the rate limit', async () => {
    const withinLimit = totalRequests - 1;
    const responses = await sendRequests(withinLimit, delayBetweenRequests);
    responses.forEach((response) => {
      if (isMiddlewareBypassed(response)) {
        throw new Error('Middleware is being bypassed');
      }
      response.should.have.status(200);
    });
  });

  it('should allow the exact number of requests as the rate limit', async () => {
    const atLimit = totalRequests;
    const responses = await sendRequests(atLimit, delayBetweenRequests);
    responses.forEach((response) => {
      if (isMiddlewareBypassed(response)) {
        throw new Error('Middleware is being bypassed');
      }
      response.should.have.status(200);
    });
  });

  it('should block only the requests exceeding the rate limit', async () => {
    const overLimit = totalRequests + 1;
    const responses = await sendRequests(overLimit, delayBetweenRequests);
    let successCount = 0;
    let blockedCount = 0;

    responses.forEach((response) => {
      if (isMiddlewareBypassed(response)) {
        throw new Error('Middleware is being bypassed');
      }
      if (response.status === 200) {
        successCount++;
      } else if (response.status === 429) {
        blockedCount++;
      }
    });

    successCount.should.equal(totalRequests);
    blockedCount.should.equal(1);
  });

  it('should allow requests after the rate limit reset time has passed', async () => {
    const overLimit = totalRequests + 1;
    const rateLimitResetTime = rateLimiterOptions.timeWindow;

    await sendRequests(overLimit, delayBetweenRequests);

    // Wait for the rate limit reset time to pass
    await new Promise((resolve) => setTimeout(resolve, rateLimitResetTime));

    // Send another request after the reset time
    const response = await sendRequest();
    if (isMiddlewareBypassed(response)) {
      throw new Error('Middleware is being bypassed');
    }
    response.should.have.status(200);
  });
});
