import _ from 'lodash'
import { isString } from './calculations.js'

// With this set to 1, actions will occur immediately, as if they were not potential-based actions
export const POTENTIALS_TO_EXECUTE = 1

export function blankCard(
	taskId,
	name,
	color,
	created,
	deck = [],
	parents = [],
	height = undefined,
	width = undefined
) {
	let newCard = {
		taskId,
		color,
		deck,
		name: typeof name !== 'string' ? 'invalid filename' : name.trim(),
		address: '',
		bolt11: '',
		book: {},
		boost: 0,
		priorities: [],
		subTasks: [],
		completed: [],
		parents: parents,
		claimed: [],
		passed: [],
		signed: [],
		guild: false,
		created: created,
		lastClaimed: 0,
		payment_hash: '',
		highlights: [],
		seen: [],
		time: [],
		grid: height >= 1 && width >= 1 ? blankGrid(height, width) : false,
		allocations: [],
	}
	return newCard
}

export function blankGrid(height = 3, width = 3) {
	let newGrid = {
		height: height,
		width: width,
		rows: {},
	}
	return newGrid
}

// Returns the task with the given taskId from the given list of tasks, or null
export function getTask(tasks, taskId) {
	let result = null
	tasks.some(task => {
		if (task.taskId === taskId) {
			result = task
		}
	})
	return result
}

// Returns true if the given taskId matches an existing task/card in the state/database
// The state should match the database exactly,
// because it is sourced from the database via the deterministic event mutations in mutations.js
export function taskExists(tasks, taskId) {
	return tasks.some(task => task.taskId === taskId)
}

// Marks the task as seen by the given memberId
export function seeTask(task, memberId) {
	if (!task.seen) {
		task.seen = []
	}
	if (
		!task.seen.some(t => {
			return t.memberId === memberId
		})
	) {
		task.seen.push({ memberId: memberId, timestamp: Date.now() })
	}
}

// Clears any pending passes to the specified memberId from the task
// This is done whenever a member accepts a pass or grabs or handles a card
export function clearPassesTo(task, memberId, alsoClearFrom = false) {
	task.passed = _.filter(
		task.passed,
		d => d[1] !== memberId || (alsoClearFrom ? d[0] !== memberId : false)
	)
}

// Grabs a task, adding it to the member's deck
// The associated pending pass on the card, if any, will be removed
// You cannot grab your own member card
export function grabTask(task, memberId) {
	clearPassesTo(task, memberId)
	if (memberId && task.deck.indexOf(memberId) === -1) {
		if (task.taskId !== memberId) {
			task.deck.push(memberId)
		}
	}
}

// Drops the task, removing it from the member's deck
export function dropTask(task, memberId) {
	task.deck = _.filter(task.deck, d => d !== memberId)
}

// Adds the given taskId to list of th card's parents (this is a cache)
export function addParent(task, parentId) {
	if (!_.has(task, 'parents') || !Array.isArray(task.parents)) {
		task.parents = []
	}
	if (!task.parents.some(pId => pId === parentId)) {
		task.parents.push(parentId)
	}
}

// Removes the given taskId from the priorities, subTasks, and completed of the given task
// Does NOT remove the taskId from the grid
export function filterFromSubpiles(task, taskId) {
	const start = [
		task?.priorities?.length || null,
		task?.subTask?.length || null,
		task?.completed?.length || null,
	]

	task.priorities = _.filter(task.priorities, stId => stId !== taskId)
	task.subTasks = _.filter(task.subTasks, stId => stId !== taskId)
	task.completed = _.filter(task.completed, stId => stId !== taskId)

	if (
		(start[0] !== null && start[0] - task?.priorities?.length > 0) ||
		(start[1] !== null && start[1] - task?.subTasks?.length > 0) ||
		(start[2] !== null && start[2] - task?.completed?.length > 0)
	) {
		return true
	}
	return false
}

// Marks as unseen (clears seen from) the given task, unless it's on the list
// Unseens bubble-up one level, but if you've seen the child, it doesn't affect you
export function clearSeenExcept(task, exceptionMemberIds) {
	if (task?.seen?.length >= 1) {
		task.seen = task.seen.filter(userseen =>
			exceptionMemberIds.includes(userseen.memberId)
		)
	}
}

// Re-adds the given taskId to the given card's subTasks (moving it to the end)
// This will move it to the top/front of the list of cards in the GUI
export function addSubTask(task, subTaskId) {
	task.subTasks = _.filter(task.subTasks, tId => tId !== subTaskId)
	task.subTasks.push(subTaskId)
}

// Re-adds the given taskId to the given card's priorities (moving it to the end)
// This will move it to the top/front of the list of cards in the GUI
export function addPriority(task, taskId) {
	task.priorities = _.filter(task.subTasks, tId => tId !== taskId)
	task.priorities.push(taskId)
}

// Adds the given taskId to the given card's stash of the specified level
// Each membership level added to a card has a corresponding stash level
export function stashTask(task, taskId, level) {
	if (
		!_.has(task, 'stash') ||
		!(
			typeof task.stash === 'object' &&
			task.stash !== null &&
			!Array.isArray(task.stash)
		)
	) {
		task.stash = {}
	}
	if (!_.has(task.stash, level)) {
		task.stash[level] = []
	}
	task.stash[level] = _.filter(task.stash[level], tId => tId !== taskId)
	task.stash[level].push(taskId)
}

// A potentials list is a list of signatures, each signature endorsing a specific task event-type
// When POTENTIALS_TO_EXECUTE potentials accrue for a given event-type it is executed, like an action potential
// This allows built-in AO mutations to be voted upon by members before execution
// Because it is a vote, duplicate potentials for the same event-type are prevented
export function addPotential(member, signature) {
	if (!member.potentials) {
		member.potentials = []
	}

	member.potentials = member.potentials.filter(
		pot =>
			!(
				pot.opinion === signature.opinion && pot.memberId === signature.memberId
			)
	)

	member.potentials.push(signature)
}

// Returns true if there are POTENTIALS_TO_EXECUTE or more potentials of the specified event-type on the object
export function checkPotential(member, eventType) {
	return (
		member.potentials.filter(pot => pot.opinion === eventType).length >=
		POTENTIALS_TO_EXECUTE
	)
}

// Clears all potentials of the specified event-type from the given card
export function clearPotential(member, eventType) {
	member.potentials = member.potentials.filter(pot => pot.opinion !== eventType)
}

// Sets the lastUsed property of the given object to the given timestamp
export function updateLastUsed(member, timestamp) {
	member.lastUsed = timestamp
}

export function safeMerge(cardA, cardZ) {
	if (!cardA || !cardZ) {
		console.log('attempt to merge nonexistent card')
		return
	}

	if (!cardZ.taskId || !isString(cardZ.taskId)) {
		console.log('attempt to merge card with a missing or invalid taskId')
		return
	}

	if (!cardZ.color) {
		console.log('attempt to merge card without a color')
		return
	}

	if (isString(cardZ.color) && !_.isEmpty(cardZ.color.trim())) {
		cardA.color = cardZ.color
	}

	if (isString(cardZ.guild) && !_.isEmpty(cardZ.guild.trim())) {
		cardA.guild = cardZ.guild
	}

	const filterNull = tasks => {
		return tasks.filter(task => task !== null && task !== undefined)
	}

	cardA.book = cardZ.book
	cardA.address = cardZ.address
	cardA.bolt11 = cardZ.bolt11
	cardA.priorities = [
		...new Set(cardA.priorities.concat(filterNull(cardZ.priorities))),
	]
	cardA.subTasks = [
		...new Set(cardA.subTasks.concat(filterNull(cardZ.subTasks))),
	]
	cardA.completed = [
		...new Set(cardA.completed.concat(filterNull(cardZ.completed))),
	]
	if (cardZ.grid && cardZ.grid.height >= 1 && cardZ.grid.width >= 1) {
		if (!cardA.grid) {
			cardA.grid = { rows: {}, height: 1, width: 1 }
		}

		cardA.grid.height = Math.max(cardA.grid.height, cardZ.grid.height)
		cardA.grid.width = Math.max(cardA.grid.width, cardZ.grid.width)
		if (_.has(cardZ, 'grid.rows')) {
			Object.entries(cardZ.grid.rows).forEach(([x, row]) => {
				const filteredRow = {}

				Object.entries(row).forEach(([y, stId]) => {
					if (stId !== null && stId !== undefined) {
						filteredRow[y] = stId
					}
				})

				if (Object.keys(filteredRow).length >= 1) {
					if (!cardA.grid.rows) {
						cardA.grid.rows = {}
					}
					cardA.grid.rows[x] = filteredRow
				}
			})
			if (Object.keys(cardA.grid.rows).length < 1) {
				cardA.grid = false
			}
		}
	}
	cardA.passed = [...new Set(cardA.passed.concat(filterNull(cardZ.passed)))]
	// XXX only add in merge for now
	// XXX bolt11 / address need to clearly indicate origin ao
	// XXX book should be a list?
}

// A card's .signed is an append-only list of all signing events.
// This function reduces it to just each member's current opinion
// signed is type Signature[]
export function mostRecentSignaturesOnly(signed) {
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

// Signed is type Signature[]
export function countCurrentSignatures(signed) {
	return mostRecentSignaturesOnly(signed).filter(
		signature => signature.opinion >= 1
	).length
}
