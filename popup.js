document.getElementById('saveKeyButton').addEventListener('click', function () {
    const secretKey = document.getElementById('secretKeyInput').value.trim();

    if (secretKey) {
        // Store the secret key in Chrome storage
        chrome.storage.local.set({'twitterMessageSecretKey': secretKey}, () => {
            alert('Secret key saved successfully!');
        });
    } else {
        alert('Please enter a valid secret key.');
    }
});

// Load the stored secret key (if available) when the popup opens
chrome.storage.local.get('twitterMessageSecretKey', (result) => {
    if (result.twitterMessageSecretKey) {
        document.getElementById('secretKeyInput').value = result.twitterMessageSecretKey;
    }
});
