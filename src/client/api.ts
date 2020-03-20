import request from 'superagent'
import _ from 'lodash'
import aoStore from './store'

class AoApi {
  constructor() {}
  public createCard(name: string): Promise<request.Response> {
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

  addCardToGrid(x, y, taskId) {
    return {
      type: 'grid-add',
      taskId,
      coord: {
        x: x,
        y: y
      }
    }
  }
}

const api = new AoApi()
export default api
