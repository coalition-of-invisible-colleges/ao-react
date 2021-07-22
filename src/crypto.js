import CryptoES from 'crypto-es'

export function createHash(payload) {
  let sha256 = CryptoES.SHA256(payload)
  return sha256.toString(CryptoES.enc.Hex)
}

export function hmacHex(data, signingKey) {
  let hmac = CryptoES.HmacSHA256(data, signingKey)
  return hmac.toString(CryptoES.enc.Hex)
}
