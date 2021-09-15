import cron from 'cron'
import events from './events.js'
import state from './state.js'
const serverState = state.serverState
import config from '../../configuration.js'

const rentJob = new cron.CronJob({
  cronTime: '0 0 0 1 * *',
  onTick: rent,
  start: false,
  timeZone: 'America/Los_Angeles',
})

const deactivateJob = new cron.CronJob({
  cronTime: '11 11 11 * * 0',
  onTick: deactivate,
  start: false,
  timeZone: 'America/Los_Angeles',
})

const fundJob = new cron.CronJob({
  cronTime: '12 12 12 * * 0',
  onTick: fundGuilds,
  start: false,
  timeZone: 'America/Los_Angeles',
})

function rent() {
  let activeMembers = serverState.members.filter(m => {
    return m.active > 0
  })
  let fixed = parseFloat(serverState.cash.rent)
  let numActiveMembers = activeMembers.length
  let perMonth = fixed / numActiveMembers
  let charged = Math.min(perMonth, parseFloat(serverState.cash.cap))
  let notes = ''

  activeMembers.forEach(m => {
    events.trigger(
      'member-charged',
      { memberId: m.memberId, charged, notes },
      null
    )
  })
}

function deactivate() {
  serverState.tasks.forEach(t => {
    if (t.boost <= 0) {
      events.trigger('member-deactivated', { memberId: t.taskId }, null)
    }
  })
}

function fundGuilds() {
  let activeMembers = {}
  serverState.members.forEach(m => {
    if (m.active > 0) {
      activeMembers[m.memberId] = true
    }
  })
  if (Object.keys(activeMembers).length >= 1) {
    const multiplier =
      config?.jubilee?.multiplier > 0 ? config.jubilee.multiplier : 10
    serverState.tasks.forEach(task => {
      if (task.guild) {
        let opinions = {}
        task?.signed?.forEach(signature => {
          if (!!activeMembers[signature.memberId]) {
            opinions[signature.memberId] = signature.opinion
          }
        })
        const totalCurrentEndorsements = Object.values(opinions)?.length || 0
        if (totalCurrentEndorsements > 0) {
          events.trigger(
            'task-boosted',
            {
              taskId: task.taskId,
              amount: totalCurrentEndorsements * multiplier,
            },
            null
          )
        }
      }
    })
  }
}

export default function () {
  rentJob.start()
  deactivateJob.start()
  fundJob.start()
}
