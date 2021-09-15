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
	if (Array.isArray(plural)) {
		plural = plural[1]
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
	if (wordOrSentence.indexOf(' ') < 0) {
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
		const singularEntry = Object.entries(serverGlossary).find(
			([keyword, synonym]) =>
				(Array.isArray(keyword) && keyword[0] === lowercase) ||
				keyword === lowercase
		)
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
		result = wordOrSentence
		Object.entries(serverGlossary).forEach(([keyword, synonym]) => {
			let pluralKeyword = pluralize(keyword)
			let pluralSynonym = pluralize(synonym)

			let regexp = new RegExp(pluralKeyword, 'gi')
			result = result.replace(regexp, pluralSynonym)
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
