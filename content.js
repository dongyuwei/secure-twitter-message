const CryptoJS = require('crypto-js');
const Sodium = require('libsodium-wrappers');

// Encrypt
const ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
console.log(11, ciphertext);


// Decrypt
const bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
const originalText = bytes.toString(CryptoJS.enc.Utf8);

console.log(22, originalText); // 'my message'


(async () => {
    await Sodium.ready;
  
    const { publicKey, privateKey } = Sodium.crypto_box_keypair();
    console.log(1, publicKey, 2, privateKey);
    
  
    const message = 'my secret message';
    const nonce = Sodium.randombytes_buf(Sodium.crypto_box_NONCEBYTES);
  
    const encrypted = Sodium.crypto_box_easy(message, nonce, publicKey, privateKey);
  
    const decrypted = Sodium.crypto_box_open_easy(encrypted, nonce, publicKey, privateKey);
  
    console.log(Sodium.to_string(decrypted)); // 'my secret message'
  })();