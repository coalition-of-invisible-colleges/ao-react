import cron from 'cron'
import events from './events'
import state from './state'
const serverState = state.serverState

const todo = new cron.CronJob({
  cronTime: '0 */1 * * * *',
  onTick: autoUncheck,
  start: false,
  timeZone: 'America/Los_Angeles',
})

let rsync

function autoUncheck() {
  console.log('autouncheck')
  const now = Date.now()
  serverState.tasks.forEach(task => {
    if (task.claimInterval > 0 && task.claimed.length > 0) {
      const dur = now - task.lastClaimed
      console.log('\n\nDURATION is ', dur)
      const intervalInMs = task.claimInterval * 60 * 60 * 1000
      if (dur >= intervalInMs) {
        events.taskReset(task.taskId, null)
      }
    }
  })
}

export default function () {
  todo.start()
}
