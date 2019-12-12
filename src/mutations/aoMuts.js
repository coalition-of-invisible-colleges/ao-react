import _ from 'lodash'
import crypto from 'crypto'
const uuidV1 = require('uuid/v1')

function aoMuts(aos, ev) {
    switch (ev.type) {
        case "ao-connected":
            let newEv = {
                address: ev.address,
                secret: ev.secret,
                attempts: 0,
                successfuls: 0,
                fails: 0,
                lastAttemptSuccess: true,
                state: false
            }
            aos.push(newEv)
            break
        case "ao-disconnected":
            aos.forEach( (ao, i) => {
                if (ao.address === ev.address) {
                    aos.splice(i, 1)
                }
            })
            break
        case "ao-relay-attempted":
            aos.forEach( (ao, i) => {
                if (ao.address === ev.address) {
                    ao.attempts ++
                    if (ev.successful){
                        ao.successfuls ++
                        ao.lastAttemptSuccess = true
                    } else {
                        ao.fails ++
                        ao.lastAttemptSuccess = false
                    }
                }
            })
            break
        case "ao-updated":
            aos.forEach( (ao, i) => {
                if (ao.address === ev.address) {
                    ao.state = ev.state
                }
            })
            break
        // case "ao-subscribed"
    }
}

export default aoMuts
