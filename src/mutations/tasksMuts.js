import _ from 'lodash'
import crypto from 'crypto'
const uuidV1 = require('uuid/v1')

function tasksMuts(tasks, ev) {
    let newEv = {}
    switch (ev.type) {
        case "ao-connected":
            let currentTaskIds = []
            console.log("start connect ao-connected: ", tasks.length)

            tasks.forEach((t, i) => {
                if (currentTaskIds.indexOf( t.taskId ) === -1){
                    currentTaskIds.push(t.taskId)
                } else {
                    console.log("duplicate taskID in taskLIST BAD!")
                }

            })

            ev.state.tasks.forEach(t => {
                if (currentTaskIds.indexOf(t.taskId) === -1){
                    if (!t.originAddress){
                        let tt = Object.assign({}, t)
                        tt.originAddress = ev.address
                        tasks.push(tt)
                    } else {
                        // console.log("skippin hops away ", t.originAddress)
                    }
                } else {
                    console.log("duplicate taskID in remote BAD!")
                }
            })
            console.log("end connect: ", tasks.length)
            break
        case "ao-disconnected":
            console.log("start disconnected: ", tasks.length)
            let indexes = []
            tasks.forEach((t, i) => {
                if (t.originAddress === ev.address){
                    indexes.push(i)
                }
            })
            let removed = _.pullAt(tasks, indexes)
            console.log("end disconnect: ", tasks.length)
            break
        case "resource-created":
            newEv.taskId = ev.resourceId
            newEv.name = ev.resourceId
            newEv.claimed = []
            newEv.completed = []
            newEv.passed = []
            newEv.guild = false
            newEv.subTasks = []
            newEv.lastClaimed = 0
            newEv.book = {}
            newEv.priorities = []
            newEv.deck = []
            newEv.color = "red"
            newEv.address = ''
            newEv.allocations = []
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
            newEv.completed = []
            newEv.passed = []
            newEv.guild = false
            newEv.subTasks = []
            newEv.lastClaimed = 0
            newEv.book = {}
            newEv.priorities = []
            newEv.deck = []
            newEv.color = "blue"
            newEv.address = ''
            newEv.allocations = []
            newEv.bolt11 = ''
            newEv.payment_hash = ''
            newEv.boost = 0
            newEv.monthlyValue = 0
            newEv.cap = 0
            tasks.push(newEv)
            break
        case "task-created":
            ev.claimed = []
            ev.completed = []
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
            ev.allocations = []
            if(ev.name) {
                tasks.push(ev)
            }
            if (ev.inId){
                tasks.forEach(task => {
                    if (task.taskId === ev.inId) {
                        task.subTasks = _.filter(task.subTasks, tId => tId !== ev.taskId)
                        task.subTasks.push(ev.taskId)
                    }
                })
            }
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

                    if( !task.passed.some(p => {
                        if( p[0] === pass[0] && p[1] === pass[1]) {
                            return true
                        }
                    })) {
                        task.passed.push(pass)
                    }
                }
            })
            break
        case "task-grabbed":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    task.passed = _.filter( task.passed, d => d[1] !== ev.memberId )
                    if(task.deck.indexOf(ev.memberId) === -1) {
                        if(ev.taskId !== ev.memberId) {
                            task.deck.push(ev.memberId)
                        }
                    }
                }
                if(task.taskId === ev.memberId) {
                    if(task.subTasks.indexOf(ev.taskId) === -1) {
                        task.subTasks.push(ev.taskId)
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
        case "member-purged":
            tasks.forEach((task, i) => {
                if (task.taskId === ev.memberId) {
                        tasks.splice(i, 1)
                }
            })
            tasks.forEach( t => {
                    t.subTasks = t.subTasks.filter(st => st !== ev.memberId)
                    t.priorities = t.priorities.filter(st => st !== ev.memberId)
                    t.claimed = t.claimed.filter(st => st !== ev.memberId)
                    t.deck = t.deck.filter(st => st !== ev.memberId)
                    t.passed = t.passed.filter(p => !(p[0] === ev.memberId || p[1] === ev.memberId))
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
                    t.completed = _.filter(t.completed, st => st !== ev.taskId)
            })
            break
        case "task-prioritized":
            tasks.forEach( task => {
              if (task.taskId === ev.inId){
                  if (task.priorities.indexOf(ev.taskId) === -1){
                      task.priorities.push(ev.taskId)
                      task.subTasks = task.subTasks.filter(st => st !== ev.taskId)
                      task.completed = _.filter(task.completed, st => st !== ev.taskId)
                  }
              }
            })
            break
        case "task-refocused":
            tasks.forEach( task => {
                if (task.taskId === ev.inId){
                    task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId )
                    task.subTasks = _.filter(task.subTasks, taskId => taskId !== ev.taskId )
                    task.subTasks.push(ev.taskId)
                    if (!task.allocations || !Array.isArray(task.allocations)) { task.allocations = [] }

                    task.allocations = _.filter(task.allocations, al => {
                        if (al.allocatedId !== ev.taskId) {
                            return true
                        } else {
                            task.boost = task.boost + al.amount
                            return false
                        }
                    })
                }
            })
            break
        case "task-sub-tasked":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    task.subTasks = _.filter(task.subTasks, tId => tId !== ev.subTask)
                    task.subTasks.push(ev.subTask)
                }
            })
            break
        case "task-de-sub-tasked":
            tasks.forEach(task => {
                    if (task.taskId === ev.taskId) {
                        task.subTasks = _.filter(task.subTasks, tId => tId !== ev.subTask )
                        task.completed = _.filter(task.completed, tId => tId !== ev.subTask )
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
                let found = false
                if (task.taskId === ev.memberId){
                    task.boost += parseFloat(ev.paid)
                }

                task.priorities = task.priorities.filter(taskId => {
                    if(taskId !== ev.taskId) {
                        return true
                    } else {
                        found = true
                        return false
                    }
                })

                task.subTasks = task.subTasks.filter(taskId => {
                    if(taskId !== ev.taskId) {
                        return true
                    } else {
                        found = true
                        return false
                    }
                })

                if(found) {
                    task.completed = _.filter(task.completed, tId => tId !== ev.subTask )
                    task.completed.push(ev.taskId)
                    let alloc = false
                    if (!task.allocations || !Array.isArray(task.allocations)) { task.allocations = [] }
                    task.allocations = _.filter(task.allocations, al => {

                        if (al.allocatedId === ev.taskId){

                            alloc = al.amount
                            return false
                        }
                        return true
                    })
                }
                if (task.taskId === ev.taskId){
                    task.claimed.push(ev.memberId)
                    task.lastClaimed = ev.timestamp
                }
            })
            break
        case "task-unclaimed":
            tasks.forEach(task => {
                if(task.taskId === ev.taskId){
                    task.claimed = task.claimed.filter(mId => mId !== ev.memberId)
                }

                if (task.completed.indexOf(ev.taskId) > -1){
                    task.completed = task.completed.filter(taskId => taskId !== ev.taskId)
                    task.subTasks.push(ev.taskId)
                }

            })
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
                    let boost  = parseFloat(task.boost)
                    if (amount > 0){
                        task.boost = amount + boost
                        task.address = ""
                    }
                }
            })
            break
        case "task-boosted-lightning":
            tasks.forEach(task => {
                if (task.payment_hash === ev.payment_hash) {
                        let amount = parseFloat(ev.amount)
                        let boost  = parseFloat(task.boost)
                        if (amount > 0){
                          task.boost = amount + boost
                          task.bolt11 = ""
                          task.payment_hash = ""
                        }
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
        case "resource-used":
            tasks.forEach(task => {
                let charged = parseFloat(ev.charged)
                if (charged > 0){
                  if (task.taskId === ev.memberId){
                        task.boost -= charged
                  }
                  if (task.taskId === ev.resourceId){
                        task.boost += charged
                  }
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
            let task
            tasks.forEach((t) => {
                if (t.taskId === ev.taskId) {
                    task = t
                }
            })

            if(task){
                let originalIndex = task.subTasks.indexOf(ev.swapId1)
                let swapIndex = task.subTasks.indexOf(ev.swapId2)

                let originalIndexCompleted = task.completed.indexOf(ev.swapId1)
                let swapIndexCompleted = task.completed.indexOf(ev.swapId2)

                if ( originalIndex > -1 && swapIndex > -1 ){
                    let newST = task.subTasks.slice()
                    newST[originalIndex] = ev.swapId2
                    newST[swapIndex] = ev.swapId1
                    task.subTasks = newST
                }

                if ( originalIndexCompleted > -1 && swapIndexCompleted > -1 ){
                    let newCompleted = task.completed.slice()
                    newCompleted[originalIndexCompleted] = ev.swapId2
                    newCompleted[swapIndexCompleted] = ev.swapId1
                    task.completed = newCompleted
                }
            }

            break
        case "task-allocated":
            tasks.forEach(task => {
                if (task.taskId === ev.taskId) {
                    if (task.boost >= 1){
                        task.boost --
                        if(!task.allocations || !Array.isArray(task.allocations)) {
                          task.allocations = []
                        }
                        let alreadyPointed = task.allocations.some(als => {
                          if (als.allocatedId === ev.allocatedId){
                            als.amount += 1
                            return true
                          }
                        })
                        if (!alreadyPointed){
                          ev.amount = 1
                          task.allocations.push(ev)
                        }
                    }

                    let reprioritized = _.filter( task.priorities, d => d !== ev.allocatedId )
                    reprioritized.push(ev.allocatedId)
                    task.priorities = reprioritized
                }
            })
            break
        case "member-charged":
            tasks.forEach(task => {
                if (task.taskId === ev.memberId){
                    task.boost -= parseFloat(ev.charged)
                    if (task.boost < 0){
                        task.boost = 0
                    }
                }
            })
            break
        case "cleanup":
            //
            break
    }
}

export default tasksMuts
