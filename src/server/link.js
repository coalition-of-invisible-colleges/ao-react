import cron from 'cron'
import events from './events'
import state from './state'
const serverState = state.serverState
import { checkHash, postEvent } from './connector'
import { crawler, crawlerHash } from '../calculations'
import Rsync from 'rsync'
import config from '../../configuration.js'

const syncLink = new cron.CronJob({
  cronTime: '0 */1 * * * *',
  onTick: sync,
  start: false,
  timeZone: 'America/Los_Angeles',
})

let rsync

function sync() {
  console.log('sync trig')
  /*serverState.ao.forEach(a => {
    a.links.forEach(l => {
      let crawlered = crawler(serverState.tasks, l)
      let expectedHash = crawlerHash(serverState.tasks, l)
      checkHash(
        a.address,
        a.outboundSecret,
        l,
        hashRes => {
          console.log(
            `expectedHash: ${expectedHash}, hashRes: ${
              hashRes.length <= 64 ? hashRes : 'Failed'
            }`
          )
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
                console.log(
                  'ao relay response:',
                  connectorRes?.statusCode === 200
                    ? 'sent cards'
                    : connectorRes?.statusCode
                )
                if (rsync) {
                  console.log('memes are still syncing from last sync trig...')
                } else {
                  console.log('checking for memes to sync...')
                  const memes = serverState.memes.filter(meme => {
                    const result = tasksToSend.some(
                      task => task.taskId === meme.memeId
                    )
                    if (result)
                      console.log('Found meme! Meme is', meme.filename)
                    return result
                  })
                  if (memes?.length >= 1) {
                    console.log('starting meme sync for', memes.length, 'memes')
                    const filenames = memes.map(
                      meme => config.memes.dir + '/' + meme.filename
                    )
                    console.log('filenames:', filenames)

                    // Build the command
                    rsync = new Rsync()
                      .output(
                        function (data) {
                          // do things like parse progress
                        },
                        function (data) {
                          // do things like parse error output
                          console.log('error output: ', data)
                        }
                      )
                      // .shell('ssh')
                      .executable(
                        'torsocks rsync --ignore-existing --chmod=664 -vvutz -e "ssh -i ' +
                          config.memes.sshKey +
                          '"'
                      )
                      // .shell('sh')
                      // .flags('-vvuntz')
                      // .flags('--compress')
                      // .flags('--upda')
                      // .flags('--ignore-existing')
                      // .flags('--times')
                      // .flags('--chmod=664')
                      // .flags('--dry-run')
                      // .flags('--checksum')
                      .source(filenames)
                      .destination(
                        config.memes.sshUsername +
                          '@' +
                          a.address +
                          ':/home/' +
                          config.memes.sshUsername +
                          '/.ao/memes/'
                      )

                    console.log('rsync command is ', rsync.command())

                    // Execute the command
                    rsync.execute(function (error, code, cmd) {
                      // we're done
                      if (error) {
                        console.log('Error syncing memes: ', error)
                        return
                      }
                      console.log(
                        'synced',
                        memes.length,
                        'memes! code is ',
                        code,
                        'and cmd is',
                        cmd
                      )
                    })
                  }
                }
              },
              false
            )
          }
        },
        false
      )
    })
  })*/
}

function getList(taskIds) {
  return serverState.tasks.filter(t => taskIds.indexOf(t.taskId) > -1)
}

export default function () {
  syncLink.start()
}
