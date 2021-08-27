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

function pluralize(word) {
	let plural = word
	console.log('pluralize')
	if (Array.isArray(plural)) {
		console.log('word is array')
		plural = plural[1]
		console.log('plural was an array but is now ', plural)
	} else {
		if (plural[plural.length - 1] === 's') {
			plural = plural + 'es'
		} else {
			plural = plural + 's'
		}
	}
	return plural
}

export function gloss(wordOrSentence, plural = false) {
	let result
	console.log('wordOrSentence is ', wordOrSentence)
	if (wordOrSentence.indexOf(' ') < 0) {
		console.log('tripped 1')
		const word = wordOrSentence

		result = word
		const lowercase = word.toLowerCase()
		const pluralEntry = Object.entries(serverGlossary).find(
			([keyword, synonym]) => {
				return (
					(Array.isArray(keyword) && keyword[1] === lowercase) ||
					pluralize(keyword) === lowercase
				)
			}
		)
		console.log(word, 'isPlural is', pluralEntry)
		const singularEntry = Object.entries(serverGlossary).find(
			([keyword, synonym]) =>
				(Array.isArray(keyword) && keyword[0] === lowercase) ||
				keyword === lowercase
		)
		console.log(word, 'isSingular is', singularEntry)
		if (pluralEntry || singularEntry) {
			result = pluralEntry ? pluralize(pluralEntry[1]) : singularEntry[1]
			if (Array.isArray(result)) {
				result = result[0]
			}
			if (word[0].toLowerCase() !== word[0]) {
				result = result[0].toUpperCase() + result.substring(1)
			}
		}
	} else {
		console.log('tripped 2')
		result = wordOrSentence
		console.log('serverGlossary is', serverGlossary)
		Object.entries(serverGlossary).forEach(([keyword, synonym]) => {
			let pluralKeyword = pluralize(keyword)
			let pluralSynonym = pluralize(synonym)
			console.log('before replace. result is', result)

			let regexp = new RegExp(pluralKeyword, 'gi')
			result = result.replace(regexp, pluralSynonym)
			console.log('after first replace. result is', result)
			// if (result === firstReplace) {
			regexp = new RegExp(keyword, 'gi')
			const singularSynonym = Array.isArray(synonym) ? synonym[0] : synonym
			result = result.replace(regexp, singularSynonym)
		})
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
