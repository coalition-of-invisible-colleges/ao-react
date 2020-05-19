const path = require('path')
const fs = require('fs')
const FileType = require('file-type')
const events = require('./events')
const crypto = require('../crypto')
const { serverState } = require('./state')

function scanMemes() {
	const homeDir =
		process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
	const memeFolder = path.join(homeDir, '.ao/memes')
	console.log('\nmemeFolder is ', memeFolder)

	fs.readdir(memeFolder, function(err, files) {
		if (err) {
			return console.log('Failed to scan memes: ' + err)
		}
		console.log('\nfolder contains ', files.length, ' memes')
		files.forEach(filename => {
			console.log(filename)
			const filepath = path.join(memeFolder, filename)
			fs.readFile(filepath, (err, data) => {
				if (err) throw err
				const hash = crypto.createHash(data)
				const filetype = 'jpg' //Promise.all(FileType.fromFile(filepath)).then(() => {

				console.log(
					'file data loaded. filepath: ',
					filepath,
					' and data: ',
					data,
					' and hash: ',
					hash
				)
				const foundMeme = serverState.memes.find(m => {
					return m.hash === hash
				})
				if (!foundMeme) {
					events.memeAdded(filename, hash, filetype, (err, event) => {
						console.log(
							'\n\n\nmeme-added callback\n\nerr: ',
							err,
							'\n event: ',
							event,
							'\n\n'
						)
					})
				}
			})
		})
	})
}

module.exports = { scanMemes }
