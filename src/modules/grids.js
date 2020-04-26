const _ = require('lodash')
const M = require('../mutations')

const state = []

const mutations = {
  setCurrent(grids, current) {
    console.log('setCurrent grids')
    Object.keys(grids).forEach((grid, i) => {
      Object.keys(grid.rows).forEach((row, y) => {
        Object.keys(row).forEach((square, x) => {
          delete grids[i].rows[y][x]
        })
        delete grids[i].rows[y]
      })
      delete grids[i]
    })
    _.assign(grids, current.grids)
  },
  applyEvent: M.gridsMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions
}
