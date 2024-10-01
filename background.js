// const CryptoJS = require('crypto-js');
// crypto-js.4.2.0.min.js is downloaded from https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js

const encryptMessage = (message, secretKey) => {
    const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
    return encrypted;
};

const decryptMessage = (encrypted, secretKey) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null; // Return null if decryption fails
    }
};

let secretKey;
if (sessionStorage.getItem('twitterMessageSecretKey')) {
    secretKey = sessionStorage.getItem('twitterMessageSecretKey');
} else {
    // secretKey = CryptoJS.lib.WordArray.random(256 / 8).toString();
    // sessionStorage.setItem('twitterMessageSecretKey', secretKey);
    console.error(`You and your friend should setup a same secret key in sessionStorage, run the following code in Console of Chrome Dev Tools:
    sessionStorage.setItem('twitterMessageSecretKey', ${CryptoJS.lib.WordArray.random(256 / 8).toString()})`);
}

// Sender part:
// Intercept the POST request to Twitter's DM API
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.method === 'POST') {
            const requestBody = JSON.parse(decodeURIComponent(String.fromCharCode.apply(
                null,
                new Uint8Array(details.requestBody.raw[0].bytes)
            )));

            const encryptedMessage = encryptMessage(requestBody.text, secretKey);

            // Modify the request body with the encrypted message
            requestBody.text = encryptedMessage;

            // Convert the modified request body back to a string
            const modifiedRequestBody = JSON.stringify(requestBody);

            // Return the modified request body
            return {
                redirectUrl: details.url,
                requestBody: modifiedRequestBody
            };
        }
    },
    { urls: ["https://x.com/i/api/1.1/dm/new2.json"] },
    ["blocking", "requestBody"]
);

// Receiver part:
// Intercept the response from Twitter's DM API
chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (details.url.includes('https://x.com/i/api/1.1/dm/user_updates.json')) {
        // Fetch the response body
        fetch(details.url)
          .then(response => response.json())
          .then(responseBody => {
            // Modify the response body to include the decrypted message
            const entries = responseBody.user_events.entries;
            entries.forEach(entry => {
              const messageData = entry.message.message_data;
              const encryptedMessage = messageData.text;
              const decryptedMessage = decryptMessage(encryptedMessage, secretKey);
              if (decryptedMessage !== null) {
                messageData.text = decryptedMessage;
              }
            });
  
            // Return the modified response body
            return new Response(JSON.stringify(responseBody), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          })
          .catch(error => {
            console.error('Error fetching or modifying response:', error);
          });
      }
    },
    { urls: ["https://x.com/i/api/1.1/dm/user_updates.json"] }
  );