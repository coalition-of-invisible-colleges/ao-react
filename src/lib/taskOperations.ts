// This file holds common operations which provide outputs based on taking a card/task as input
import aoStore from '../client/store'
import { convertToTimeWorked } from './utils'
import { Task } from '../interfaces'

export const makeTimesheet = (card: Task): String[] => {
    const entries = []
    const active = []
    const totals = {}
    const output = []

    card?.timelog.map(entry => {                                                                                                                                                                                                  
        const { name } = aoStore.memberById.get(entry.memberId)                                                                                                                                                                   
        const timeElapsed = entry.stop 
        ? entry.stop - entry.start 
        : Date.now() - entry.start

        if (totals[name] !== undefined) {
            totals[name] += timeElapsed
        } else {
            totals[name] = timeElapsed
        }

        if (entry.stop) {
            const logEntry = `${name} did ${convertToTimeWorked(timeElapsed)} of work on this card on ${new Date(entry.start).toLocaleDateString()}`                                                                     
            entries.push(logEntry)
        } else {
            active.push(name)
        }
    }); 

    if (active.length > 0) {
        output.push(`${active} ${active.length > 1 ? "are": "is"} currently working on this task!`)
        output.push('---')
    }

    output.push(...entries)
    output.push('---')

    Object.keys(totals).forEach((member) => {
        output.push(`${member}'s work on this task totals ${convertToTimeWorked(totals[member])}`)
    })


    return output
}
