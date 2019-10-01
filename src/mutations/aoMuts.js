import _ from 'lodash'
import crypto from 'crypto'
const uuidV1 = require('uuid/v1')

// import {applyEvent} from '../server/state'

function aoMuts(aos, ev) {
    switch (ev.type) {
        case "ao-connected":
            let newEv = {
                address: ev.address,
                secret: ev.secret,
                alias: ev.state.cash.alias,
                attempts: 0,
                successfuls: 0,
                fails: 0,
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
        // case "ao-subscribed"
    }
}

export default aoMuts
