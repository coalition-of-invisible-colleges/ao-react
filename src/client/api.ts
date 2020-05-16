import request from 'superagent'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import _ from 'lodash'
import configuration from '../../client-configuration'
import aoStore, { Task, Grid } from './store'
import io from 'socket.io-client'
import { composeP } from 'ramda'

class AoApi {
  constructor(public socket) {}

  async createSession(user: string, pass: string): Promise<boolean> {
    const session = uuidV1()
    let sessionKey = cryptoUtils.createHash(
      session + cryptoUtils.createHash(pass)
    )
    const token = cryptoUtils.hmacHex(session, sessionKey)
    return request
      .post('/session')
      .set('authorization', token)
      .set('session', session)
      .set('name', user)
      .on('error', () => false)
      .then(res => {
        aoStore.state.token = token
        aoStore.state.session = session
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
          aoStore.state.session = session
          aoStore.state.token = token
          aoStore.state.user = user
          console.log('initialState', res.body)
          aoStore.initializeState(res.body)
          return true
        })
        .catch(() => false)
    }
    return Promise.resolve(false)
  }

  async nameAo(newName: string): Promise<request.Response> {
    const act = {
      type: 'ao-named',
      alias: newName
    }
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
      memberId: aoStore.member.memberId
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
      type: 'doge-muted',
      memberId: aoStore.member.memberId
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
      type: 'doge-unmuted',
      memberId: aoStore.member.memberId
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async createCard(name: string): Promise<request.Response> {
    const act = {
      type: 'task-created',
      name: name,
      color: 'blue',
      deck: [aoStore.member.memberId],
      inId: aoStore.memberCard.taskId,
      prioritized: false
    }
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
    prioritized?: boolean
  ): Promise<request.Response> {
    let found = aoStore.cardByName.get(name.trim())
    let act
    if (found) {
      if (prioritized) {
        return this.prioritizeCard(found.taskId, inId)
      } else {
        act = {
          type: 'task-sub-tasked',
          taskId: inId,
          subTask: found.taskId,
          memberId: aoStore.member.memberId
        }
      }
    } else {
      act = {
        type: 'task-created',
        name: name,
        color: 'blue',
        deck: [aoStore.member.memberId],
        inId: inId,
        prioritized: prioritized
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
      blame: aoStore.member.memberId
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
      blame: aoStore.member.memberId
    }
    console.log('colorCard act is ', act)
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
      memberId: aoStore.member.memberId
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
      memberId: aoStore.member.memberId
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
      memberId: aoStore.member.memberId
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
      memberId: aoStore.member.memberId
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
      fromMemberId: aoStore.member.memberId
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
      blame: aoStore.member.memberId
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
      blame: aoStore.member.memberId
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
    position?: number = 0
  ): Promise<request.Response> {
    const act = {
      type: 'task-prioritized',
      taskId: taskId,
      inId: inId,
      position: position
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
      inId: inId
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
    console.log('refocusCard')
    const act = {
      type: 'task-refocused',
      taskId: taskId,
      inId: inId,
      blame: aoStore.member.memberId
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async refocusPile(taskId: string, inId: string): Promise<request.Response> {
    const act = {
      type: 'pile-refocused',
      inId: inId
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async valueCard(taskId: string, value: number): Promise<request.Response> {
    const act = {
      type: 'task-valued',
      taskId: taskId,
      value: value,
      blame: aoStore.member.memberId
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
      memberId: aoStore.member.memberId
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
      memberId: aoStore.member.memberId
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
      endTs: endTime
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
    const secret = cryptoUtils.createHash(name)
    const act = {
      type: 'member-created',
      name,
      secret,
      fob
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
    newValue: string
  ): Promise<request.Response> {
    const secret = cryptoUtils.createHash(name)
    if (field === 'secret') {
      newValue = cryptoUtils.createHash(newValue)
    }
    const act = {
      type: 'member-field-updated',
      memberId: aoStore.member.memberId,
      field: field,
      newfield: newValue
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
    console.log('commitTime API')
    const act = {
      type: 'task-time-clocked',
      taskId: taskId,
      memberId: aoStore.member.memberId,
      seconds: seconds,
      date: date
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
      memberId: aoStore.member.memberId
    }
    console.log('card marked seen')
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
      width: newWidth
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
      deck: [aoStore.member.memberId]
    }
    console.log('createGrid action is ', act)
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
      width: width
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
    console.log('pinCardToGrid')
    const task: Task = aoStore.cardByName.get(name)
    if (_.isObject(task)) {
      console.log('card already exists')

      const act = {
        type: 'grid-pin',
        taskId: task.taskId,
        x: x,
        y: y,
        inId: inId
      }
      console.log('act is ', act)
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
        inId: aoStore.memberCard.taskId,
        prioritized: false
      }
      console.log('act is ', act)
      return request
        .post('/events')
        .set('Authorization', aoStore.state.token)
        .send(act)
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          const gridAct = {
            type: 'grid-pin',
            taskId: taskId,
            x: x,
            y: y,
            inId: inId
          }
          console.log('act is ', act)
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
      inId
    }
    return request
      .post('/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  logout() {
    aoStore.resetState()
    window.localStorage.clear()
  }

  startSocketListeners() {
    this.socket.connect()
    this.socket.on('connect', () => {
      console.log('connected')
      this.socket.emit('authentication', {
        session: aoStore.state.session,
        token: aoStore.state.token
      })
    })
    this.socket.on('authenticated', () => {
      console.log('authenticated')
      this.socket.on('eventstream', ev => {
        console.log('event', ev)
        aoStore.applyEvent(ev)
      })
    })
    this.socket.on('disconnect', () => {
      console.log('disconnected')
      this.socket.connect()
    })
  }
}
const socket = io.connect(
  configuration.socketUrl ? configuration.socketUrl : '/',
  {
    autoConnect: false
  }
)
const api = new AoApi(socket)
export default api
