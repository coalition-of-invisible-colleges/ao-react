import request from 'superagent'
import uuidV1 from 'uuid/v1'
import { createHash, hmacHex } from '../crypto'
import _ from 'lodash'
import config from '../../configuration'
import aoStore, { Task, Grid } from './store'
import { io } from 'socket.io-client'

import { runInAction, reaction } from 'mobx'

class AoApi {
  constructor(public socket) {}

  async createSession(user: string, pass: string): Promise<boolean> {
    const session = uuidV1()
    let sessionKey = createHash(session + createHash(pass))
    const token = hmacHex(session, sessionKey)
    return request
      .post('/session')
      .set('authorization', token)
      .set('session', session)
      .set('name', user)
      .on('error', () => false)
      .then(res => {
        // clear any existing stale data from localstorage
        window.localStorage.removeItem('user')
        window.localStorage.removeItem('token')
        window.localStorage.removeItem('session')
        // set new session info
        window.localStorage.setItem('user', user)
        window.localStorage.setItem('token', token)
        window.localStorage.setItem('session', session)
        return true
      })
  }

  async fetchState(): Promise<boolean> {
    const session = window.localStorage.getItem('session')
    const token = window.localStorage.getItem('token')
    const user = window.localStorage.getItem('user')
    if (session && token && user) {
      return request
        .post('/state')
        .set('Authorization', token)
        .then(res => {
          aoStore.state.user = user
          // console.log(
          //   'AO: client/api.ts: fetchState: initial state: ',
          //   res.body
          // )

          let dataPackageToSendToClient = res.body

          aoStore.initializeState(dataPackageToSendToClient.stateToSend)

          let metaData = dataPackageToSendToClient.metaData
          aoStore.memberDeckSize = metaData.memberDeckSize
          aoStore.bookmarksTaskId = metaData.bookmarksTaskId

          return true
        })
        .catch(() => false)
    }
    return Promise.resolve(false)
  }

  async nameAo(newName: string): Promise<request.Response> {
    const act = {
      type: 'ao-named',
      alias: newName,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async connectToAo(
    address: string,
    secret: string
  ): Promise<request.Response> {
    const act = {
      type: 'ao-outbound-connected',
      address: address,
      secret: secret,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async linkCardOnAo(
    taskId: string,
    address: string
  ): Promise<request.Response> {
    const act = {
      type: 'ao-linked',
      address: address,
      taskId: taskId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async setQuorum(quorum: number): Promise<request.Response> {
    const act = {
      type: 'quorum-set',
      quorum: quorum,
    }
    // console.log('act is ', act)
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async bark(): Promise<request.Response> {
    const act = {
      type: 'doge-barked',
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async hopped(taskId: string): Promise<request.Response> {
    const act = {
      type: 'doge-hopped',
      memberId: aoStore.member.memberId,
      taskId: taskId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async mute(): Promise<request.Response> {
    const act = {
      type: 'member-field-updated',
      memberId: aoStore.member.memberId,
      field: 'muted',
      newfield: true,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async unmute(): Promise<request.Response> {
    const act = {
      type: 'member-field-updated',
      memberId: aoStore.member.memberId,
      field: 'muted',
      newfield: false,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async createCard(
    name: string,
    anonymous?: boolean
  ): Promise<request.Response> {
    const act = {
      type: 'task-created',
      name: name,
      color: 'blue',
      deck: anonymous
        ? []
        : aoStore.member && aoStore.member.memberId
        ? [aoStore.member.memberId]
        : [],
      inId: anonymous ? null : aoStore.memberCard.taskId || null,
      prioritized: false,
    }
    // console.log('AO: client/api.ts: createCard: ', {
    //   act,
    //   'aoStore.memberCard': aoStore.memberCard,
    // })
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async findOrCreateCardInCard(
    name: string,
    inId: string,
    prioritized: boolean = false,
    color: string = 'blue',
    anonymous?: boolean
  ): Promise<request.Response> {
    let found = aoStore.cardByName.get(name.toLowerCase())
    let act
    if (found) {
      if (prioritized) {
        return this.prioritizeCard(found.taskId, inId)
      } else {
        act = {
          type: 'task-sub-tasked',
          taskId: inId,
          subTask: found.taskId,
          memberId: anonymous ? null : aoStore.member.memberId,
        }
      }
    } else {
      act = {
        type: 'task-created',
        name: name,
        color: color,
        deck: anonymous ? [] : [aoStore.member.memberId],
        inId: inId,
        prioritized: prioritized,
      }
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async discardCardFromCard(
    taskId: string,
    inId: string
  ): Promise<request.Response> {
    const act = {
      type: 'task-de-sub-tasked',
      taskId: inId,
      subTask: taskId,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // Empties a card's priorities and subtasks
  async emptyCard(taskId: string): Promise<request.Response> {
    const act = {
      type: 'task-emptied',
      taskId: taskId,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async colorCard(taskId: string, color: string): Promise<request.Response> {
    const act = {
      type: 'task-colored',
      taskId: taskId,
      color: color,
      inId: null, // add this when we have context, mutation works on server
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async grabCard(taskId: string): Promise<request.Response> {
    const act = {
      type: 'task-grabbed',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async grabPile(taskId: string): Promise<request.Response> {
    const act = {
      type: 'pile-grabbed',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async dropCard(taskId: string): Promise<request.Response> {
    const act = {
      type: 'task-dropped',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async removeCards(taskIds: string[]): Promise<request.Response> {
    const act = {
      type: 'tasks-removed',
      taskIds: taskIds,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async dropPile(taskId: string): Promise<request.Response> {
    const act = {
      type: 'pile-dropped',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async passCard(
    taskId: string,
    toMemberId: string
  ): Promise<request.Response> {
    const act = {
      type: 'task-passed',
      taskId: taskId,
      toMemberId: toMemberId,
      fromMemberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async swapCard(
    inId: string,
    taskId1: string,
    taskId2: string
  ): Promise<request.Response> {
    const act = {
      type: 'task-swapped',
      taskId: inId,
      swapId1: taskId1,
      swapId2: taskId2,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async bumpCard(
    taskId: string,
    inId: string,
    direction: number
  ): Promise<request.Response> {
    const act = {
      type: 'task-bumped',
      taskId: inId,
      bumpId: taskId,
      direction: direction,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async prioritizeCard(
    taskId: string,
    inId: string,
    position: number = 0
  ): Promise<request.Response> {
    const act = {
      type: 'task-prioritized',
      taskId: taskId,
      inId: inId,
      position: position,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async prioritizePile(inId: string): Promise<request.Response> {
    const act = {
      type: 'task-prioritized',
      inId: inId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async refocusCard(taskId: string, inId: string): Promise<request.Response> {
    const act = {
      type: 'task-refocused',
      taskId: taskId,
      inId: inId,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async refocusPile(inId: string): Promise<request.Response> {
    const act = {
      type: 'pile-refocused',
      inId: inId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async allocatePriority(
    inId: string,
    taskId: string,
    points = 1
  ): Promise<request.Response> {
    const act = {
      type: 'task-allocated',
      taskId: inId,
      allocatedId: taskId,
      amount: points,
      blame: aoStore.member.memberId,
      inId: inId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async titleMissionCard(
    taskId: string,
    newTitle: string
  ): Promise<request.Response> {
    const act = {
      type: 'task-guilded',
      taskId: taskId,
      guild: newTitle,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async setCardProperty(
    taskId: string,
    property: string,
    value: any
  ): Promise<request.Response> {
    const act = {
      type: 'task-property-set',
      taskId: taskId,
      property: property,
      value: value,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async completeCard(taskId: string): Promise<request.Response> {
    const act = {
      type: 'task-claimed',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async uncheckCard(taskId: string): Promise<request.Response> {
    const act = {
      type: 'task-unclaimed',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async setClaimInterval(
    taskId: string,
    newClaimInterval: number
  ): Promise<request.Response> {
    const act = {
      type: 'task-property-set',
      taskId: taskId,
      property: 'claimInterval',
      value: newClaimInterval,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async createResource(
    resourceId: string,
    name: string,
    charged: number,
    secret: string,
    trackStock: boolean
  ): Promise<request.Response> {
    const act = {
      type: 'resource-created',
      resourceId: resourceId,
      name: name,
      charged: charged,
      secret: secret,
      trackStock: trackStock,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async useResource(
    resourceId: string,
    amount: number,
    charged: number,
    notes: string = ''
  ): Promise<request.Response> {
    const act = {
      type: 'resource-used',
      resourceId: resourceId,
      memberId: aoStore.member.memberId,
      amount: amount,
      charged: charged,
      notes: notes,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async stockResource(
    resourceId: string,
    amount: number,
    paid: number,
    notes: string = ''
  ): Promise<request.Response> {
    const act = {
      type: 'resource-stocked',
      resourceId: resourceId,
      memberId: aoStore.member.memberId,
      amount: amount,
      paid: paid,
      notes: notes,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async purgeResource(resourceId: string): Promise<request.Response> {
    const act = {
      type: 'resource-purged',
      resourceId: resourceId,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async bookResource(
    taskId: string,
    startTime: number,
    endTime: number
  ): Promise<request.Response> {
    const act = {
      type: 'resource-booked',
      resourceId: taskId,
      memberId: aoStore.member.memberId,
      startTs: startTime,
      endTs: endTime,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async createMember(
    name: string,
    fob: string = ''
  ): Promise<request.Response> {
    const secret = createHash(name)
    const act = {
      type: 'member-created',
      name,
      secret,
      fob,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async activateMember(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-activated',
      memberId: memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async deactivateMember(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-deactivated',
      memberId: memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // senpai function
  async resetPassword(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-secret-reset',
      kohaiId: memberId,
      senpaiId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // senpai function
  async promoteMember(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-promoted',
      kohaiId: memberId,
      senpaiId: aoStore.member.memberId,
    }

    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // senpai function
  async banMember(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-banned',
      kohaiId: memberId,
      senpaiId: aoStore.member.memberId,
    }

    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // senpai function
  async unbanMember(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-unbanned',
      kohaiId: memberId,
      senpaiId: aoStore.member.memberId,
    }

    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // senpai function
  async purgeMember(memberId: string): Promise<request.Response> {
    const act = {
      type: 'member-purged',
      memberId: memberId,
      blame: aoStore.member.memberId,
    }

    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async updateMemberField(
    field: string,
    newValue: any
  ): Promise<request.Response> {
    if (field === 'secret') {
      newValue = createHash(newValue)
    }
    const act = {
      type: 'member-field-updated',
      memberId: aoStore.member.memberId,
      field: field,
      newfield: newValue,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  // Each member has a list of tickers. Each ticker is a string.
  // Sets the ticker at position tickerListIndex to symbol coinSymbol.
  async setTicker(
    fromCoin: string,
    toCoin: string,
    tickerListIndex: number
  ): Promise<request.Response> {
    const act = {
      type: 'member-ticker-set',
      memberId: aoStore.member.memberId,
      fromCoin: fromCoin,
      toCoin: toCoin,
      index: tickerListIndex,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async clockTime(seconds, taskId, date): Promise<request.Response> {
    const act = {
      type: 'task-time-clocked',
      taskId: taskId,
      memberId: aoStore.member.memberId,
      seconds: seconds,
      date: date,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async startTimeClock(taskId, inId): Promise<request.Response> {
    const act = {
      type: 'task-started',
      taskId: taskId,
      inId: inId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async stopTimeClock(taskId): Promise<request.Response> {
    const act = {
      type: 'task-stopped',
      taskId: taskId,
      memberId: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async signCard(taskId: string, opinion = 1): Promise<request.Response> {
    const act = {
      type: 'task-signed',
      taskId: taskId,
      memberId: aoStore.member.memberId,
      opinion: opinion,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async assignMembership(
    taskId: string,
    memberId: string,
    level: number
  ): Promise<request.Response> {
    const act = {
      type: 'task-membership',
      taskId: taskId,
      memberId: memberId,
      level: level,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async stashCard(
    taskId: string,
    inId: string,
    level: number
  ): Promise<request.Response> {
    const act = {
      type: 'task-stashed',
      taskId: taskId,
      inId: inId,
      level: level,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async unstashCard(
    taskId: string,
    inId: string,
    level: number
  ): Promise<request.Response> {
    const act = {
      type: 'task-unstashed',
      taskId: taskId,
      inId: inId,
      level: level,
      blame: aoStore.member.memberId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async visitCard(
    taskId: string,
    inChat = false,
    notify = false
  ): Promise<request.Response> {
    const act = {
      type: 'task-visited',
      taskId: taskId,
      memberId: aoStore.member.memberId,
      area: inChat ? 1 : 0,
      notify: notify,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async markSeen(taskId): Promise<request.Response> {
    const task: Task = aoStore.hashMap.get(taskId)
    const act = {
      type: 'task-seen',
      taskId: task.taskId,
      memberId: aoStore.member.memberId,
    }
    // console.log('card marked seen')
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async resizeGrid(
    taskId: string,
    newHeight: number,
    newWidth: number
  ): Promise<request.Response> {
    const act = {
      type: 'grid-resized',
      taskId: taskId,
      height: newHeight,
      width: newWidth,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async createCardWithGrid(
    name: string,
    height: number,
    width: number
  ): Promise<request.Response> {
    const act = {
      type: 'grid-created',
      name: name,
      height: height,
      width: width,
      color: 'blue',
      deck: [aoStore.member.memberId],
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async addGridToCard(
    taskId: string,
    height: number,
    width: number
  ): Promise<request.Response> {
    const act = {
      type: 'grid-added',
      taskId: taskId,
      height: height,
      width: width,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async removeGridFromCard(taskId: string): Promise<request.Response> {
    const act = {
      type: 'grid-removed',
      taskId: taskId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async pinCardToGrid(
    x: number,
    y: number,
    name: string,
    inId: string
  ): Promise<request.Response> {
    const task: Task = aoStore.cardByName.get(name.toLowerCase())
    // console.log("AO: client/api.ts: pinCardToGrid: ", {x, y, name, inId, task})

    if (_.isObject(task)) {
      const act = {
        type: 'grid-pin',
        inId: inId,
        taskId: task.taskId,
        x: x,
        y: y,
        memberId: aoStore.member.memberId,
      }
      return request
        .post('/events')
        .set('Authorization', aoStore.state.token)
        .send(act)
        .then(res => {
          return res
        })
    } else {
      const act = {
        type: 'task-created',
        name: name,
        color: 'blue',
        deck: [aoStore.member.memberId],
        inId: inId,
        prioritized: false,
      }
      return request
        .post('/events')
        .set('Authorization', aoStore.state.token)
        .send(act)
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          const gridAct = {
            type: 'grid-pin',
            inId: inId,
            taskId: taskId,
            x: x,
            y: y,
            memberId: aoStore.member.memberId,
          }
          return request
            .post('/events')
            .set('Authorization', aoStore.state.token)
            .send(gridAct)
        })
    }
  }

  async unpinCardFromGrid(
    x: number,
    y: number,
    inId: string
  ): Promise<request.Response> {
    const act = {
      type: 'grid-unpin',
      x,
      y,
      inId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async fetchMeme(memeHash: string, progressCallback): Promise<Blob> {
    return request
      .get('/meme/' + memeHash)
      .responseType('blob')
      .set('Authorization', aoStore.state.token)
      .on('progress', function (e) {
        console.log(e.direction, 'is done', e.percent, '%')
        progressCallback(e.percent)
      })

      .then(res => {
        // console.log('got meme! res is ', res)
        return res.body
      })
  }

  async downloadMeme(memeHash: string): Promise<request.Response> {
    return request
      .get('/download/' + memeHash)
      .set('Authorization', aoStore.state.token)
      .then(res => {
        // console.log('got meme! res is ', res)
        return res
      })
  }

  async uploadMemes(formData, progressCallback): Promise<request.Response> {
    return request
      .post('/upload')
      .set('Authorization', aoStore.state.token)
      .send(formData)
      .on('progress', function (e) {
        console.log('Percentage done: ', e)
        if (e && e.hasOwnProperty('percent') && e.percent >= 0) {
          progressCallback(e.percent)
        }
      })
      .on('error', err => {
        console.log('Upload  failed with error:', err)
        return false
      })
      .then(res => {
        console.log('sent files. res is', res)
        return res
      })
  }

  async cacheMeme(taskId: string): Promise<request.Response> {
    const act = {
      type: 'meme-cached',
      taskId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async logout(): Promise<request.Response> {
    console.log('processing logoutz')
    aoStore.resetState()
    window.localStorage.clear()
    //clear cookie

    return request
      .post('/logout')
      .set('Authorization', aoStore.state.token)
      .send({})
      .then(res => {
        return res
      })
  }

  async requestBtcQr(taskId: string): Promise<request.Response> {
    const act = {
      type: 'address-updated',
      taskId,
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  startSocketListeners() {
    this.socket.connect()
    this.socket.on('connect', () => {
      console.log('connected', { 'aoStore.state': aoStore.state })

      runInAction(() => {
        aoStore.state.socketState = 'attemptingAuthentication'
      })

      console.log(
        'emit auth: session: ' +
          window.localStorage.getItem('session') +
          ', token: ' +
          window.localStorage.getItem('token')
      )
      this.socket.emit('authentication', {
        session: window.localStorage.getItem('session'),
        token: window.localStorage.getItem('token'),
      })
    })
    this.socket.on('authenticated', () => {
      console.log('authenticated')

      this.fetchState().then(() => {
        runInAction(() => {
          aoStore.state.socketState = 'authenticationSuccess'
        })
      })

      this.socket.on('eventstream', ev => {
        console.log('AO: client/api.ts: socketListener: event:', ev)

        aoStore.applyEvent(ev)
      })
    })
    this.socket.on('disconnect', reason => {
      console.log('disconnected')

      runInAction(() => {
        aoStore.state.socketState = 'authenticationFailed'
      })

      this.socket.connect()
    })
  }
}

reaction(
  () => {
    return aoStore.state.socketState
  },
  socketState => console.log('AO: client/api.ts: socketState: ' + socketState)
)
const socket = io(config.socketUrl ? config.socketUrl : '/', {
  autoConnect: false,
})
const api = new AoApi(socket)
export default api
