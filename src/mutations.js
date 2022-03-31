// Mutations are state builders.
// The current state is the result of all the events in the system fed through the mutation functions.
// `server/state.js` for server; `modules/*` for vuex.

// const Vue = require('vue')
import _ from 'lodash'
import { createHash } from './crypto.js'
import {
  blankCard,
  blankPinboard,
  getTask,
  getTaskBy,
  atomicCardPlay,
  unpinTasksOutOfBounds,
  discardTaskFromZone,
  taskExists,
  seeTask,
  clearPassesTo,
  changeGiftCount,
  grabTask,
  dropTask,
  addParent,
  removeParentIfNotParent,
  filterFromSubpiles,
  clearSeenExcept,
  addSubTask,
  putTaskInTask,
  addPriority,
  stashTask,
  unstashTask,
  addPotential,
  checkPotential,
  clearPotential,
  updateLastUsed,
  safeMerge,
  POTENTIALS_TO_EXECUTE,
} from './cards.js'

function aoMuts(aos, ev) {
  switch (ev.type) {
    //case 'ao-linked':
    //  aos.forEach((ao, i) => {
    //    if (ao.address === ev.address) {
    //      ao.links.push(ev.taskId)
    //    }
    //  })
    //  break
    case 'ao-inbound-connected':
      let inAddressConnect = aos.some(a => {
        if (a.address === ev.address) {
          a.inboundSecret = ev.secret
          a.lastContact = Date.now()
          return true
        }
      })
      if (!inAddressConnect) {
        let newEv = {
          address: ev.address,
          outboundSecret: false,
          inboundSecret: ev.secret,
          lastContact: Date.now(),
        }
        aos.push(newEv)
      }
      break
    case 'ao-outbound-connected':
      let outAddressConnect = aos.some(a => {
        if (a.address === ev.address) {
          a.outboundSecret = ev.secret
          a.lastContact = Date.now()
          return true
        }
      })
      if (!outAddressConnect) {
        let newEv = {
          address: ev.address.trim(),
          outboundSecret: ev.secret,
          inboundSecret: false,
          lastContact: Date.now(),
        }
        aos.push(newEv)
      }
      break
    case 'ao-disconnected':
      aos.forEach((ao, i) => {
        if (ao.address.trim() === ev.address.trim()) {
          aos.splice(i, 1)
        }
      })
      break
  }
}

function cashMuts(cash, ev) {
  switch (ev.type) {
    case 'ao-named':
      cash.alias = ev.alias
      break
    case 'spot-updated':
      cash.spot = ev.spot
      break
    case 'currency-switched':
      cash.currency = ev.currency
      break
    case 'rent-set':
      cash.rent = parseFloat(ev.amount)
      break
    case 'cap-set':
      cash.cap = ev.amount
      break
    case 'funds-set':
      cash.outputs = ev.outputs
      cash.channels = ev.channels
      break
    case 'quorum-set':
      cash.quorum = ev.quorum
      break
    case 'task-boosted':
      if (ev.txid) cash.usedTxIds.push(ev.txid)
      break
    case 'task-boosted-lightning':
      cash.pay_index = ev.pay_index
      break
    case 'get-node-info':
      cash.info = ev.info
      break
  }
}

function membersMuts(members, ev) {
  switch (ev.type) {
    case 'ao-outbound-connected':
      break
    case 'ao-disconnected':
      break
    case 'member-created':
      updateLastUsed(ev, ev.timestamp)
      ev.muted = true
      ev.p0wned = true
      members.push(ev)
      break
    case 'member-activated':
      members.forEach(member => {
        if (member.memberId === ev.memberId && !member.banned) {
          if (member.active < 0) {
            member.active = -1 * member.active
          } else {
            member.active++
          }
        }
      })
      break
    case 'task-boosted':
      members.forEach(member => {
        if (member.memberId === ev.taskId) {
          if (member.active < 0) {
            member.active = -1 * member.active
          } else {
            member.active++
          }
        }
      })
      break
    case 'task-boosted-lightning':
      members.forEach(member => {
        if (member.memberId === ev.taskId) {
          if (member.active < 0) {
            member.active = -1 * member.active
          } else {
            member.active++
          }
        }
      })
      break
    case 'task-visited':
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          updateLastUsed(member, ev.timestamp)
        }
      })
      break
    case 'member-deactivated':
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          if (member.active >= 0) {
            member.active = -1 * member.active - 1
          }
        }
      })
      break
    case 'member-secret-reset':
      members.forEach(member => {
        if (member.memberId === ev.kohaiId) {
          const newSig = {
            memberId: ev.senpaiId,
            timestamp: ev.timestamp,
            opinion: ev.type,
          }

          addPotential(member, newSig)

          if (checkPotential(member, 'member-secret-reset')) {
            member.p0wned = true
            member.secret = createHash(member.name)
            clearPotential(member, 'member-secret-reset')
          }
        }
      })
      break
    case 'member-promoted':
      let toIndex
      let fromIndex
      if (
        members.some((member, i) => {
          if (member.memberId === ev.senpaiId) {
            toIndex = i
            return true
          }
        }) &&
        members.some((member, i) => {
          if (member.memberId === ev.kohaiId) {
            fromIndex = i
            return true
          }
        })
      ) {
        members.splice(toIndex, 0, members.splice(fromIndex, 1)[0])
      }
    case 'member-banned':
      members.forEach(member => {
        if (member.memberId === ev.kohaiId) {
          const newSig = {
            memberId: ev.senpaiId,
            timestamp: ev.timestamp,
            opinion: ev.type,
          }

          addPotential(member, newSig)

          if (checkPotential(member, 'member-banned')) {
            member.banned = true
            if (member.active >= 0) {
              member.active = -1 * member.active - 1
            }
          }
        }
      })
      break
    case 'member-unbanned':
      members.forEach(member => {
        if (
          member.memberId === ev.kohaiId &&
          member.hasOwnProperty('potentials') &&
          member.potentials.length >= 1
        ) {
          const beforeBans = member.potentials.filter(
            p => p.opinion === 'member-banned'
          ).length

          member.potentials = member.potentials.filter(
            p => !(p.opinion === 'member-banned' && p.memberId === ev.senpaiId)
          )

          const afterBans = member.potentials.filter(
            p => p.opinion === 'member-banned'
          ).length

          if (
            beforeBans >= POTENTIALS_TO_EXECUTE &&
            afterBans < POTENTIALS_TO_EXECUTE
          ) {
            member.banned = false
          }
        }
      })
      break
    case 'member-purged':
      for (let i = members.length - 1; i >= 0; i--) {
        const member = members[i]
        if (member.memberId === ev.memberId) {
          const newSig = {
            memberId: ev.blame,
            timestamp: ev.timestamp,
            opinion: ev.type,
          }

          //addPotential(member, newSig)

          //if (testPotential(member, 'member-purged')) {
            members.splice(i, 1)
          //}
        }
      }

      break
    case 'resource-used':
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          updateLastUsed(member, ev.timestamp)
        }
      })
      break

    case 'member-field-updated':
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          member[ev.field] = ev.newfield
          if (ev.field === 'secret') {
            member.p0wned = false
          }
        }
      })
      break

    case 'member-ticker-set':
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          if (!member.tickers) {
            member.tickers = []
          }
          if (
            !ev.fromCoin ||
            ev.fromCoin.trim().length < 1 ||
            !ev.toCoin ||
            ev.toCoin.trim().length < 1
          ) {
            member.tickers.splice(ev.index, 1)
          } else {
            member.tickers[ev.index] = {
              from: ev.fromCoin.trim().toLowerCase(),
              to: ev.toCoin.trim().toLowerCase(),
            }
          }
        }
      })
      break

    case 'doge-barked':
      members.forEach(member => {
        // this should only bump up for mutual doges
        if (member.memberId === ev.memberId) {
          updateLastUsed(member, ev.timestamp)
          // then bark
        }
      })
      break
  }
}

function resourcesMuts(resources, ev) {
  switch (ev.type) {
    case 'resource-created':
      let resourceIds = resources.map(r => r.resourceId)
      if (resourceIds.indexOf(ev.resourceId) === -1) {
        resources.push(ev)
      } else {
        console.log(
          'BAD data duplicate resource rejected in mutation, dup resource task likely created'
        )
      }
      break
    case 'resource-used':
      resources.forEach(resource => {
        if (resource.resourceId == ev.resourceId) {
          resource.stock -= parseInt(ev.amount)
        }
      })
      break
    case 'resource-purged':
      resources.forEach((r, i) => {
        if (r.resourceId === ev.resourceId) {
          resources.splice(i, 1)
        }
      })
      break
    case 'resource-stocked':
      resources.forEach(resource => {
        if (resource.resourceId == ev.resourceId) {
          resource.stock += parseInt(ev.amount)
        }
      })
      break
    case 'channel-created':
      resources.forEach((r, i) => {
        if (r.resourceId == ev.resourceId) {
          r.pubkey = ev.pubkey
        }
      })
      break
  }
}

function memesMuts(memes, ev) {
  switch (ev.type) {
    case 'meme-added':
      const fileHash = ev.data
      if (
        !memes.some(file => {
          return file.hash === ev.hash
        })
      ) {
        memes.push({
          memeId: ev.taskId,
          filename: ev.filename,
          hash: ev.hash,
          filetype: ev.filetype,
        })
        // console.log('added meme file: ', ev.filename)
      } else {
        // console.log('meme file already in state: ', ev.filename)
      }
      break
    case 'task-removed':
      for (let i = memes.length - 1; i >= 0; i--) {
        const meme = memes[i]
        if (meme.memeId === ev.taskId) {
          memes.splice(i, 1)
        }
      }
      break
  }
}

function sessionsMuts(sessions, ev) {
  switch (ev.type) {
    case 'session-created':
      let idHasSession = sessions.some(session => {
        // replace that sessions creds,
        let match = false
        if (session.ownerId === ev.ownerId) {
          match = true
          _.merge(session, ev)
        }
        return match // true terminates the some loop & idHasSession->true too
      })

      if (idHasSession) {
        // edited in session
      } else {
        // id didn't previously have session
        sessions.push(ev)
      }
      break
    case 'session-killed':
      sessions.forEach((s, i) => {
        if (s.session == ev.session) {
          _.pullAt(sessions, i)
        }
      })
      break
    case 'ao-outbound-connected':
      sessions.push({
        ownerId: ev.address,
        token: ev.secret,
        session: ev.address,
      })
      break
  }
}

let missingTaskIds = []
let dupesGlossary = {}
let previousXEvents = []
const numEventsToSave = 1
function tasksMuts(tasks, ev) {
  let theTask
  let inTask
  let memberTask
  
  // Save the last X events for logging in the event a missing member card is found
  if(previousXEvents.length >= numEventsToSave) previousXEvents.shift()
  previousXEvents.push(ev)
  
  // Most tasks have a taskId and memberId, and many have an inId, so pull these out in a standard way
  const memberTaskId = ev.memberId || ev.blame
  if(memberTaskId && memberTaskId !== 'cleanup' && (typeof memberTaskId === 'string' && !memberTaskId.includes('.onion'))) {
    memberTask = getTask(tasks, memberTaskId)
    if(!memberTask && ev.type !== 'member-created') {
      if(!missingTaskIds.includes(memberTaskId)) missingTaskIds.push(memberTaskId)
      // Rogue tasks-removed events were deleting member cards, so let's simply fix missing member cards and log
      console.log(ev.type + ': FIXING missing member task for memberId', memberTaskId, '(' + missingTaskIds.length + ')')
      console.log('previous', numEventsToSave, 'events:', previousXEvents)
      memberTask = blankCard(ev.memberId, ev.memberId, 'blue', ev.timestamp)
      tasks.push(memberTask)
    }
  }
  
  const theTaskId = ev.taskId || ev.subTask || ev.resourceId || ev?.from?.taskId || ev?.to?.taskId
  if(theTaskId) {
    theTask = getTask(tasks, theTaskId)
    if(!theTask && ev.type !== 'task-created' && ev.type !== 'grid-created' && ev.type !== 'resource-created' && ev.type !== 'meme-added') {
      if(!missingTaskIds.includes(theTaskId)) {
        missingTaskIds.push(theTaskId)
        console.log(ev.type + ': first missing task event for taskId', theTaskId, '(' + missingTaskIds.length + ') ev:', ev)
      }
      return // continuing may crash, but returning may cause further inconsistencies going forward
    }
  }
  
  if(ev.inId) {
    inTask = getTask(tasks, ev.inId)
    if(!inTask && ev.type !== 'task-created') {
      if(!missingTaskIds.includes(ev.inId)) {
        missingTaskIds.push(ev.inId)
        console.log(ev.type + ': first missing task event for inId', ev.inId, '(' + missingTaskIds.length + ') ev:', ev)
      }
      return // continuing may crash, but returning may cause further inconsistencies going forward
    }
  }
  
  switch (ev.type) {
    case 'highlighted':
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          let didUpdateInline = false
          task.highlights.forEach((h, i) => {
            if (h.memberId === ev.memberId) {
              didUpdateInline = true
              if (h.valence === ev.valence) {
                task.highlights.splice(i, 1)
              } else {
                h.valence = ev.valence
              }
            }
          })
          if (!didUpdateInline) {
            task.highlights.push({
              memberId: ev.memberId,
              valence: ev.valence,
            })
          }
        }
      })
      break
    case 'ao-outbound-connected':
      tasks.push(blankCard(ev.address, ev.address, 'purple', ev.timestamp))
      break
    case 'ao-disconnected':
      break
    case 'resource-created':
      tasks.push(blankCard(ev.resourceId, ev.resourceId, 'red', ev.timestamp))
      break
    case 'member-created':
      tasks.push(blankCard(ev.memberId, ev.memberId, 'blue', ev.timestamp))
      break
    case 'member-purged':
      // This is terribly redundant since the same potential builds up on the member.
      // Maybe the potentials system should be abstracted out to the spec or validation layer;
      // Attempts to call limited functions instead produce an action-potential event.
      // The original idea was potentials would only build up on members, not tasks.
      let purgedMemberCard = false
      for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i]
        if (task.taskId === ev.memberId) {
          let newSig = {
            memberId: ev.blame,
            timestamp: ev.timestamp,
            opinion: ev.type,
          }

          addPotential(task, newSig)

          if (checkPotential(task, 'member-purged')) {
            tasks.splice(i, 1)
            purgedMemberCard = true
          }
        }
      }

      if (purgedMemberCard) {
        tasks.forEach(t => {
          t.subTasks = t.subTasks.filter(st => st !== ev.memberId)
          t.priorities = t.priorities.filter(st => st !== ev.memberId)
          t.completed.filter(st => st !== ev.memberId)
          t.claimed = t.claimed.filter(st => st !== ev.memberId)
          t.deck = t.deck.filter(st => st !== ev.memberId)
          clearPassesTo(tasks, t, ev.memberId, true)
          if (t.pins && t.pins.length >= 1) {
            t.pins.forEach((pin, i) => {
              const cell = pin.taskId
              if (cell === ev.memberId) {
                tasks[j].pins.spice(i, 1)
              }
            })
          }
        })
      }
      break
    case 'meme-added':
      // console.log('meme-added taskId is', ev.taskId)
      if (!tasks.some(t => t.taskId === ev.taskId)) {
        // console.log('adding meme', ev.taskId)
        tasks.push(blankCard(ev.taskId, ev.filename, 'yellow', ev.timestamp))
      }
      break
    case 'task-created':
      const foundExistingTask = getTaskBy(tasks, ev.name, 'name')
      if(foundExistingTask?.taskId) {
        console.log("Attempted to create a duplicate task, ignored at mutation level. name:", ev.name)
        if(!dupesGlossary[foundExistingTask.taskId]) {
          dupesGlossary[foundExistingTask.taskId] = []
        }
        if(ev.taskId && !dupesGlossary[foundExistingTask.taskId].includes(ev.taskId)) {
          dupesGlossary[foundExistingTask.taskId].push(ev.taskId)
        }
        break
      }
      tasks.push(
        blankCard(
          ev.taskId,
          ev.name,
          ev.color,
          ev.timestamp,
          ev.deck,
          ev.inId ? [ev.inId] : []
        )
      )
      if(inTask) {
        if (ev.prioritized) {
          addPriority(inTask, ev.taskId)
        } else {
          addSubTask(inTask, ev.taskId)
        }
        addParent(inTask, ev.inId)
        clearSeenExcept(inTask, ev.deck.length >= 1 ? [ev.deck[0]] : undefined) // The very font of novelty
      }
      break
    case 'address-updated':
      tasks.forEach(t => {
        if (t.taskId === ev.taskId) {
          t.address = ev.address
        }
      })
      break
    case 'task-passed':
      let pass = [ev.fromMemberId, ev.toMemberId]

      if (
        !theTask.passed.some(p => {
          if (p[0] === pass[0] && p[1] === pass[1]) {
            return true
          }
        })
      ) {
        theTask.passed.push(pass)
        const recipient = getTask(tasks, ev.toMemberId)
        if(recipient) {
          changeGiftCount(recipient, 1)
        }
      }
      break
    case 'task-grabbed':
      // First make sure they have a valid member card to grab with,
      // since it will show up on the "Where is this card" list
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          // Add the card to their member card
          if (task.passed.find(d => d[1] === ev.memberId)) {
            tasks.forEach(t => {
              if (t.taskId === ev.memberId) {
                t.subTasks.push(ev.taskId)
              }
            })
          }
          clearPassesTo(tasks, task, ev.memberId)
          if (task.deck.indexOf(ev.memberId) === -1) {
            if (ev.taskId !== ev.memberId && ev.memberId) {
              task.deck.push(ev.memberId)
            }
          }
        }
      })
      break
    case 'task-seen':
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          if (!task.seen) {
            task.seen = []
          }
          if (
            !task.seen.some(t => {
              return t.memberId === ev.memberId
            })
          ) {
            task.seen.push({ memberId: ev.memberId, timestamp: Date.now() })
          }
        }
      })
      break
    case 'task-started':
      const tsFound = getTask(tasks, ev.taskId)

      if (tsFound) {
        if (!tsFound.timelog) {
          tsFound.timelog = []
        }
        // console.log('task-started pre timelog is', tsFound.timelog)
        tsFound.timelog.push({
          memberId: ev.memberId,
          taskId: ev.taskId,
          inId: ev.inId,
          start: ev.timestamp,
          stop: null,
        })
      }
      // console.log('task-started post timelog is', tsFound.timelog)
      break
    case 'task-stopped':
      // console.log('task-stopped 1')
      const tstFound = getTask(tasks, ev.taskId)
      // console.log('task-stopped 2')
      if (tstFound) {
        // console.log('task-stopped 3')
        // console.log('task-stopped pre timelog is', tstFound.timelog)
        if (!tstFound.timelog) {
          return
        }
        // console.log('task-stopped 4')
        for (var i = tstFound.timelog.length - 1; i >= 0; i--) {
          // console.log('task-stopped 5')
          if (tstFound.timelog[i].memberId === ev.memberId) {
            // console.log('task-stopped 6')
            if (
              tstFound.timelog[i].stop &&
              tstFound.timelog[i].stop > tstFound.timelog[i].start
            ) {
              // console.log(
              //   'task-stopped 7 stop is',
              //   tstFound.timelog[i].stop,
              //   ' and start is',
              //   tstFound.timelog[i].start
              // )
              console.log(
                'Stop time already set for most recent start time, triggering this event should not be possible in the GUI'
              )
            } else {
              // console.log('task-stopped 8')
              tstFound.timelog[i].stop = ev.timestamp
              // tstFound.timelog.push({
              //   memberId: 'test',
              //   taskId: 'testId',
              //   inId: null,
              //   start: null,
              //   stop: null,
              // })
            }
          }
          // console.log('task-stopped post timelog is', tstFound.timelog)

          break
        }
      }
      break
    case 'task-time-clocked':
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          let found = task.time.find(t => {
            return t.memberId === ev.memberId
          })
          if (!found) {
            task.time.push({
              memberId: ev.memberId,
              timelog: [ev.seconds],
              date: [ev.date],
            })
          } else {
            if (!found.timelog) {
              found.timelog = []
            }
            if (!found.date) {
              found.date = []
              if (found.timelog.length > found.date.length) {
                let count = found.timelog.length - found.date.length
                while (count > 0) {
                  found.date.push(null)
                  count--
                }
              }
            }
            found.timelog.push(ev.seconds)
            found.date.push(ev.date)
          }
        }
      })
      break
    case 'task-signed':
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          clearPassesTo(tasks, task, ev.memberId)
          if (task.deck.indexOf(ev.memberId) === -1) {
            task.deck.push(ev.memberId)
          }
          let newSig = {
            memberId: ev.memberId,
            timestamp: ev.timestamp,
            opinion: ev.opinion,
          }
          if (!task.signed) {
            task.signed = []
          }
          task.signed.push(newSig)
          if (task.guild && task.guild.length >= 1) {
            if (
              ev.opinion === 1 &&
              (!task.hasOwnProperty('memberships') ||
                (_.has(task, 'membershipstask.length') &&
                  task.memberships.length < 1))
            ) {
              if (!task.memberships) {
                task.memberships = []
              }
              task.memberships.push({ memberId: ev.memberId, level: 2 })
            } else if (ev.opinion === 0 && _.has(task, 'memberships.length')) {
              task.memberships.filter(memb => memb.memberId !== ev.memberId)
            }
          }
        }
      })
      break
    case 'task-membership':
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          if (task.guild && task.guild.length >= 1) {
            // The member must have signed the task affirmatively
            if (!task.signed || !task.signed.length || task.signed.length < 1) {
              return
            }

            let mostRecentOpinion
            for (let i = task.signed.length - 1; i--; i >= 0) {
              const signature = task.signed[i]
              if (signature.memberId === ev.memberId) {
                mostRecentOpinion = signature.opinion
                break
              }
            }

            if (mostRecentOpinion < 1) {
              return
            }

            if (
              !task.memberships ||
              !task.memberships.length ||
              task.memberships.length < 1
            ) {
              return
            }

            const promoterLevel = task.memberships.find(
              membership => membership.memberId === ev.blame
            )?.level

            if (!promoterLevel || promoterLevel < 1) {
              return
            }

            const promotedLevel =
              task.memberships.find(
                membership => membership.memberId === ev.memberId
              )?.level || 0

            let maxLevel = 0
            task.memberships.forEach(membership => {
              maxLevel = Math.max(maxLevel, membership.level)
            })

            // The promoter must be a member at least one level higher
            // Or, the highest-level member of a group can promote themselves
            const canPromote =
              (promoterLevel > promotedLevel &&
                promoterLevel >= ev.level + 1) ||
              (ev.memberId === ev.blame &&
                promoterLevel === maxLevel &&
                maxLevel >= 1)

            if (!canPromote) {
              return
            }

            task.memberships = task.memberships.filter(
              memb => memb.memberId !== ev.memberId
            )
            if (ev.level !== 0) {
              task.memberships.push({
                memberId: ev.memberId,
                level: ev.level,
              })
            }
          }
        }
      })
      break
    case 'task-stashed':
      // I think the spec is only run on event creation, not load from database,
      // so make sure the task exists before linking to it from another card
      const toStash = getTask(tasks, ev.taskId)
      if (toStash) {
        grabTask(tasks, toStash, ev.blame)
        addParent(toStash, ev.inId)

        tasks.forEach(task => {
          if (task.taskId === ev.inId) {
            stashTask(task, ev.taskId, ev.level)
          }
        })
      }
      break
    case 'task-unstashed':
      // I think the spec is only run on event creation, not load from database,
      // so make sure the task exists before linking to it from another card
      const toUnstash = getTask(tasks, ev.taskId)
      const unstashParentCard = getTask(tasks, ev.inId)
      if (toUnstash && unstashParentCard) {
        grabTask(tasks, toUnstash, ev.blame)

        tasks.forEach(task => {
          if (task.taskId === ev.inId) {
            unstashTask(task, ev.taskId, ev.level)
            removeParentIfNotParent(task, unstashParentCard)
          }
        })
      }
      break
    case 'pile-grabbed':
      if (!ev.memberId) {
        break
      }
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          clearPassesTo(tasks, task, ev.memberId)
          let crawler = [ev.taskId]
          let history = []
          let newCards = []
          do {
            newCards = []
            crawler = crawler.forEach(t => {
              if (history.indexOf(t) >= 0) return
              let subTask = tasks.filter(pst => pst.taskId === t)
              if (subTask.length < 1) {
                // console.log(
                //   'missing subtask, this is messy. parent task name: ',
                //   task.name
                // )
                return
              }
              if (subTask.length > 1) {
                console.log('duplicate task found, this is very bad')
              }
              subTask = subTask[0]
              if (
                subTask === undefined ||
                subTask.subTasks === undefined ||
                subTask.priorities === undefined ||
                subTask.completed === undefined
              ) {
                console.log('invalid task data found, this is very bad')
                return
              }

              history.push(t)

              if (
                subTask.deck.indexOf(ev.memberId) === -1 &&
                ev.taskId !== ev.memberId
              ) {
                clearPassesTo(tasks, subTask, ev.memberId)
                subTask.deck.push(ev.memberId)
              }
              newCards = newCards
                .concat(subTask.subTasks)
                .concat(subTask.priorities)
                .concat(subTask.completed)
            })
            crawler = newCards
          } while (crawler.length > 0)
        }
      })
      break
    case 'task-dropped':
      theTask.deck = theTask.deck.filter(d => d !== ev.memberId)
      clearPassesTo(tasks, theTask, ev.memberId)
      break
    case 'pile-dropped':
      if (!ev.memberId) {
        break
      }
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          clearPassesTo(tasks, task, ev.memberId)
          let crawler = [ev.taskId]
          let history = []
          let newCards = []
          do {
            newCards = []
            crawler = crawler.forEach(t => {
              if (history.indexOf(t) >= 0) return
              let subTask = tasks.filter(pst => pst.taskId === t)
              if (subTask.length < 1) {
                console.log('missing subtask, this is messy')
                return
              }
              if (subTask.length > 1) {
                console.log('duplicate task found, this is very bad')
              }
              subTask = subTask[0]
              if (
                subTask === undefined ||
                subTask.subTasks === undefined ||
                subTask.priorities === undefined ||
                subTask.completed === undefined
              ) {
                console.log('invalid task data found, this is very bad')
                return
              }

              history.push(t)

              if (
                subTask.deck.indexOf(ev.memberId) >= 0 &&
                ev.taskId !== ev.memberId
              ) {
                clearPassesTo(tasks, subTask, ev.memberId)
                dropTask(subTask, ev.memberId)
              }
              newCards = newCards
                .concat(subTask.subTasks)
                .concat(subTask.priorities)
                .concat(subTask.completed)
            })
            crawler = newCards
          } while (crawler.length > 0)
        }
      })
      break
    case 'task-removed':
      for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i]
        if (task.taskId === ev.taskId) {
          tasks.splice(i, 1)
        }
      }
      tasks.forEach((t, i) => {
        t.subTasks = t.subTasks.filter(st => st !== ev.taskId)
        t.priorities = t.priorities.filter(st => st !== ev.taskId)
        t.completed = _.filter(t.completed, st => st !== ev.taskId)
        t.pins = _.filter(t.pins, pin => pin.taskId !== ev.taskId)
      })
      break
    case 'tasks-removed':
      for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i]
        if (ev.taskIds.includes(task.taskId)) {
          tasks.splice(i, 1)
        }
      }
      tasks.forEach((t, i) => {
        t.subTasks = t.subTasks.filter(st => !ev.taskIds.includes(st))
        t.priorities = t.priorities.filter(st => !ev.taskIds.includes(st))
        t.completed = t.completed.filter(st => !ev.taskIds.includes(st))
        t.pins = t.pins && Array.isArray(t.pins) ? t.pins.filter(pin => !ev.taskIds.includes(pin.taskId)) : []
      })
      break
    case 'pile-prioritized':
      inTask.priorities = inTask.priorities.concat(inTask.subTasks)
      inTask.subTasks = []
      break
    case 'task-refocused':
      atomicCardPlay(tasks, { taskId: ev.taskId, inId: ev.inId, zone: 'priorities'}, { taskId: ev.taskId, inId: ev.inId, zone: 'subTasks'})
      /*
          if (task.allocations && Array.isArray(task.allocations)) {
            task.allocations = _.filter(task.allocations, al => {
              if (al.allocatedId !== ev.taskId) {
                return true
              } else {
                task.boost = task.boost + al.amount
                return false
              }
            })
          }
      */
      break
    case 'pile-refocused':
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          task.priorities.forEach(stId => {
            tasks.forEach(st => {
              if (st.taskId === stId) {
                if (st.claimed && st.claimed.length >= 1) {
                  task.completed.push(stId)
                } else {
                  task.subTasks.push(stId)
                }
              }
            })
            task.priorities = []
            if (task.allocations && Array.isArray(task.allocations)) {
              task.allocations.forEach(allocation => {
                task.boost += allocation.amount
              })
              task.allocations = []
            }
          })
        }
      })
      break
    case 'task-played':
      atomicCardPlay(tasks, ev.from, ev.to, ev.memberId)
      break
    case 'task-sub-tasked':
      atomicCardPlay(tasks, { taskId: ev.subTask }, { taskId: ev.subTask, inId: ev.taskId, zone: 'subTasks'}, ev.memberId)
      break
    case 'task-de-sub-tasked':
      atomicCardPlay(tasks, { taskId: ev.subTask, inId: ev.taskId, zone: 'subtasks'}, { taskId: ev.subTask, zone: 'discard'}, ev.memberId)
      break
    case 'task-prioritized':
      atomicCardPlay(tasks, { taskId: ev.taskId, inId: ev.inId, zone: 'card' }, { taskId: ev.taskId, inId: ev.inId, zone: 'priorities'}, ev.memberId)
      break
    case 'grid-pin':
      if(typeof ev.y === 'string') {
        ev.y = parseInt(ev.y)
      }
      if(typeof ev.x === 'string') {
        ev.x = parseInt(ev.x)
      }
      atomicCardPlay(tasks, { taskId: ev.taskId, inId: ev.inId, zone: 'subTasks'}, { taskId: ev.taskId, inId: ev.inId, zone: 'grid', coords: { y: parseInt(ev.y), x: parseInt(ev.x) } }, ev?.memberId)
      break
    case 'grid-unpin':
      //console.log("event type is", ev.type)
      atomicCardPlay(tasks, { taskId: ev.taskId, inId: ev.inId, zone: 'grid', coords: { y: parseInt(ev.y), x: parseInt(ev.x) } }, { taskId: ev.taskId, inId: ev.inId, zone: 'subTasks', coords: { y: 0 } }, ev.memberId)
      break
    case 'task-emptied':
      let updateParents = []
      const emptiedParent = getTask(tasks, ev.taskId)
      updateParents = [...theTask.priorities, ...theTask.subTasks]
      theTask.priorities = []
      theTask.subTasks = []
      tasks.forEach(task => {
        if (updateParents.indexOf(task.taskId) >= 0) {
          removeParentIfNotParent(task, emptiedParent)
        }
      })
      break
    case 'task-guilded':
      if(!theTask) {
        console.log("Missing task for task-guilded")
        break
      }
      theTask.guild = ev.guild
      break
    case 'task-property-set':
      let properties = ev.property.split('.')
      
      if(properties?.length >= 2) {
        if(!theTask.hasOwnProperty(properties[0]) || typeof theTask[properties[0]] != 'object') {
          theTask[properties[0]] = {}
        }
        theTask[properties[0]][properties[1]] = ev.value
      } else {
        theTask[ev.property] = ev.value
      }
      if(ev.property === 'pinboard.spread') {
        unpinTasksOutOfBounds(tasks, theTask)
      }
      break
    case 'task-colored':
      theTask.color = ev.color
      
      if(ev.inId) {
        addSubTask(inTask, ev.taskId)
      }
      break
    case 'task-claimed':
      let paid = parseFloat(ev.paid) > 0 ? parseFloat(ev.paid) : 0
      let bounty = 0
      tasks.forEach(task => {
        let found = false
        task.priorities.some(taskId => {
          if (taskId !== ev.taskId) {
            return false
          } else {
            found = true
            return true
          }
        })

        task.subTasks.some(taskId => {
          if (taskId !== ev.taskId) {
            return false
          } else {
            found = true
            return true
          }
        })

        if (found) {
          if (task.priorities.indexOf(ev.taskId) === -1) {
            task.subTasks = _.filter(task.subTasks, tId => tId !== ev.subTask)
            task.completed = _.filter(task.completed, tId => tId !== ev.subTask)
            task.completed.push(ev.taskId)
          }
          // let alloc = false
          if (task.allocations && Array.isArray(task.allocations)) {
            task.allocations = _.filter(task.allocations, al => {
              if (al.allocatedId === ev.taskId) {
                bounty += al.amount
                return false
              }
              return true
            })
          }
        }
        if (task.taskId === ev.taskId) {
          clearPassesTo(tasks, task, ev.memberId)
          if (task.deck.indexOf(ev.memberId) === -1) {
            if (ev.taskId !== ev.memberId && ev.memberId) {
              task.deck.push(ev.memberId)
            }
          }
          if (task.claimed.indexOf(ev.memberId) === -1) {
            task.claimed.push(ev.memberId)
          }
          task.lastClaimed = ev.timestamp
        }
      })
      tasks.forEach(task => {
        if (task.taskId === ev.memberId) {
          task.boost += paid + bounty
        }
      })
      break
    case 'task-unclaimed':
      theTask.claimed = theTask.claimed.filter(mId => mId !== ev.memberId)
      if (theTask.claimed.length < 1) {
        tasks.forEach(p => {
          if (
            p.priorities.indexOf(ev.taskId) === -1 &&
            p.completed.indexOf(ev.taskId) > -1
          ) {
            p.completed = p.completed.filter(taskId => taskId !== ev.taskId)
            addSubTask(p, ev.taskId)
          }
        })
      }
      break
    case 'task-reset': // unused
      theTask.claimed = []
      theTask.lastClaimed = ev.timestamp
      break
    case 'task-boosted':
      let amount = parseFloat(ev.amount)
      let boost = parseFloat(theTask.boost)
      if (amount > 0) {
        theTask.boost = amount + boost
        theTask.address = ''
      }
      break
    case 'task-boosted-lightning':
      const taskToBoostLightning = getTaskBy(tasks, ev.payment_hash, 'payment_hash')
      let amountToBoost = parseFloat(ev.amount)
      let boostLightning = parseFloat(taskToBoostLightning.boost)
      if (amountToBoost > 0) {
        taskToBoostLightning.boost = amountToBoost + boostLightning
        taskToBoostLightning.bolt11 = ''
        taskToBoostLightning.payment_hash = ''
      }
      break
    case 'task-allocated':
      if (theTask.boost >= 1) {
        theTask.boost--
        if (
          !theTask.hasOwnProperty('allocations') ||
          !Array.isArray(theTask.allocations)
        ) {
          theTask.allocations = []
        }
        let alreadyPointed = theTask.allocations.some(als => {
          if (als.allocatedId === ev.allocatedId) {
            als.amount += 1
            return true
          }
        })
        if (!alreadyPointed) {
          if (!ev.amount || !Number.isInteger(ev.amount) || ev.amount < 1) {
            ev.amount = 1
          }
          theTask.allocations.push(ev)
        }
      }
      let reprioritized = _.filter(
        theTask.priorities,
        d => d !== ev.allocatedId
      )
      reprioritized.push(ev.allocatedId)
      theTask.priorities = reprioritized
      break
    case 'resource-booked':
      theTask.book = ev
      break
    case 'resource-used':
      const charged = parseFloat(ev.charged)
      if (charged > 0) {
        const memberCard = getTask(tasks, ev.memberId)
        memberCard.boost -= charged
        
        const resourceCard = getTask(tasks, ev.resourceId)
        resourceCard.boost += charged
      }
      break
    case 'invoice-created':
      theTask.payment_hash = ev.payment_hash
      theTask.bolt11 = ev.bolt11
      break
    case 'task-swapped':
      let task
      tasks.forEach(t => {
        if (t.taskId === ev.taskId) {
          task = t
        }
      })

      if (task) {
        let originalIndex = task.subTasks.indexOf(ev.swapId1)
        let swapIndex = task.subTasks.indexOf(ev.swapId2)

        let originalIndexCompleted = task.completed.indexOf(ev.swapId1)
        let swapIndexCompleted = task.completed.indexOf(ev.swapId2)

        if (originalIndex > -1 && swapIndex > -1) {
          let newST = task.subTasks.slice()
          newST[originalIndex] = ev.swapId2
          newST[swapIndex] = ev.swapId1
          task.subTasks = newST
        }

        if (originalIndexCompleted > -1 && swapIndexCompleted > -1) {
          let newCompleted = task.completed.slice()
          newCompleted[originalIndexCompleted] = ev.swapId2
          newCompleted[swapIndexCompleted] = ev.swapId1
          task.completed = newCompleted
        }
      }
      break
    case 'task-bumped':
      let taskB
      tasks.forEach(t => {
        if (t.taskId === ev.taskId) {
          taskB = t
        }
      })

      if (taskB) {
        let originalIndex = taskB.subTasks.indexOf(ev.bumpId)
        let originalIndexCompleted = taskB.completed.indexOf(ev.bumpId)
        if (
          originalIndex === taskB.subTasks.length - 1 &&
          ev.direction === -1
        ) {
          let newST = [ev.bumpId]
          newST = newST.concat(
            taskB.subTasks.slice(0, taskB.subTasks.length - 1)
          )
          taskB.subTasks = newST
        }

        if (originalIndex === 0 && ev.direction === 1) {
          let newST = taskB.subTasks.slice(1)
          newST.push(ev.bumpId)
          taskB.subTasks = newST
        }
      }
      break
    case 'tasks-received':
      const startLength = tasks.length
      //let changedIndexes = []
      ev.tasks.forEach(newT => {
        if (
          !tasks.some((cur, i) => {
            if (cur.taskId === newT.taskId) {
              safeMerge(cur, newT)
              //changedIndexes.push(i)
              return true
            }
          })
        ) {
          let safeClone = blankCard(
            newT.taskId,
            newT.name,
            newT.color,
            newT.timestamp,
            newT.parents,
            newT.height,
            newT.width
          )
          safeMerge(safeClone, newT)
          tasks.push(safeClone)
          //changedIndexes.push(tasks.length - 1)
        }
      })

      // Loop through the new cards and remove invalid references to cards that don't exist on this server
      /*changedIndexes.forEach(tId => {
        const t = tasks[tId]
        let beforeLength = t.subTasks.length
        t.subTasks = _.filter(t.subTasks, stId => taskExists(tasks, stId))
        t.priorities = t.priorities.filter(stId => taskExists(tasks, stId))
        t.completed = t.completed.filter(stId => taskExists(tasks, stId))
        t.deck = t.deck.filter(stId =>
          tasks.some(sst => sst.taskId === stId && sst.taskId === sst.name)
        )
        if (t?.grid?.rows && Object.keys(t.grid.rows).length >= 1) {
          let filteredRows = {}
          Object.entries(t.grid.rows).forEach(([x, row]) => {
            let filteredRow = {}

            if (row) {
              Object.entries(row).forEach(([y, stId]) => {
                if (taskExists(tasks, stId)) {
                  filteredRow[y] = stId
                }
              })
              if (Object.keys(filteredRow).length < 1) {
                filteredRows[x] = {}
              } else {
                filteredRows[x] = filteredRow
              }
            }
          })
          t.grid.rows = filteredRows
        }
      })*/
      break
    case 'task-visited':
      // Remove the avatar from everywhere else
      tasks.forEach(task => {
        if (task.hasOwnProperty('avatars')) {
          task.avatars = task.avatars.filter(
            avatarLocation => avatarLocation.memberId !== ev.memberId
          )
        }
      })
      if (!theTask.hasOwnProperty('avatars')) {
        theTask.avatars = []
      }
      theTask.avatars.push({
        memberId: ev.memberId,
        timestamp: ev.timestamp,
        area: ev.area,
      })
      theTask.lastClaimed = ev.timestamp
      break
    case 'member-charged':
      memberTask.boost -= parseFloat(ev.charged)
      if (memberTask.boost < 0) {
        memberTask.boost = 0
      }
      break
    case 'grid-created':
      tasks.push(
        blankCard(
          ev.taskId,
          ev.name,
          ev.color,
          ev.timestamp,
          ev.deck,
          ev.height,
          ev.width
        )
      )
      break
    case 'grid-added':
      theTask.pinboard = blankPinboard(ev.height, ev.width, ev.spread)
      break
    case 'grid-removed':
      theTask.pins = []
      theTask.pinboard = false
      break
    case 'grid-resized':
      if (!theTask.pinboard) {
        theTask.pinboard = blankPinboard(ev.height, ev.width)
      }
      theTask.pinboard.height = ev.height
      theTask.pinboard.width = ev.width
      theTask.pinboard.size = ev.size || 9
      unpinTasksOutOfBounds(tasks, theTask)
      break
  }
}

export default {
  aoMuts,
  cashMuts,
  membersMuts,
  resourcesMuts,
  memesMuts,
  sessionsMuts,
  tasksMuts,
  POTENTIALS_TO_EXECUTE,
}
