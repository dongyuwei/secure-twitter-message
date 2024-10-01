console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  const secretKey = generateSecretKey();
  console.log('Generated secret key:', secretKey);
  chrome.storage.local.set({ secretKey }, () => {
    console.log('Secret key saved to storage');
  });
});

function generateSecretKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'getSecretKey') {
    chrome.storage.local.get(['secretKey'], (result) => {
      console.log('Sending secret key:', result.secretKey);
      sendResponse({ secretKey: result.secretKey });
    });
    return true; // Indicates we will send a response asynchronously
  }
});