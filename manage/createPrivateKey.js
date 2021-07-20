const crypto = require('crypto')
function genNewPrivKey(callback){
    crypto.generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
      },
      privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
      }
    }, callback)
}

genNewPrivKey((err, pubkey, privkey) => {
    console.log(privkey)
})
