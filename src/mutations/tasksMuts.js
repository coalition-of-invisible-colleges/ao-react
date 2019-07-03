import _ from 'lodash'
import crypto from 'crypto'
const uuidV1 = require('uuid/v1')

function tasksMuts(tasks, ev) {
    let newEv = {}
    switch (ev.type) {
        case "resource-created":
            newEv.taskId = ev.resourceId
            newEv.name = ev.resourceId
            newEv.claimed = []
            newEv.passed = []
            newEv.guild = false
            newEv.subTasks = []
            newEv.lastClaimed = 0
            newEv.book = {}
            newEv.priorities = []
            newEv.deck = []
            newEv.color = "blue"
            newEv.address = ''
            newEv.allocations = {}
            newEv.bolt11 = ''
            newEv.payment_hash = ''
            newEv.boost = 0
            newEv.monthlyValue = 0
            newEv.cap = 0
            tasks.push(newEv)
            break
        case "member-created":
            newEv.taskId = ev.memberId
            newEv.name = ev.memberId
            newEv.claimed = []
            newEv.passed = []
            newEv.guild = false
            newEv.subTasks = []
            newEv.lastClaimed = 0
            newEv.book = {}
            newEv.priorities = []
            newEv.deck = []
            newEv.color = "blue"
            newEv.address = ''
            newEv.allocations = {}
            newEv.bolt11 = ''
            newEv.payment_hash = ''
            newEv.boost = 0
            newEv.monthlyValue = 0
            newEv.cap = 0
            tasks.push(newEv)
            break
        case "task-created":
            ev.claimed = []
            ev.passed = []
            ev.guild = false
            ev.subTasks = []
            ev.lastClaimed = 0
            ev.book = {}
            ev.priorities = []
            ev.address = ''
            ev.bolt11 = ''
            ev.payment_hash = ''
            ev.boost = 0
            ev.monthlyValue = 0
            ev.cap = 0
            ev.allocations = {}
            tasks.push(ev)
            break
        case "address-updated":
            tasks.forEach( t => {
                if (t.taskId === ev.taskId){
                    t.address = ev.address
                }
            })
            break
        case "task-passed":
            tasks.forEach(task => {
                    if (task.taskId === ev.taskId) {
                            let pass = [ev.fromMemberId, ev.toMemberId]
                            task.passed.push(pass)
                    }
            })
            break
        case "task-grabbed":
            tasks.forEach(task => {
                    if (task.taskId === ev.taskId) {
                        task.passed = _.filter( task.passed, d => d[1] !== ev.memberId )
                        if(task.deck.indexOf(ev.memberId) === -1) {
                                task.deck.push(ev.memberId)
                        }
                    }
            })
            break
        case "task-dropped":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    task.passed = _.filter(task.passed, d => d[1] !== ev.memberId)
                    task.deck = _.filter(task.deck, d => d !== ev.memberId )
                }
            })
            break
        case "task-removed":
            tasks.forEach((task, i) => {
                if (task.taskId === ev.taskId) {
                        tasks.splice(i, 1)
                }
            })
            tasks.forEach( t => {
                    t.subTasks = t.subTasks.filter(st => st !== ev.taskId)
                    t.priorities = t.priorities.filter(st => st !== ev.taskId)
                    t.claimed = t.claimed.filter(st => st !== ev.taskId)
            })
            break
        case "task-prioritized":
            tasks.forEach( task => {
              if (task.taskId === ev.inId){
                  if (task.priorities.indexOf(ev.taskId) === -1){
                      task.priorities.push(ev.taskId)
                      task.subTasks = task.subTasks.filter(st => st !== ev.taskId)
                      task.claimed = task.claimed.filter(st => st !== ev.taskId)
                  }
              }
            })
            break
        case "task-refocused":
            tasks.forEach( task => {
                if (task.taskId === ev.inId){
                    task.priorities = task.priorities.filter( taskId => taskId !== ev.taskId )
                    task.subTasks.push(ev.taskId)
                }
            })
            break
        case "task-sub-tasked":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    if(task.subTasks.indexOf(ev.subTask) !== -1) {
                        return
                    }
                    task.subTasks.push(ev.subTask)
                }
            })
            break
        case "task-de-sub-tasked":
            tasks.forEach(task => {
                    if (task.taskId === ev.taskId) {
                        task.subTasks = _.filter(task.subTasks, tId => tId !== ev.subTask )
                        task.claimed = _.filter(task.claimed, tId => tId !== ev.subTask )
                    }
            })
            break
        case "task-guilded":
            tasks.forEach(task => {
                    if (task.taskId === ev.taskId) {
                            task.guild = ev.guild
                    }
            })
            break
        case "task-bountied":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                        _.merge(task, ev)
                    }
            })
            break
        case "task-claimed":
            let bounty = 0
            tasks.forEach(task => {
                if (task.taskId === ev.inId) {
                        task.priorities = task.priorities.filter( taskId => taskId !== ev.taskId )
                        task.claimed.push(ev.taskId)
                }
                if (task.taskId === ev.taskId){
                        task.claimed.push(ev.memberId)
                        task.lastClaimed = ev.timestamp
                        task.boost = 0
                }
            })
            /*tasks.forEach(task => {
                if(task.allocated[taskId] > 0) {
                    bounty += task.allocated[taskId]
                }
            })*/
            break
        case "task-cap-updated":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    task.cap = parseFloat(ev.amount)
                }
            })
            break
        case "task-rate-updated":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    task.monthlyValue = parseFloat(ev.amount)
                }
            })
            break
        case "task-boosted":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    let amount = parseFloat(ev.amount)
                    let boost  = parseFloat(task.boost) | 0
                    task.boost = amount + boost
                    task.address = ""
                }
            })
            break
        case "task-boosted-lightning":
            tasks.forEach(task => {
                if (task.payment_hash === ev.payment_hash) {
                        let amount = parseFloat(ev.amount)
                        let boost  = parseFloat(task.boost) | 0
                        task.boost = amount + boost
                        task.bolt11 = ""
                        task.payment_hash = ""
                }
            })
            break
        case "task-instructions-updated":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                        task.instructions = ev.newInstructions
                }
            })
            break
        case "resource-booked":
            tasks.forEach( task => {
                if (task.taskId === ev.resourceId) {
                    task.book = ev
                }
            })
            break
        case "invoice-created":
            tasks.forEach( task => {
                if (task.taskId === ev.taskId) {
                        task.payment_hash = ev.payment_hash
                        task.bolt11 = ev.bolt11
                }
            })
            break
        case "task-swapped":
            let task, original, swap
            tasks.forEach((t) => {
                if (t.taskId === ev.taskId) {
                    task = t
                }
                if (t.taskId === ev.swapId1) {
                    original = t
                }
                if (t.taskId === ev.swapId2) {
                    swap = t
                }
            })

            if(!task || !original || !swap) break

            let originalIndex = task.subTasks.indexOf(swap.taskId)
            let swapIndex = task.subTasks.indexOf(original.taskId)

            let newSubTasks = task.subTasks.slice()
            newSubTasks[originalIndex] = original.taskId
            newSubTasks[swapIndex] = swap.taskId
            task.subTasks = newSubTasks
            break
        case "task-allocated":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    if(task.allocated[ev.allocatedId] < 1) {
                        task.allocated[ev.allocatedId] = 1
                    } else {
                        task.allocated[ev.allocatedId]++
                    }
                }
            })
            break
    }
}

export default tasksMuts
