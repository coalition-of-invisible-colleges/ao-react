const M = require( '../mutations')

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

module.exports = {
  state,
  mutations,
  actions
}
