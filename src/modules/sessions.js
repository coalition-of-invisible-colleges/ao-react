const M = require('../mutations')

const state = []

const mutations = {
    setCurrent(sessions, current){
        sessions.length = 0
        current.sessions.forEach( session => {
            sessions.push(session)
        })
    },
    applyEvent: M.sessionsMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions
}
