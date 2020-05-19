const M = require('../mutations')

const state = [] // aka files (in this file):

const mutations = {
  setCurrent(memes, current) {
    memes.length = 0
    console.log('memes setCurrent 1')
    if (!current.memes) {
      current.memes = []
    }
    console.log('memes setCurrent 2')
    current.memes.forEach(meme => {
      memes.push(meme)
    })
    console.log('memes setCurrent 3')
  },
  applyEvent: M.memesMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions
}
