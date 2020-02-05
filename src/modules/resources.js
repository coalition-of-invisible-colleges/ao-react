const M = require( '../mutations')

const state = [] // aka resources (in this file):

const mutations = {
    setCurrent(resources, current){
        resources.length = 0
        current.resources.forEach( resource => {
            resources.push(resource)
        })
    },
    applyEvent: M.resourcesMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions,
}
