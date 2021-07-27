import cron from 'cron'
import events from './events'
import state from './state'
const serverState = state.serverState
import { checkHash, postEvent } from './connector'
import { crawler, crawlerHash } from '../calculations'

const syncLink = new cron.CronJob({
  cronTime: '0 */1 * * * *',
  onTick: sync,
  start: false,
  timeZone: 'America/Los_Angeles',
})

function sync() {
  console.log('sync trig')
  serverState.ao.forEach(a => {
    a.links.forEach(l => {
      let crawlered = crawler(serverState.tasks, l)
      let expectedHash = crawlerHash(serverState.tasks, l)
      checkHash(a.address, a.outboundSecret, l, hashRes => {
        console.log({ expectedHash, hashRes })
        if (expectedHash !== hashRes) {
          const tasksToSend = getList(crawlered)
          postEvent(
            a.address,
            a.outboundSecret,
            {
              type: 'tasks-received',
              tasks: tasksToSend,
            },
            connectorRes => {
              console.log('ao relay response', { connectorRes })
            }
          )
        }
      })
    })
  })
}

function getList(taskIds) {
  return serverState.tasks.filter(t => taskIds.indexOf(t.taskId) > -1)
}

export default function () {
  syncLink.start()
}
