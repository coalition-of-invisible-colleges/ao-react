let PORT = process.env.PORT || 8003

const path = require('path')
const config = require('../configuration')
const { AoDb } = require('./server/aoDb')
const { AoState } = require('./server/aoState')
const argv = require('yargs').argv

verifyAndLoadDb()

function verifyAndLoadDb() {
	if (!argv || !argv.hasOwnProperty('_') || argv._.length < 1) {
		console.log(
			'please specific database name, e.g., "npm run verifyDb database.sqlite3"'
		)
		console.log('databases are stored in ~/.ao/')
		console.log(
			'syntax for other arguments is e.g., "npm run verifyDb database1.sqlite3 -- --mergeFrom=database2.sqlite3"'
		)
		return
	}
	const dbName = argv._[0]
	const homeDir =
		process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
	const dbPath = path.join(homeDir, '.ao', dbName)

	console.log('loading db ', dbPath)
	let database1 = new AoDb(dbPath, false)
	if (typeof database1 === 'string') {
		console.log('error loading database: ', err)
		return
	}
	console.log('loaded db')

	console.log('modeling state...')
	let state1 = new AoState(database1)
	console.log('state initialized')

	displayAoStats(state1)

	if (argv.hasOwnProperty('mergeFrom')) {
		const dbName2 = argv.mergeFrom
		const dbPath2 = path.join(homeDir, '.ao', dbName2)

		console.log('\nloading second db ', dbPath2)
		let database2 = new AoDb(dbPath2, false)
		if (typeof database2 === 'string') {
			console.log('error loading database: ', err)
			return
		}
		console.log('loaded db')

		console.log('modeling state...')
		let state2 = new AoState(database2)
		console.log('state initialized')

		displayAoStats(state2)
	}
	// const serverReactions = database1.changeFeed.onValue(ev => {
	// 	state.applyEvent(state.serverState, ev)
	// })
	console.log('')
}

function displayAoStats(aoState) {
	console.log('\nthis AO database contains:\n')
	console.log('total tasks/cards: ', aoState.serverState.tasks.length)
	let cardCount = []
	let unheldCardCount = 0
	let deletedMembers = []
	aoState.serverState.tasks.forEach((task, i) => {
		if (task.deck.length <= 0) {
			unheldCardCount++
		}
		task.deck.forEach(memberId => {
			if (!cardCount.hasOwnProperty(memberId)) {
				cardCount[memberId] = 0
			}
			cardCount[memberId]++
		})
	})
	console.log('  unheld cards: ', unheldCardCount + '\n')

	console.log('members: ', aoState.serverState.members.length)
	aoState.serverState.members.forEach((member, i) => {
		console.log(
			'  ' +
				i.toString() +
				'. ' +
				member.name +
				': ' +
				(cardCount[member.memberId] ? cardCount[member.memberId] : 0) +
				(cardCount[member.memberId] && cardCount[member.memberId] === 1
					? ' card'
					: ' cards')
		)
	})
	let ghostMembers = Object.keys(cardCount).filter(memberId => {
		return !aoState.serverState.members.some(member => {
			return member.memberId === memberId
		})
	})
	console.log('\nghost members: ', ghostMembers.length)
	ghostMembers.forEach((memberId, i) => {
		console.log(
			'  ' +
				i.toString() +
				'. ' +
				memberId +
				': ' +
				(cardCount[memberId] ? cardCount[memberId] : 0) +
				(cardCount[memberId] && cardCount[memberId] === 1 ? ' card' : ' cards')
		)
	})
}
