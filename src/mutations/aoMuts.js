import _ from 'lodash'
import crypto from 'crypto'
const uuidV1 = require('uuid/v1')

// import {applyEvent} from '../server/state'

function aoMuts(aos, ev) {
    switch (ev.type) {
        case "ao-connected":
            aos.push(ev)
            break
        case "ao-updated":
            aos.forEach(ao => {
                if (ao.address === ev.aoId){
                    // applyEvent(ao.state, ev)
                }
            })
            break
    }
}

export default aoMuts
