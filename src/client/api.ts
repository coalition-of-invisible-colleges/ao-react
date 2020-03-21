import request from 'superagent'
import _ from 'lodash'
import aoStore from './store'

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
    console.log('action!', act)
    console.log('member card!', aoStore.memberCard)
    console.log('create')
    return request
      .post('http://localhost:8003/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }

  async addCardToGrid(x, y, taskId): Promise<request.Response> {
    const act = {
      type: 'grid-add',
      taskId,
      coord: {
        x: x,
        y: y
      }
    }
    return request
      .post('http://localhost:8003/events')
      .set('Authorization', aoStore.state.token)
      .send(act)
      .then(res => {
        return res
      })
  }
  // async createAndOrAddCardToGrid(x, y, name): Promise<request.Response> {
  //   if (_.isObject())
  //     return this.addCardToGrid(x, y, taskId)
  //   else return this.createCard()
  // }
}

const api = new AoApi()
export default api
