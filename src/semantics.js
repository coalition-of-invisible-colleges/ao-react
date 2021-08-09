import config from '../configuration.js'

const defaultSemantics = {
	glossary: {
		card: 'card',
		guild: 'mission',
		user: 'member',
		username: 'hackername',
		proposal: 'proposition',
		avatar: 'avatar',
	},
	levels: {
		0: 'guest',
		1: 'member',
		2: 'elite member',
	},
}

let loadedGlossary = {}
if (config.semantics && config.semantics.glossary) {
	loadedGlossary = config.semantics.glossary
}
const serverGlossary = { ...defaultSemantics.glossary, ...loadedGlossary }
export function gloss(word) {
	let result = word
	const lowercase = word.toLowerCase()
	if (serverGlossary.hasOwnProperty(lowercase)) {
		result = serverGlossary[lowercase]
	}
	if (word[0].toLowerCase() !== word[0]) {
		result = result[0].toUpperCase() + result.substring(1)
	}
	return result
}

let loadedLevels = {}
if (config.semantics && config.semantics.levels) {
	loadedLevels = config.semantics.levels
}
const serverLevels = { ...defaultSemantics.levels, ...loadedLevels }

export function glossLevel(level) {
	if (level < 0) {
		return null
	}
	let highestMatchingWord
	Object.entries(serverLevels).some(([index, word]) => {
		if (index <= level) {
			highestMatchingWord = word
		}
		if (index >= level) {
			return true
		}
	})
	return highestMatchingWord || 'member'
}

export function getSemantics() {
	return { glossary: serverGlossary, levels: serverLevels }
}
