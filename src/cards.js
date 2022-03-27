import _ from 'lodash'
import { isString } from './calculations.js'
import v1 from 'uuid'

// With this set to 1, actions will occur immediately, as if they were not potential-based actions
export const POTENTIALS_TO_EXECUTE = 1

// See duplicate of this function in cardTypes.ts
export function blankCard(
	taskId = null,
	name,
	color,
	created,
	deck = [],
	parents = [],
	height = undefined,
	width = undefined
) {
	const newTaskId = !taskId ? v1() : taskId
	let newCard = {
		taskId: newTaskId,
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
		seen: deck.length >= 1 ? [{ memberId: deck[0], created }] : [],
		time: [],
		pins: [],
		pinboard: height >= 1 && width >= 1 ? blankPinboard(height, width) : false,
		allocations: [],
	}
	return newCard
}

const defaultSquareSizeInEms = 9
export function blankPinboard(height = 3, width = 3, spread = 'pyramid') {
	const newGrid = {
	  spread: spread,
		height: height,
		width: width,
		size: defaultSquareSizeInEms,
	}
	return newGrid
}

// Returns the task with the given taskId from the given list of tasks, or null
export function getTask(tasks, taskId) {
	return tasks.find(task => {
		if (task.taskId === taskId) {
			return task
		}
	})
}

// Returns the first task that exactly matches the given value of the given property
export function getTaskBy(tasks, value, property) {
	return tasks.find(task => {
		if (task[property] === value) {
			return task
		}
	})
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
	task.seen = task.seen.filter(seenObject => seenObject.memberId !== memberId)
	task.seen.push({ memberId: memberId, timestamp: Date.now() })
}

// Clears any pending passes to the specified memberId from the task
// This is done whenever a member accepts a pass or grabs or handles a card
export function clearPassesTo(tasks, task, memberId, alsoClearFrom = false) {
  const lengthBefore = task.passed.length
	task.passed = _.filter(
		task.passed,
		d => d[1] !== memberId || (alsoClearFrom ? d[0] !== memberId : false)
	)
	if(lengthBefore != task.passed.length) {
		const memberCard = getTask(tasks, memberId)
	  changeGiftCount(memberCard, task.passed.length - lengthBefore)
	}
}

// Takes a member card and increases or decreases its .giftCount property, adding it if necessary
export function changeGiftCount(memberCard, amount) {
  if(!memberCard.hasOwnProperty('giftCount')) {
    memberCard.giftCount = 0
  }
  
  memberCard.giftCount += amount
  
  if(memberCard.giftCount < 0) {
    memberCard.giftCount = 0
  }
}

// Grabs a task, adding it to the member's deck
// The associated pending pass on the card, if any, will be removed
// You cannot grab your own member card
export function grabTask(tasks, task, memberId) {
	clearPassesTo(tasks, task, memberId)
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

// Adds the given taskId to list of the card's parents (this is a cache)
export function addParent(task, parentId) {
	if (!_.has(task, 'parents') || !Array.isArray(task.parents)) {
		task.parents = []
	}
	if (!task.parents.some(pId => pId === parentId)) {
		task.parents.push(parentId)
	}
}

// Removes the given taskId from the list of the card's parents
// This function seems to make no sense
export function removeParent(task, parentId) {
	if (!_.has(task, 'parents') || !Array.isArray(task.parents)) {
		return
	}
	let gridCells = []
	if (task.pins && task.pins.length >= 1) {
		gridCells = task.pins.map(pin => pin.taskId)
	}

	let stashItems = []
	if (task.stash && Object.keys(task.stash).length >= 1) {
		stashitems = [...Object.values(task.stash)]
	}

	const allSubTasks = [
		...task.priorities,
		...task.subTasks,
		...gridCells,
		...task.completed,
		...stashItems,
	]

	if (!allSubTasks.some(stId => stId === parentId)) {
		task.parents = _.filter(task.parents, tId => tId !== parentId)
	}
}

// Removes the second card from the first card's list of parents,
// unless the card is actuall still a parent
export function removeParentIfNotParent(task, parent) {
	if (
		!_.has(task, 'parents') ||
		!Array.isArray(task.parents) ||
		task.parents.length < 1
	) {
		return
	}
	let gridCells = []
	if (parent.pins && parent.pins.length >= 1) {
		gridCells = parent.pins.map((pin) => pin.taskId)
	}

	let stashItems = []
	if (parent.stash && Object.keys(parent.stash).length >= 1) {
		stashItems = [...Object.values(parent.stash)]
	}

	const allSubTasks = [
		...parent.priorities,
		...parent.subTasks,
		...gridCells,
		...parent.completed,
		...stashItems,
	]

	if (!allSubTasks.some(stId => stId === task.taskId)) {
		task.parents = _.filter(task.parents, tId => tId !== parent.taskId)
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
	discardPriority(task, taskId)
	discardSubTask(task, taskId)
  discardCompletedTask(task, taskId)
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
export function clearSeenExcept(task, exceptionMemberIds = []) {
	if (task?.seen?.length >= 1) {
		task.seen = task.seen.filter(userseen =>
			exceptionMemberIds.includes(userseen.memberId)
		)
	}
}

// Re-adds the given taskId to the given card's subTasks (moving it to the end)
// This will move it to the top/front of the list of cards in the GUI
// Precondition: The subtask referred to by subTaskId exists (otherwise it will create a broken card link / missing reference)
export function addSubTask(task, subTaskId) {
  if(!task) {
    console.log("Attempting to add a subtask to a missing task, this should never happen")
    return
  }
	discardSubTask(task, subTaskId)
	/*if(!task.subTasks) {
	  task.subTasks = []
	}*/
	task.subTasks.push(subTaskId)
}

// Removes the given discardTaskId from the given task's subtasks
function discardSubTask(task, discardTaskId) {
  if(!task || !discardTaskId || !task.subTasks || task.subTasks.length <= 0) return
  task.subTasks = task.subTasks.filter(stId => stId !== discardTaskId)
}

// Removes the given discardTaskId from the given task's completed tasks list
function discardCompletedTask(task, discardTaskId) {
  if(!task || !discardTaskId || !task.completed || task.completed.length <= 0) return
  task.completed = task.completed.filter(stId => stId !== discardTaskId)
}

// Adds a completed task to the completed list in a card or moves it to the top of the list 
function addCompletedTask(task, completedTaskId) {
	discardCompletedTask(task, completedTaskId)
	task.completed.push(completedTaskId)
}

// Adds the subTask to the given new parent task and adds the parent as a parent to the new subTask
export function putTaskInTask(subTask, inTask) {
  addSubTask(inTask, subTask.taskId)
  addParent(subTask, inTask.taskId)
}

// Re-adds the given taskId to the given card's priorities (moving it to the end)
// This will move it to the top/front of the list of cards in the GUI
export function addPriority(task, taskId) {
	discardPriority(task, taskId)
	task.priorities.push(taskId)
}

// Removes the given discardTaskId from the given task's subtasks
function discardPriority(task, discardTaskId) {
  if(!task || !discardTaskId || !task.priorities || task.priorities.length <= 0) return
  task.priorities = task.priorities.filter(stId => stId !== discardTaskId)
}

export function unpinTasksOutOfBounds(task) {
  if(!task.pins || task.pins.length <= 0) {
    return
  }
  const num = task.pins.length
  const horizLimit = task.pinboard.spread === 'pyramid' ? task.pinboard.height : task.pinboard.width
  task.pins.forEach(pin => {
    const {taskId, y, x} = pin
    if (x >= horizLimit || y >= task.pinboard.height) {
      unpinTaskFromTask(task, { y: y, x: x})
      addSubTask(task, taskId)
    }
  })
  //console.log("upinned", num - task.pins.length, 'tasks')
}

// Unpins the card from the given coordinates in a card and returns its taskId
function unpinTaskFromTask(task, coords) {
  let result
  if(!task.pins || task.pins.length <= 0) {
    return null
  }
  task.pins.some((pin, i) => {
    const { pinId, y, x } = pin
    if(y == coords.y && x == coords.x) {
      result = task.pins.splice(i, 1)[0]
    }
  })
  return result
}

// Precondition: The spec should validate whether this is a legal move based upon the current gridStyle of the card
// In other words, this function does not check if the coordinates are off the side of the pinboard
// Unlike the functions to add subtasks, this function does NOT attempt to filter the pinboard before adding a card,
// so duplicates will occur unless you unpin first from the origin coords
// However, it WILL check where the card is going to be placed, and if a card is already there, that card will drop into .subTasks
function pinTaskToTask(task, taskId, coords) {
  if(!task.hasOwnProperty('pins') || !Array.isArray(task.pins)) {
    task.pins = []
  }
  
  // If this taskId is already at this location, do nothing
  if(task.pins.some(pin => pin.taskId === taskId && pin.y === coords.y && pin.x === coords.x)) {
    return
  }

  // If there is already something pinned there, drop it into subTasks
  const previousPinnedTaskId = unpinTaskFromTask(task, coords)?.taskId
  
  if(previousPinnedTaskId) {
    addSubTask(task, previousPinnedTaskId)
  }
  
  task.pins.push({taskId, y: coords.y, x: coords.x})
}

function putTaskInTaskZone(task, inTask, toLocation) {
  switch(toLocation.zone) {
    case 'priorities':
      // Move the card to the .priorities
      //filterFromSubpiles(inTask, task.taskId)
      addPriority(inTask, task.taskId)
      addParent(task, inTask.taskId)
      break
    case 'grid':
      // Move the card to the .pins using coordinates in the current gridStyle, or fail if not possible
      // If there isn't a grid on this card, add a grid large enough for the new coordinates to fit on
      if(!inTask.pinboard) {
        inTask.pinboard = blankPinboard(Math.max(toLocation.coords.y, 3), Math.max(toLocation.coords.x, 3))
      }
      pinTaskToTask(inTask, task.taskId, toLocation.coords)
      addParent(task, inTask.taskId)
      break
    case 'completed':
      // Move the card to the .completed
      addCompletedTask(inTask, task.taskId)
      break
    case 'discard':
      // Remove the card from its inId, or save in .completed if it's 
      // Could replace task-de-sub-tasked
      filterFromSubpiles(inTask, task.taskId)
      break
    case 'context':
    case 'panel':
      // These don't do anything on the server, it's a zone only on the client
      break
    case 'gifts':
      // Deprecated?
      break
    case 'stash':
      // the .level on the toLocation.level tells what stash level to put the card in
      // Rethink this
      break
    case 'card':
    case 'subTasks':
    default:
      // Move the card to the .subTasks (replaces task-sub-tasked)
      putTaskInTask(task, inTask)
      addParent(task, inTask.taskId)
      break
  }
}

// Removes the specified discardTaskId from the specified zone of the given task
// If zone argument is 'card' or empty, tries to discard from priorities, subTasks, and completed (but not grid)
export function discardTaskFromZone(task, fromLocation) {
  switch(fromLocation.zone) {
    case 'grid':
    case 'pyramid':
      unpinTaskFromTask(task, fromLocation.coords)
      return
    case 'priorities':
      discardPriority(task, fromLocation.taskId)
      return
    case 'completed':
      discardCompletedTask(task, fromLocation.taskId)
      return
    case 'subTasks':
      discardSubTask(task, fromLocation.taskId)
      return
    case 'card':
    default:
      discardSubTask(task, fromLocation.taskId)
      discardPriority(task, fromLocation.taskId)
      discardCompletedTask(task, fromLocation.taskId)
  }
}

// Moves a card from one location to another location.
// fromLocation defines the card to be unplayed from somewhere, and toLocation defines a card to be placed somewhere.
// fromLocation and toLocation are CardLocation objects defining a taskId in a location.
// The fromLocation is an optional CardLocation that, if provided, requires a taskId and zone at minimum
// If null, no card wil be unplayed.
// fromLocation.taskId and toLocation.taskId can be different,
// so it is possible to play a different card than was unplayed in one move (i.e., swap out a card)
// Right now the card being played must exist; card creation and modification is separate since it includes color etc.
export function atomicCardPlay(tasks, fromLocation = null, toLocation, memberId) {
  const taskId = fromLocation && fromLocation.taskId ? fromLocation.taskId : toLocation.taskId
  const theCard = getTask(tasks, taskId)
  if (!theCard && fromLocation?.zone !== 'grid') {
    return
  }
  const theCardMovedTo = getTask(tasks, toLocation.inId)
  if(!theCardMovedTo && !['discard', 'context', 'panel'].includes(toLocation.zone)) {
    console.log("Attempting to move a card to a missing card, this should never happen. Missing card:", toLocation.inId)
    return
  }
  
  if(theCard && memberId) { // memberId should be required, but temporarily for debugging
    // You cannot play a card without having seen it
    seeTask(theCard, memberId)
    
    // You cannot play a card without first grabbing it
    grabTask(tasks, theCard, memberId)
  }
  
  // Remove the card from wherever it was moved from
  const fromInId = fromLocation?.inId
  const theCardMovedFrom = getTask(tasks, fromInId)
  if(theCardMovedFrom) {
    discardTaskFromZone(theCardMovedFrom, fromLocation)
    //if(fromLocation.inId !== toLocation.inId) {
    //  removeParentIfNotParent(theCard, theCardMovedFrom)
    //}
    
    // Save the card to the completed cards if it has at least one checkmark
    if(toLocation.zone === 'discard' && theCard && theCard.claimed && theCard.claimed.length >= 1) {
      addCompletedTask(theCardMovedFrom, taskId)
    }
  }
  
  // Move card to wherever it was moved to
  if(theCard) {
    putTaskInTaskZone(theCard, theCardMovedTo, toLocation)
  }
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

// Removes the given taskId from the given card's stash of the specified level
export function unstashTask(task, taskId, level) {
	if (
		!_.has(task, 'stash') ||
		!(
			typeof task.stash === 'object' &&
			task.stash !== null &&
			!Array.isArray(task.stash)
		)
	) {
		return
	}
	if (!_.has(task.stash, level)) {
		return
	}
	task.stash[level] = _.filter(task.stash[level], tId => tId !== taskId)
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
	if (cardZ.pinboard && cardZ.pinboard.height >= 1 && cardZ.pinboard.width >= 1) {
		if (!cardA.pinboard) {
			cardA.pinboard = blankPinboard()
		}
		cardA.pinboard.height = Math.max(cardA.pinboard.height, cardZ.pinboard.height)
		cardA.pinboard.width = Math.max(cardA.pinboard.width, cardZ.pinboard.width)
	}

	/*todo: do this in a pins way
		
		if (_.has(cardZ, 'grid.rows')) {
			Object.entries(cardZ.grid.rows).forEach(([x, row]) => {
				const filteredRow = {}

				if (row) {
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
				}
			})
			if (Object.keys(cardA.grid.rows).length < 1) {
				cardA.grid = false
			}
		}
	}
  */
	cardA.passed = [...new Set([...cardA.passed, ...filterNull(cardZ.passed)])]
	// Remove duplicate passes
	let passesNoDuplicates = []
	cardA.passed.forEach(pass => {
	  if(!passesNoDuplicates.some(pass2 => pass[0] === pass2[0] && pass[1] === pass2[1])) {
	    passesNoDuplicates.push(pass)
	  }
	})
	cardA.passed = passesNoDuplicates

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

// DUPLICATED FROM cardsTypes.ts THIS IS THE JAVASCRIPT COPY
// Crawls through all cards, starting with the given task
// Return all parents of the card that you are hodling
export function allReachableHeldParents(tasks, origin, memberId) {
	if (!origin.hasOwnProperty('taskId')) {
		return []
	}
	let queue = [origin]
	let reachableCards = []

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

		if (task.deck.indexOf(memberId) < 0 && task.taskId !== memberId) {
			continue
		}

		reachableCards.push(task)
		if (task.hasOwnProperty('parents') && task.parents.length >= 1) {
			let parents = tasks.filter(taskItem =>
				task.parents.includes(taskItem.taskId)
			)
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
