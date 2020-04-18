import request from 'superagent'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import _ from 'lodash'
import configuration from '../../client-configuration'
import aoStore, { Task } from './store'
import io from 'socket.io-client'

class AoApi {
  constructor(public socket) {
    this.onLoad = this.onLoad.bind(this)
  }

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
    return request
      .post('/state')
      .set('Authorization', token)
      .then(res => {
        aoStore.state.session = session
        aoStore.state.token = token
        aoStore.state.user = user
        aoStore.initializeState(res.body)
        return true
      })
      .catch(() => false)
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
      inId: aoStore.memberCard.taskId
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

  async delCardFromGrid(x: number, y: number): Promise<request.Response> {
    const act = {
      type: 'grid-del',
      coord: {
        x,
        y
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

  async addCardToGrid(x, y, name): Promise<request.Response> {
    const task: Task = aoStore.memberByName.get(name)
    const act = {
      type: 'grid-add',
      taskId: task.taskId,
      coord: {
        x: x,
        y: y
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

  async createAndOrAddCardToGrid(x, y, name): Promise<request.Response> {
    const task: Task = aoStore.memberByName.get(name)
    if (_.isObject(task)) {
      const act = {
        type: 'grid-add',
        taskId: task.taskId,
        coord: {
          x: x,
          y: y
        }
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
        inId: aoStore.memberCard.taskId
      }
      return request
        .post('/events')
        .set('Authorization', aoStore.state.token)
        .send(act)
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          const gridAct = {
            type: 'grid-add',
            taskId,
            coord: {
              x: x,
              y: y
            }
          }
          return request
            .post('/events')
            .set('Authorization', aoStore.state.token)
            .send(gridAct)
        })
    }
  }
  logout() {
    this.socket.emit('disconnect')
    this.socket.close()
    aoStore.resetState()
    window.localStorage.setItem('user', null)
    window.localStorage.setItem('session', null)
    window.localStorage.setItem('token', null)
  }
  onLoad() {
    socket.connect()
  }
  startSocketListeners() {
    socket.open()
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
