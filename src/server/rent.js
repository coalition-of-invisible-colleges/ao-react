
const cron = require('cron')
const events = require('./events')
const {serverState} = require('./state')

const rentJob = new cron.CronJob({
  cronTime: '0 0 0 1 * *',
  onTick: rent,
  start: false,
  timeZone: 'America/Los_Angeles'
})

const deactivateJob = new cron.CronJob({
  cronTime: '11 11 11 * * 0',
  onTick: deactivate,
  start: false,
  timeZone: 'America/Los_Angeles'
})

function rent(){
    let activeMembers = serverState.members.filter(m => {
        return (m.active > 0)
    })
    let fixed = parseFloat(serverState.cash.rent)
    let numActiveMembers = activeMembers.length
    let perMonth = fixed / numActiveMembers
    let charged = Math.min(perMonth, parseFloat(serverState.cash.cap))
    let notes = ''

    activeMembers.forEach( m => {
        events.memberCharged(m.memberId, charged, notes)
    })
}

function deactivate(){
    serverState.tasks.forEach(t => {
        if (t.boost <= 0){
            events.memberDeactivated(t.taskId)
        }
    })
}

module.exports = function (){
    rentJob.start()
    deactivateJob.start()
}
