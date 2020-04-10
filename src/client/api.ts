import request from 'superagent'
import _ from 'lodash'
import aoStore, { Task } from './store'

class AoApi {
  constructor() {}
  async createCard(name: string): Promise<request.Response> {
    const act = {
      type: 'task-created',
      name: name,
      color: 'blue',
      deck: [aoStore.member.memberId],
      inId: aoStore.memberCard.taskId
    }
    return request
      .post('http://107.172.5.114:8003//events')
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
      .post('http://107.172.5.114:8003//events')
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
        .post('http://107.172.5.114:8003//events')
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
        .post('http://107.172.5.114:8003//events')
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
            .post('http://107.172.5.114:8003//events')
            .set('Authorization', aoStore.state.token)
            .send(gridAct)
        })
    }
  }
}

const api = new AoApi()
export default api
