import config from '../../configuration.js'
import { loadMeme } from './files.js'
import YoutubeDlWrap from 'youtube-dl-wrap'

const youtubeDlWrap = new YoutubeDlWrap(config.memes.videoCacher)

export async function cache(url, taskId) {
	if (!config.memes.dir || !config.memes.videoCacher) {
		console.log(
			'No memes directory or videoCacher specified in configuration.js. See readme.'
		)
	}
	let stdout = await youtubeDlWrap.execPromise([
		url,
		'-f',
		'best',
		'-o',
		config.memes.dir + '/%(title)s-%(uploader)s-%(id)s.%(ext)s',
	])
	console.log('stdout type is', typeof stdout, 'and contents is', stdout)

	// Extract filename from returned console output (event listener method is more elegant)
	let newFilename
	let newPath
	try {
		const query = 'Destination: (.+)'
		const regex = new RegExp(query, 'i')
		const matched = regex.exec(stdout)
		console.log('matched path is ', matched)
		if (matched.length >= 2) {
			newPath = matched[1]
			const parts = newPath.split('/')
			newFilename = parts[parts.length - 1]
		}
	} catch (err) {}

	if (newPath && newFilename) {
		loadMeme(newFilename, newPath, taskId)
	} else {
		console.log('Meme was uploaded, but failed to add it to a card')
	}
}
