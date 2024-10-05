function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file); // URL to the external script
    document.documentElement.appendChild(script);
    script.remove(); // Clean up by removing the script element
}

chrome.storage.local.get(['twitterMessageSecretKey'], (result) => {
    const secretKey = result.twitterMessageSecretKey;
    console.log('secretKey', secretKey)
    localStorage.setItem('twitterSecretMsgKey', secretKey)

    injectScript("crypto-js.4.2.0.min.js");
    injectScript("inject.js");
});


