
const cron = require('cron')
const events = require('./events')
const {serverState} = require('./state')
const connector = require( './connector')

const syncLink = new cron.CronJob({
  cronTime: '0 */1 * * * *',
  onTick: sync,
  start: false,
  timeZone: 'America/Los_Angeles'
})

function sync(){
    console.log('sync trig')
    serverState.ao.forEach(a => {
        a.links.forEach(l => {
            let crawlered = crawler(l)
            let tasks = getList(crawlered)
            console.log('looking through ', l, crawlered, tasks.length)
            if (tasks.length > 0){
                connector.postEvent(a.address, a.outboundSecret, {
                  type: 'tasks-received',
                  tasks
                }, (connectorRes) => {
                  console.log("ao relay response", {connectorRes})
                })
            }
        })
    })
}

function crawler(taskId){
  let tasks = serverState.tasks
  let history = []
  tasks.forEach(task => {
      if(task.taskId === taskId) {
          let crawler = [taskId]
          do {
              console.log('crawling', {crawler})
              newCards = []
              crawler.forEach(t => {
                  if(history.indexOf(t) >= 0) return
                  history.push(t)
                  let subTask = tasks.filter(pst => pst.taskId === t)[0]
                  if (subTask){
                      newCards = newCards.concat(subTask.subTasks).concat(subTask.priorities).concat(subTask.completed)
                  }
              })
              crawler = newCards
              console.log('crawler looped')
          } while(crawler.length > 0)
      }
  })
  console.log('returning newcards,', history)
  return history
}

function getList(taskIds){
    return serverState.tasks.filter(t => taskIds.indexOf(t.taskId) > -1)
}

module.exports = function (){
    syncLink.start()
}
