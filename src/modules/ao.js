import M from '../mutations'

const state = []

const mutations = {
    setCurrent(aos, current){
        aos.length = 0
        current.ao.forEach( a => {
            aos.push(a)
        })
    },
    applyEvent: M.aoMuts
}

const actions = {

}

export default {
  state,
  mutations,
  actions
}
