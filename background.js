console.log('Background script loaded');

function generateSecretKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

chrome.runtime.onInstalled.addListener(() => {
  const secretKey = generateSecretKey();
  chrome.storage.local.set({ secretKey }, () => {
    console.log('Secret key generated and saved');
  });
});