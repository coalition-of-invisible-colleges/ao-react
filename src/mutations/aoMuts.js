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
                alias: ev.state.cash.alias
            }
            aos.push(newEv)
            break
    }
}

export default aoMuts
