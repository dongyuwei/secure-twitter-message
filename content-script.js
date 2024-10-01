console.log('Content script loaded for Secure Twitter Message');

let secretKey;

chrome.storage.local.get(['secretKey'], (result) => {
  console.log('Received secret key from storage');
  secretKey = result.secretKey;
});

function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

function decryptMessage(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Encrypt outgoing messages
document.addEventListener('submit', function(event) {
  const messageInput = document.querySelector('div[data-testid="dmComposerTextInput"]');
  if (messageInput) {
    console.log('Encrypting outgoing message');
    const originalText = messageInput.textContent;
    messageInput.textContent = encryptMessage(originalText);
  }
}, true);

// Decrypt incoming messages
function decryptDisplayedMessages() {
  const messageElements = document.querySelectorAll('div[data-testid="tweetText"]');
  messageElements.forEach(el => {
    const decrypted = decryptMessage(el.textContent);
    if (decrypted) {
      el.textContent = decrypted;
    }
  });
}

// Run decryption periodically and on DOM changes
setInterval(decryptDisplayedMessages, 1000);

// MutationObserver to watch for new messages
const observer = new MutationObserver(decryptDisplayedMessages);
observer.observe(document.body, { childList: true, subtree: true });