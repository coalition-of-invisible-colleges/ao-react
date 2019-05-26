import request from 'superagent'
import M from '../mutations'

const state = []
const mutations = {
    setCurrent(recent, current){
        recent.length = 0 // empties 
        current.recent.forEach( r => {
            recent.push(r)
        })
    },
    applyEvent: M.recentMuts
}

const actions = {}

export default {
  state,
  mutations,
  actions,
}
