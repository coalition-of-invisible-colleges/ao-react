import crypto from 'crypto'

export function createHash(payload) {
	let sha256 = crypto.createHash('sha256')
	sha256.update(payload)
	return sha256.digest('hex')
}

export function hmacHex(data, signingKey) {
	let hmac = crypto.createHmac('sha256', signingKey)
	hmac.update(data)
	return hmac.digest('hex')
}

export function derivePublicKey(p) {
	return crypto.createPublicKey(p).export({
		type: 'spki',
		format: 'pem',
	})
}

export function encryptToPublic(pub, info) {
	return crypto.publicEncrypt(pub, Buffer(info)).toString('hex')
}

export function decryptFromPrivate(priv, hiddenInfo) {
	return crypto
		.privateDecrypt(priv, Buffer.from(hiddenInfo, 'hex'))
		.toString('latin1')
}
