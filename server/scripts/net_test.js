const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

axios.post(url, {
  contents: [{ parts: [{ text: "Hello" }] }]
})
.then(resp => console.log('Network OK:', resp.data.candidates[0].content.parts[0].text))
.catch(err => console.error('Network Error:', err.message));
