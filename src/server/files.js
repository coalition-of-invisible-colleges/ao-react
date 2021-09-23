import config from '../../configuration.js'
import path from 'path'
import fs from 'fs'
import FileType from 'file-type'
import events from './events.js'
import { createHash } from '../crypto.js'
import state from './state.js'
import v1 from 'uuid'
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
			loadMeme(filename, filepath)
		})
	})
}

export function loadMeme(name, path, taskId = null) {
	fs.readFile(path, (err, data) => {
		if (err) {
			console.log('Directory or other error-causing file found, ignoring')
			return
		}
		addMeme(name, path, data, taskId)
	})
}

export async function addMeme(name, path, data = null, taskId = null) {
	console.log('addMeme function')
	if (!data) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) {
					console.log('Directory or other error-causing file found, ignoring')
					reject(err)
				} else if (data) {
					console.log('going deeper in addMeme')
					resolve(addMeme(name, path, data))
				} else {
					console.log('readFile failed')
					reject(false)
				}
			})
		})
	}

	const hash = createHash(data)
	const lastIndex = name.lastIndexOf('.')
	const filetype = lastIndex < 0 ? '' : name.substr(lastIndex + 1)

	console.log(`${hash} ${name}`)
	const foundMeme = serverState.memes.find(m => {
		return m.hash === hash
	})
	// console.log('foundMeme is', foundMeme)
	if (foundMeme) {
		// console.log('returning existing meme')
		return Promise.resolve(foundMeme.memeId)
	}

	const newTaskId = taskId || v1()
	// console.log('returning new promise')
	return new Promise((resolve, reject) => {
		events.trigger(
			'meme-added',
			{ taskId: newTaskId, filename: name, hash, filetype },
			(err, event) => {
				// console.log(
				// 	'\n\n\nmeme-added callback\n\nerr: ',
				// 	err,
				// 	'\n event: ',
				// 	event,
				// 	'\n\n',
				// 	'newTaskId: ',
				// 	newTaskId
				// )
				// console.log('newTaskId is about to resolve:', newTaskId)
				resolve(newTaskId)
			}
		)
	})
}
