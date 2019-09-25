import M from '../mutations'

const state = {
    alias: "",
    address: "",
    cash: 0,
    spot: 123456,
    currency: 'CAD',
    rent: 0,
    cap: 0,
    variable: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {'x':1},
    pay_index: 0,
}

const mutations = {
    setCurrent(state, current){
        state.alias = current.cash.alias
        state.address = current.cash.address
        state.cash = current.cash.cash
        state.spot = current.cash.spot
        state.currency = current.cash.currency
        state.rent = current.cash.rent
        state.cap = current.cash.cap
        state.variable = current.cash.variable
        state.usedTxIds = current.cash.usedTxIds
        state.outputs = current.cash.outputs
        state.channels = current.cash.channels
        state.info = current.cash.info
        state.pay_index = current.cash.pay_index
    },
    applyEvent: M.cashMuts
}

const actions = {}
const getters = {}

export default {
    state,
    mutations,
    actions,
    getters
}
