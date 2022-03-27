import M from '../mutations.js'
import _ from 'lodash'

const state = []

const mutations = {
  setCurrent(tasks, current) {
    tasks.forEach((task, i) => {
      delete tasks[i]
    })
    tasks.length = 0
    current.tasks.forEach((task, index) => {
      tasks.push(task)
    })
  },
  applyEvent: M.tasksMuts
}

const actions = {}

export default {
  state,
  mutations,
  actions
}
