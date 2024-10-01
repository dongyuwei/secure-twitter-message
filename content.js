const CryptoJS = require('crypto-js');

// Encrypt
const ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
console.log(11, ciphertext);


// Decrypt
const bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
const originalText = bytes.toString(CryptoJS.enc.Utf8);

console.log(22, originalText); // 'my message'