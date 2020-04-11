import request from 'superagent'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import _ from 'lodash'
import configuration from '../../client-configuration'
import aoStore, { Task } from './store'
import io from 'socket.io-client'

class AoApi {
  constructor(public socket) {}

  async createSession(user: string, pass: string): Promise<void> {
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
      .end((err, res) => {
        if (err) {
          console.log('err', err)
          return (err = err.message)
        }
        aoStore.state.token = token
        aoStore.state.session = session
        window.localStorage.setItem('token', token)
        window.localStorage.setItem('session', session)
      })
  }

  async fetchState(): Promise<void> {
    return request
      .post('/state')
      .set('Authorization', aoStore.state.token)
      .end((err, res) => {
        if (err || !res.body) {
          aoStore.state.loggedIn = false
        } else {
          // setCurrent(aoStore.state, res.body)
          aoStore.initializeState(res.body)
        }
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
  onLoad() {
    this.socket.open()
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
