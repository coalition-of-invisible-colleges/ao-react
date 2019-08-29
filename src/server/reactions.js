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
                serverState.resources.some( r => {
                    if (r.resourceId === ev.taskId){
                        let amount = parseFloat( ev.amount ) | 1
                        let charge = parseFloat( r.charge )
                        if (charge > 0 && amount > 0){
                            amount = amount / charge
                        }
                        events.resourcesEvs.resourceUsed(r.resourceId, '', amount, 0, '', console.log)
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
