const M = require('../mutations')

const state = []

const mutations = {
  setCurrent(tasks, current) {
    tasks.forEach((task, i) => {
      delete tasks[i]
    })
    tasks.length = 0
    current.tasks.forEach(task => {
      let index = tasks.push(task) - 1
      // _.assign(tasks[index].grid, task.grid)
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
