const cron = require('cron')
const events = require('./events')
const { serverState } = require('./state')

// Six minutes - one minute grace period, deleted every five minutes
const deleteAfterMs = 6 * 60 * 1000

// Make sure this makes sense with deleteAfterMs
const cleanupJob = new cron.CronJob({
  cronTime: '5 * * * * *',
  onTick: cleanup,
  start: true,
  timeZone: 'America/Los_Angeles'
})

function cleanup() {
  const beforeCount = serverState.tasks.length
  const oldUnheldCards = serverState.tasks
    .filter(t => {
      const isUnheld = t.deck.length <= 0
      const isOld = Date.now() - t.created > deleteAfterMs
      const isMemberCard = t.taskId === t.name
      const isReservedCard = ['community hub'].includes(t.name)
      return isUnheld && isOld && !isMemberCard && !isReservedCard
    })
    .map(t => t.taskId)

  if (oldUnheldCards.length <= 0) {
    console.log('No shitposts to clean up')
    return
  }
  events.tasksRemoved(oldUnheldCards, null)

  const removedCount = beforeCount - serverState.tasks.length
  console.log(
    'Cleaned up',
    removedCount,
    'shitpost' + (removedCount >= 2 ? 's' : '')
  )
}

module.exports = function() {
  cleanupJob.start()
}
