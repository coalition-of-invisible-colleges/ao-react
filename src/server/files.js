const config = require('../../configuration')
const path = require('path')
const fs = require('fs')
const FileType = require('file-type')
const events = require('./events')
const crypto = require('../crypto')
const { serverState } = require('./state')

function scanMemes() {
	const homeDir =
		process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
	const memeFolder = config.memes.dir
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
				if (err) {
					console.log('Directory or other error-causing file found, ignoring')
					return
				}
				addMeme(data, filename, filepath)
			})
		})
	})
}

function addMeme(name, path, data = null) {
	if (!data) {
		fs.readFile(path, (err, data) => {
			if (err) {
				console.log('Directory or other error-causing file found, ignoring')
				return
			}
			if (data) {
				addMeme(name, path, data)
				return
			}
		})
		return
	}

	const hash = crypto.createHash(data)
	const filetype = 'jpg' //Promise.all(FileType.fromFile(filepath)).then(() => {

	console.log(
		'file data loaded. path: ',
		path,
		' and data: ',
		data,
		' and hash: ',
		hash
	)
	const foundMeme = serverState.memes.find(m => {
		return m.hash === hash
	})
	if (!foundMeme) {
		events.memeAdded(name, hash, filetype, (err, event) => {
			console.log(
				'\n\n\nmeme-added callback\n\nerr: ',
				err,
				'\n event: ',
				event,
				'\n\n'
			)
		})
		return
	}
	return
}

module.exports = { scanMemes, addMeme }
