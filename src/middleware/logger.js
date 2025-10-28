const logger = (req, res, next) => {
  // Log the incoming request
  console.log(`\n=== API Request ===`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`IP: ${req.ip}`);
  
  // Log request headers (excluding sensitive ones)
  console.log(`Headers:`, {
    'user-agent': req.get('user-agent'),
    'content-type': req.get('content-type'),
    'authorization': req.get('authorization') ? '[REDACTED]' : undefined
  });
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Redact sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.accessToken) sanitizedBody.accessToken = '[REDACTED]';
    if (sanitizedBody.refreshToken) sanitizedBody.refreshToken = '[REDACTED]';
    
    console.log(`Body:`, sanitizedBody);
  }
  
  // Capture the original send function to log the response
  const originalSend = res.send;
  res.send = function(data) {
    // Log the response
    console.log(`\n=== API Response ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response Time: ${Date.now() - req.timestamp}ms`);
    
    // Try to parse JSON response for better formatting
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log(`Data:`, parsedData);
    } catch (e) {
      console.log(`Data:`, data);
    }
    
    // Call the original send function
    originalSend.call(this, data);
  };
  
  // Add timestamp to request for response time calculation
  req.timestamp = Date.now();
  
  next();
};

module.exports = logger;