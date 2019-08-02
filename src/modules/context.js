
const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]


const state = {
    parent: [],
    panel: [],
    top: 0,
    completed: false
}

const mutations = {
    toggleCompleted(state){
        console.log("hit mutation?!")
        state.completed = !state.completed
    },
    setParent(state, p){
        state.parent = p
        console.log("parent set?", state)
    },
    setPanel(state, px, i){
        console.log("trying to set i: ", i)
        state.panel = px
        state.top = i | 0
        console.log("panel set?", state)
    },
    last(state){
        state.top = (this.top - 1) % state.panel.length
        if (state.top === -1) {
            state.top = state.panel.length - 1
        }
    },
    next(state){
        state.top = (state.top + 1) % state.panel.length
    },
}

const actions = {
      addParent({commit, state}, pId, panel, top){
          state.parent.push(pId)
          commit("setPanel", panel, top)
          console.log("parent pushed", {panel, top} )
      }
}

const getters = {}

export default {
    state,
    mutations,
    actions,
    getters,
}
