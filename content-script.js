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
    // console.error('Decryption failed:', error);
    return null;
  }
}

function setupEventListeners() {
  if (!document.body) {
    // If body is not available yet, retry after a short delay
    setTimeout(setupEventListeners, 100);
    return;
  }

  // Capture click events (for send button)
  document.body.addEventListener('click', function(event) {
    const sendButton = event.target.closest('[data-testid="dmComposerSendButton"]');
    if (sendButton) {
      console.log('Send button clicked');
      const messageInput = document.querySelector('[data-testid="dmComposerTextInput"]');
      if (messageInput) {
        console.log('Found message input:', messageInput.textContent);
        const originalText = messageInput.textContent;
        messageInput.textContent = encryptMessage(originalText);
      }
    }
  }, true);

  // Capture keydown events (for Enter key)
  document.body.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {  // Exclude Shift+Enter for newline
      const messageInput = event.target.closest('[data-testid="dmComposerTextInput"]');
      if (messageInput) {
        console.log('Enter pressed in message input');
        const originalText = messageInput.textContent;
        messageInput.textContent = encryptMessage(originalText);
      }
    }
  }, true);

  console.log('Event listeners set up successfully');
}

// Start setting up event listeners
setupEventListeners();

// Decrypt incoming messages
function decryptDisplayedMessages() {
  const messageElements = document.querySelectorAll('div[role="presentation"] div[data-testid="tweetText"]');
  messageElements.forEach(el => {
    if (el.textContent) {
      const decrypted = decryptMessage(el.textContent);
      if (decrypted) {
        el.textContent = decrypted;
      }
    }
  });
}

// Run decryption periodically and on DOM changes
setInterval(decryptDisplayedMessages, 1000);
