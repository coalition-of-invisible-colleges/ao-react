import api from './client/api'
import aoStore, { Task, Signature } from './client/store'
import { hideAll as hideAllTippys } from 'tippy.js'

export type CardZone =
	| 'card'
	| 'priorities'
	| 'grid'
	| 'subTasks'
	| 'completed'
	| 'context'
	| 'discard'
	| 'panel'
	| 'gifts'

export interface Coords {
	x?: number
	y: number
}

export interface CardLocation {
	taskId: string
	inId: string
	zone: CardZone
	coords: Coords
}

export interface CardPlay {
	from: CardLocation
	to: CardLocation
}

export function goInCard(taskId: string, isContext = false, doNotSave = false) {
	hideAllTippys()
	aoStore.closeAllCloseables()

	console.log('goInCard taskId is ', taskId)
	if (isContext) {
		aoStore.clearContextTo(taskId)
	} else if (aoStore.currentCard) {
		if (!doNotSave) {
			aoStore.addToContext([aoStore.currentCard])
		}
	}
	aoStore.setCurrentCard(taskId)
	aoStore.removeFromContext(taskId)
}

export function goUp() {
	if (aoStore.contextCards && aoStore.contextCards.length >= 1) {
		const go = aoStore.contextCards[0]
		if (go) {
			goInCard(go.taskId, true)
		}
	} else if (aoStore.contextCards.length < 1) {
		hideAllTippys()
		aoStore.closeAllCloseables()

		aoStore.setCurrentCard(null)
	}
}

export function prioritizeCard(move: CardPlay) {
	if (!move.from.taskId) {
		return
	}
	const nameFrom = aoStore.hashMap.get(move.from.taskId).name

	switch (move.from.zone) {
		case 'card':
			api.findOrCreateCardInCard(nameFrom, move.to.inId, true)
			break
		case 'priorities':
			if (move.from.inId === move.to.inId) {
				api.prioritizeCard(move.from.taskId, move.from.inId)
			} else {
				api.findOrCreateCardInCard(nameFrom, move.to.inId, true)
			}
			break
		case 'grid':
			if (move.from.inId === move.to.inId) {
				api
					.unpinCardFromGrid(
						move.from.coords.x,
						move.from.coords.y,
						move.from.inId
					)
					.then(result => {
						api.prioritizeCard(move.from.taskId, move.to.inId)
					})
			} else {
				api.prioritizeCard(move.from.taskId, move.to.inId)
			}
			break
		case 'completed':
		case 'completed':
			api.prioritizeCard(move.from.taskId, move.to.inId)
			break
		case 'discard':
			aoStore.popDiscardHistory()
		case 'subTasks':
		case 'context':
		case 'panel':
			api.findOrCreateCardInCard(nameFrom, move.to.inId, true)
			break
		default:
			break
	}
}

export function subTaskCard(move: CardPlay) {
	if (!move.from.taskId) {
		return
	}
	const nameFrom = aoStore.hashMap.get(move.from.taskId).name

	switch (move.from.zone) {
		case 'card':
			api.findOrCreateCardInCard(nameFrom, move.to.inId)
			break
		case 'priorities':
			if (move.from.inId) {
				api
					.refocusCard(move.from.taskId, move.from.inId)
					.then(() => api.findOrCreateCardInCard(nameFrom, move.to.inId))
			} else {
				api.findOrCreateCardInCard(nameFrom, move.to.inId)
			}
			break
		case 'grid':
			api
				.unpinCardFromGrid(
					move.from.coords.x,
					move.from.coords.y,
					move.from.inId
				)
				.then(res => {
					api.findOrCreateCardInCard(nameFrom, move.to.inId)
				})
			break
		case 'discard':
			aoStore.popDiscardHistory()
		case 'completed':
		case 'subTasks':
		case 'context':
		case 'panel':
			api.findOrCreateCardInCard(nameFrom, move.to.inId)
			break
		default:
			break
	}
}

// Crawls through all cards, starting with the given task
// Return all parents of the card that you are hodling
export function allReachableHeldParents(origin: Task): Task[] {
	if (!origin.hasOwnProperty('taskId')) {
		return []
	}
	let queue: Task[] = [origin]
	let reachableCards: Task[] = []

	let visited = {}
	visited[origin.taskId] = true
	let i = 0
	while (queue.length >= 1) {
		let task = queue.pop()
		if (
			task === undefined ||
			task.subTasks === undefined ||
			task.priorities === undefined ||
			task.completed === undefined
		) {
			console.log('Invalid task found during returned cards search, skipping.')
			continue
		}

		if (
			task.deck.indexOf(aoStore.memberCard.taskId) < 0 &&
			task.taskId !== aoStore.member.memberId
		) {
			continue
		}

		reachableCards.push(task)
		if (task.hasOwnProperty('parents') && task.parents.length >= 1) {
			let parents = []
			task.parents.forEach(tId => {
				if (aoStore.hashMap.get(tId)) {
					parents.push(aoStore.hashMap.get(tId))
				}
			})
			parents.forEach(st => {
				if (!st.hasOwnProperty('taskId')) {
					console.log('Missing parent found during returned cards search.')
					return
				}
				if (!visited.hasOwnProperty(st.taskId)) {
					visited[st.taskId] = true
					queue.push(st)
				}
			})
		}
	}

	return reachableCards
}

// Returns the specified number of lost cards
export function findOrphans(count: number) {
	let found = 0
	return aoStore.state.tasks.filter(t => {
		if (found >= count) {
			return false
		}

		if (!t.hasOwnProperty('taskId')) {
			console.log('Broken card found while search for returned cards.')
			return false
		}

		if (t.deck.indexOf(aoStore.member.memberId) < 0) {
			return false
		}

		if (t.taskId === t.name) {
			return false
		}

		if (t.guild && t.guild.length >= 1) {
			return false
		}

		if (t.book && t.book.startTs) {
			return false
		}

		if (t.name === 'community hub') {
			return false
		}

		const dockCardName = aoStore.member.memberId + '-bookmarks'
		if (t.name === dockCardName) {
			return false
		}

		let parents = allReachableHeldParents(t)

		let anchorCards: Task[] = [aoStore.memberCard].concat(
			aoStore.myGuilds,
			aoStore.myEvents
		)

		if (
			parents.some(st => {
				return anchorCards.some(at => at.taskId === st.taskId)
			})
		) {
			return false
		}
		found++
		return true
	})
}

export function findFirstCardInCard(card: Task) {
	if (card.priorities && card.priorities.length >= 1) {
		const nextCard = aoStore.hashMap.get(
			card.priorities[card.priorities.length - 1]
		)
		if (nextCard) {
			return nextCard
		}
	}

	const sortRows = (a, b) => {
		const [indexA] = a
		const [indexB] = b

		return indexB - indexA
	}

	const sortColumns = (a, b) => {
		const [indexA] = a
		const [indexB] = b

		return indexA - indexB
	}

	let nextCard
	if (card.grid && card.grid.rows) {
		Object.entries(card.grid.rows)
			.sort(sortRows)
			.some(([y, row]) => {
				Object.entries(row)
					.sort(sortColumns)
					.some(([x, cell]) => {
						if (cell) {
							nextCard = aoStore.hashMap.get(cell)
							return !!nextCard
						}
						return false
					})
			})
	}
	if (nextCard) {
		return nextCard
	}

	if (card.subTasks && card.subTasks.length >= 1) {
		const nextCard = aoStore.hashMap.get(
			card.subTasks[card.subTasks.length - 1]
		)
		if (nextCard) {
			return nextCard
		}
	}

	return null
}

// A card's .signed is an append-only list of all signing events.
// This function reduces it to just each member's current opinion
export function mostRecentSignaturesOnly(signed: Signature[]) {
	let mostRecentSignaturesOnly = signed.filter((signature, index) => {
		let lastIndex
		for (let i = signed.length - 1; i >= 0; i--) {
			if (signed[i].memberId === signature.memberId) {
				lastIndex = i
				break
			}
		}
		return lastIndex === index
	})
	return mostRecentSignaturesOnly
}

export function countCurrentSignatures(signed: Signature[]) {
	return mostRecentSignaturesOnly(signed).filter(
		signature => signature.opinion >= 1
	).length
}

export function countVouches(memberId: string) {
	const card = aoStore.hashMap.get(memberId)
	if (!card || !card.hasOwnProperty('deck')) return null

	let count = 0

	const memberCards = card.deck
		.map(memberId => aoStore.hashMap.get(memberId))
		.forEach(memberCard => {
			if (memberCard !== undefined) {
				count++
			}
		})

	return count
}
