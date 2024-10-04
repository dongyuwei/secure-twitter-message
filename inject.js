(function hookXhrOpen(open) {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        this._url = arguments[1];
        originalOpen.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);

(function hookXhrSend(send) {
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function (body) {
        const url = this._url; // Capture the URL
        if (url && url.includes('/dm/new2.json') && body) {
            const secretKey = localStorage.getItem('twitterSecretMsgKey');
            const requestBody = JSON.parse(body);

            // Encrypt the message
            const encryptedMessage = CryptoJS.AES.encrypt(requestBody.text, secretKey).toString();
            requestBody.text = encryptedMessage;

            // Modify the request body with the encrypted message
            arguments[0] = JSON.stringify(requestBody);
            originalSend.apply(this, arguments);
        } else {
            originalSend.apply(this, arguments);
        }
    };
})(XMLHttpRequest.prototype.send);

const decryptMessage = (encrypted) => {
    try {
        const secretKey = localStorage.getItem('twitterSecretMsgKey');
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    } catch (error) {
        // console.error('Decryption failed:', error);
        return null;
    }
};

// Decrypt incoming messages
function _decryptDisplayedMessages(messageElements) {
    messageElements.forEach(el => {
        if (!el.classList.contains('decrypted') && el.textContent) {
            const decrypted = decryptMessage(el.textContent);
            if (decrypted) {
                el.textContent = decrypted;
                el.classList.add('decrypted')
            }
        }
    });
}

function decryptDisplayedMessages() {
    const messageElements = document.querySelectorAll('div[role="presentation"] div[data-testid="tweetText"]');
    const messageElements2 = document.querySelectorAll('div[data-testid="DMDrawer"] span[data-testid="tweetText"]');
    _decryptDisplayedMessages(messageElements);
    _decryptDisplayedMessages(messageElements2);
}

// Run decryption periodically and on DOM changes
setInterval(decryptDisplayedMessages, 1000);
