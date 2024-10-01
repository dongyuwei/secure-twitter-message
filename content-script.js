console.log('Content script loaded');

let secretKey;

chrome.runtime.sendMessage({ action: 'getSecretKey' }, (response) => {
  console.log('Received secret key:', response.secretKey);
  secretKey = response.secretKey;
});

function encryptMessage(message, secretKey) {
  console.log('Encrypting message:', message);
  const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
  console.log('Encrypted message:', encrypted);
  return encrypted;
}

function decryptMessage(encrypted, secretKey) {
  console.log('Decrypting message:', encrypted);
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted message:', decrypted);
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Intercept and modify outgoing requests
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(...args) {
  console.log('XMLHttpRequest.open called with URL:', args[1]);
  this._url = args[1];
  originalXHROpen.apply(this, args);
};

const originalXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(body) {
  console.log('XMLHttpRequest.send called for URL:', this._url);
  if (this._url === 'https://x.com/i/api/1.1/dm/new2.json') {
    console.log('Intercepted outgoing DM request');
    const data = JSON.parse(body);
    data.text = encryptMessage(data.text, secretKey);
    body = JSON.stringify(data);
  }
  originalXHRSend.call(this, body);
};

// Intercept and modify incoming responses
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch called with URL:', args[0]);
  return originalFetch.apply(this, args).then(async (response) => {
    if (response.url.includes('https://x.com/i/api/1.1/dm/user_updates.json')) {
      console.log('Intercepted incoming DM update');
      const clonedResponse = response.clone();
      const responseBody = await clonedResponse.json();
      
      responseBody.user_events.entries.forEach(entry => {
        if (entry.message && entry.message.message_data) {
          const decryptedMessage = decryptMessage(entry.message.message_data.text, secretKey);
          if (decryptedMessage !== null) {
            entry.message.message_data.text = decryptedMessage;
          }
        }
      });

      return new Response(JSON.stringify(responseBody), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    return response;
  });
};

console.log('Content script setup complete');