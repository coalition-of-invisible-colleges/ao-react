import Vue from 'vue'
import _ from 'lodash'

const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]

const state = {
    parent: [],
    panel: [],
    top: 0,
    completed: false,
    action: false,
    // memory: {},
    // topRed: 0,
    // topYellow: 0,
    // topGreen: 0,
    // topPurple: 0,
    // topBlue: 0,
}

const mutations = {
    // addMemory(state){
    //   Vue.set(state.memory, state.panel[state.top], {
    //     topRed: state.topRed,
    //     topYellow: state.topYellow,
    //     topGreen: state.topGreen,
    //     topPurple: state.topPurple,
    //     topBlue: state.topBlue,
    //   })
    // },
    // retrieveMemory(state, taskId){
    //     let memory = state.memory[taskId]
    //     console.log({memory})
    //     if (memory){
    //       state.topRed = memory.topRed
    //       state.topYellow = memory.topYellow
    //       state.topGreen = memory.topGreen
    //       state.topPurple = memory.topPurple
    //       state.topBlue = memory.topBlue
    //     } else {
    //       state.topRed = 0
    //       state.topYellow = 0
    //       state.topGreen = 0
    //       state.topPurple = 0
    //       state.topBlue = 0
    //     }
    // },
    toggleCompleted(state){
        state.completed = !state.completed
    },
    setParent(state, p){
        state.parent = p
        console.log("parent set?", state)
    },
    setPanel(state, panel, top){
          state.panel = panel
    },
    setTop(state, top){
          state.top = top
    },
    setAction(state, a){
        console.log("set action setting action", a)
        state.action = a
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
    addParent(state, pId){
        state.parent = _.filter(state.parent, p => p !== pId)
        state.parent.push(pId)
    },
    goToParent(state, tId){
        let popped = false
        while (popped !== tId && state.parent.length !== 0){
            popped = state.parent.pop()
        }
    }
}

const actions = {
      goIn({commit, state}, pContext ){
          commit("setPanel", pContext.panel)
          commit("setTop", pContext.top)
          pContext.parents.forEach(p => {
            console.log("adding parent ", p)
            commit("addParent", p)
          })
      },
      goUp({commit, state}, pContext){
          console.log("go up action ")
          commit("goToParent", pContext.target)
          commit("setPanel", pContext.panel)
          commit("setTop", pContext.top)
      }
}

const getters = {}

export default {
    state,
    mutations,
    actions,
    getters,
}
