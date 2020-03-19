const _ = require('lodash')
const M = require('../mutations')

const state = []

const mutations = {
  setCurrent(grid, current) {
    Object.keys(grid).forEach(y => {
      Object.keys(grid[y]).forEach(x => {
        delete grid[y][x]
      })
      delete grid[y]
    })
    _.assign(grid, current.grid)
  },
  applyEvent: M.gridMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions
}
