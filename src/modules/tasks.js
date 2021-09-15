const M = require('../mutations')
const _ = require('lodash')

const state = []

const mutations = {
  setCurrent(tasks, current) {
    tasks.forEach((task, i) => {
      delete tasks[i]
    })
    tasks.length = 0
    current.tasks.forEach(task => {
      tasks.push(task)
      // _.assign(tasks[index].grid, task.grid) // does not solve the +grid not rerendering glitch... or does it?
    })
  },
  applyEvent: M.tasksMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions
}
