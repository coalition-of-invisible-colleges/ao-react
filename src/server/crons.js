
import cron from 'cron'
import events from './events'
import {serverState} from './state'
import dctrlDb from './dctrlDb'

const rentJob = new cron.CronJob({
  cronTime: '0 0 0 1 * *',
  onTick: rent,
  start: false,
  timeZone: 'America/Los_Angeles'
})

const deactivateJob = new cron.CronJob({
  cronTime: '11 11 11 11 * *',
  onTick: deactivate,
  start: false,
  timeZone: 'America/Los_Angeles'
})

function rent(){
    let activeMembers = serverState.members.filter(m => {
        let isAdmin = (m.badges.indexOf('admin') !== -1)
        return (m.active > 0 && !isAdmin)
    })
    let fixed = parseFloat(serverState.cash.rent)
    let variable = parseFloat(serverState.cash.variable)
    let numActiveMembers = activeMembers.length
    let perMonth = ( fixed + variable ) / numActiveMembers
    let charged = Math.min(perMonth, parseFloat( serverState.cash.cap ))
    let notes = ''


    console.log("rent ran: ", {fixed, variable, numActiveMembers, perMonth, charged})

    activeMembers.forEach( m => {
        events.memberCharged(m.memberId, charged, notes)
    })

    events.variableSet(0) // XXX not used anymore?
    dctrlDb.insertBackup(serverState)
}

function deactivate(){
    serverState.tasks.forEach(t => {
        if (t.boost <= 0){
            events.memberDeactivated(t.taskId)
        }
    })
}

module.exports = function (){
    console.log('starting crons')
    rentJob.start()
    deactivateJob.start()
}
