# NodeJs: Rate Limiter

The task is to implement a custom rate limiter middleware that limits the number of API requests allowed from a client within a specified time window. You are given a **RateLimiterMiddleware** class which implements the custom rate limiter middleware. Complete the **middleware** method which returns a middleware function that limits the number of requests from each client IP address based on the provided options: **rateLimiterOptions**. Also, complete the **rateLimiterOptions** which should define the maximum requests limit and a specified time window.

**RateLimiterMiddleware**
- The **constructor** accepts an options object with the properties **maxRequests** and **timeWindow**.
  - Initializes an empty Map instance as **rateLimitStore** to store the client IP addresses and their corresponding request data.

- **middleware** method should:
  - Keep track of the request count and the timestamp of the first request for each client IP address.
  - Limit the number of requests based on the provided **maxRequests** and **timeWindow** options.
  
  - Retrieves the client's IP address from the request.
  - Retrieve the client's request data from rateLimitStore or initialize a new request data object with **requestCount** set to 0 and **firstRequestTime** set to the current timestamp.
  - If the client has exceeded the rate limit:
    - Reset the **X-RateLimit-Remaining** header to 0
    - Return a **429** status code and a JSON message "You have exceeded the rate limit. Please try again later."
  - If the client has not exceeded the rate limit:
    - Increment the **requestCount** by 1
    - Update the client's request data in the **rateLimitStore**
    - If the difference between the current timestamp and **firstRequestTime** is greater than or equal to **timeWindow**, reset the requestCount to 1 and update **firstRequestTime** to the current timestamp.
    - Set the **X-RateLimit-Remaining** header to the difference between **maxRequests** and the updated **requestCount**.
  
  - Include the following headers in the responses:
    - **X-RateLimit-Limit**: The maximum number of requests allowed within the time window. 
      - Set the **X-RateLimit-Limit** header to the **maxRequests** value.
    - **X-RateLimit-Remaining**: The number of requests remaining within the current time window. 
      - Set the **X-RateLimit-Reset** header to the sum of **firstRequestTime** and **timeWindow**.
    - **X-RateLimit-Reset**: The timestamp when the rate limit will be reset.
      - Set the **X-RateLimit-Remaining** header to the difference between **maxRequests** and the updated **requestCount**
  
- reset():
  - Clears the **rateLimitStore** by calling its clear() method, effectively resetting the rate limit data for all clients.

**options.js**
- Define an object **rateLimiterOptions** with the properties **maxRequests** and **timeWindow**.
  - The **maxRequests** property should be a **number** representing the maximum number of requests allowed within the time window.
  - Set **maxRequests** to be **5**
  - The **timeWindow** property should be a **number** representing the time window duration (in milliseconds) to limit requests within.
  - Set **timeWindow** to be **1000** (1 second).


**Read Only Files**

- `test/*.spec.js`

## Environment

- Node Version: v14(LTS)
- Default Port: 8000

**Commands**

- run:

```
npm start
```

- install:

```
npm install
```

- test:

```
npm test
```
