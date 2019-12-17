import { getResource } from './spec/utils'
import events from './events'
import { serverState } from './state'

function checkForChargedEvent( resourceId ){
    let charged
    serverState.bookings.forEach( b => {
        if (resourceId === b.resourceId) {
            let dnow = new Date()
            let now = dnow.getTime()
            let tsUntilStart = parseInt(b.startTs) - now
            let tsUntilEnd = parseInt(b.endTs) - now
            let current = (tsUntilStart < 0 && tsUntilEnd > 0)
            if (current && b.charge > 0){
                charged = b.charge
            }
        }
    })
    return charged
}

function reactions(ev){
    process.nextTick( err => {
        switch (ev.type) {
            case 'task-boosted':
            case 'task-boosted-lightning':
                let optionList = []
                let defaultPrice
                let resourceId
                let resourceList = serverState.resources.map(r => r.resourceId)
                let amount = parseFloat(ev.amount)

                serverState.tasks.some(t => {
                    if (resourceList.indexOf(t.taskId) > -1 && t.priorities.indexOf(ev.taskId) > -1){
                        resourceId = t.taskId
                        return true
                    }
                })

                serverState.resources.some(r => {
                    if (r.resourceId === resourceId){
                        defaultPrice = r.charge
                        return true
                    }
                })
                
                serverState.tasks.some(t => {
                    if (ev.taskId === t.taskId){
                        let str = t.name
                        let cashTagLocation = str.search(/\$/)
                        let customPrice = parseFloat( str.slice(cashTagLocation + 1, cashTagLocation + 5) )
                        if (customPrice > 0){
                            console.log("using custom price, ", customPrice)
                            defaultPrice = customPrice
                        }
                        if (defaultPrice > 0 && amount > 0){
                            amount = amount / defaultPrice
                        }
                        let hopper = t.name.slice(0,1)
                        events.resourcesEvs.resourceUsed(resourceId, '', amount, 0, hopper, console.log)
                        return true
                    }
                })
                break
            case 'member-field-updated':
                if (ev.field === 'secret') { //This seems wrong - tofu
                    events.membersEvs.badgeAdded(ev.memberId, 'secure')
                }
                break
            case 'member-paid':
                break
            case 'resource-stocked':
                events.membersEvs.memberActivated(ev.memberId)
                break
            case 'resource-stocked':
                events.membersEvs.badgeAdded(ev.memberId, 'bitpepsi')
                break
            case 'member-address-updated':
                break
            case 'member-created':
                break
            case 'resource-created':
                break
        }
    })
}

module.exports = reactions
