import config from '../../configuration.js'
import path from 'path'
import fs from 'fs'
import FileType from 'file-type'
import events from './events.js'
import { createHash } from '../crypto.js'
import state from './state.js'
const serverState = state.serverState

export function scanMemes() {
	const homeDir =
		process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
	const memeFolder = config.memes.dir
	console.log('\nmemeFolder is ', memeFolder)

	fs.readdir(memeFolder, function (err, files) {
		if (err) {
			return console.log('Failed to scan memes: ' + err)
		}
		console.log('\nfolder contains ', files.length, ' memes')
		files.forEach(filename => {
			// console.log(filename)
			const filepath = path.join(memeFolder, filename)
			fs.readFile(filepath, (err, data) => {
				if (err) {
					console.log('Directory or other error-causing file found, ignoring')
					return
				}
				addMeme(filename, filepath, data)
			})
		})
	})
}

export function addMeme(name, path, data = null) {
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

	const hash = createHash(data)
	const lastIndex = name.lastIndexOf('.')
	const filetype = lastIndex < 0 ? '' : name.substr(lastIndex + 1)

	console.log(`${hash} ${name}`)
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
