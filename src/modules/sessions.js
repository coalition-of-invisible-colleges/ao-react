import M from '../mutations.js'

const state = []

const mutations = {
  setCurrent(sessions, current) {
    sessions.length = 0
    current.sessions.forEach(session => {
      sessions.push(session)
    })
  },
  applyEvent: M.sessionsMuts
}

const actions = {}

export default {
  state,
  mutations,
  actions
}
