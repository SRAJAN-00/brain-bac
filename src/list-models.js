const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Listing available models...');

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    if (response.models) {
      console.log('Available models:');
      response.models.forEach(model => {
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${model.name} (supports generateContent)`);
        }
      });
    } else {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();