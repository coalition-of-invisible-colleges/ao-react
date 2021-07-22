import M from '../mutations.js'

const state = [] // aka files (in this file):

const mutations = {
  setCurrent(memes, current) {
    memes.length = 0
    if (!current.memes) {
      current.memes = []
    }
    current.memes.forEach(meme => {
      memes.push(meme)
    })
  },
  applyEvent: M.memesMuts
}

const actions = {}

export default {
  state,
  mutations,
  actions
}
