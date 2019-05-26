import request from 'superagent'
import M from '../mutations'

const state = [] // aka members (in this file):

const mutations = {
    setCurrent(members, current){
        members.length = 0
        current.members.forEach( member => {
            members.push(member)
        })
    },
    applyEvent: M.membersMuts
}

const actions = {}

export default {
  state,
  mutations,
  actions
}
