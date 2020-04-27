const M = require('../mutations')

const state = []

const mutations = {
  setCurrent(tasks, current) {
    console.log('setCurrent in tasks')
    tasks.forEach((task, i) => {
      delete tasks[i]
    })
    tasks.length = 0
    current.tasks.forEach(task => {
      let index = tasks.push(task) - 1
      console.log('task just updated is ', tasks[index])
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
