import request from 'superagent'
import uuidV1 from 'uuid/v1'
import io from 'socket.io-client'
const socket = io()

var attached = false
function attachSocket(commit, dispatch){
    if (!attached){

        socket.on('unauthorized', (reason)=> {
            commit('setConnectionError', 'Unauthorized: ' + JSON.stringify(reason))
        })

        socket.on('connect', ()=> {
            commit('setConnected', 'connecting')
            socket.emit('authentication', {
                session: state.session,
                token: state.token
            })
        })

        socket.on('authenticated', ()=> {
            commit('setConnected', 'connected')
            commit('setConnectionError', '')
            socket.on('eventstream', ev => {
                commit('applyEvent', ev)
                dispatch('displayEvent', ev)
            })
        })

        socket.on('disconnect', (reason)=> {
            commit('setConnected', 'disconnected')
            commit('setConnectionError', 'disconnect: ' + reason)
            //socket.open()
       })

        socket.on('connect_error', (error)=> {
            commit('setConnectionError', error.message)
        })

        socket.on('error', (error)=> {
            commit('setConnectionError', error.message)
        })

        socket.on('connect_timeout', (timeout)=> {
            commit('setConnectionError', 'Timed out: ' + timeout + 'ms')
        })

        socket.on('reconnect_attempt', (timeout)=> {
            commit('setConnected', 'connecting')
            commit('setConnectionError', 'reconnect attempt')
        })

        socket.on('reconnect', (timeout)=> {
            commit('setConnected', 'connected')
            commit('setConnectionError', '')
        })

        socket.on('reconnect_error', (error)=> {
            commit('setConnectionError', error.message)
        })
        attached = true
    }
}

const actions = {
    connectSocket({commit, dispatch}){
        attachSocket(commit, dispatch)
    },
    loadCurrent({ commit, state, dispatch }){
        if (state.connected !== "connected"){
            socket.connect()
        }

        request
            .post('/state')
            .set("Authorization", state.token)
            .end((err, res)=>{
                if (err || !res.body) {

                } else {
                    commit('setCurrent', res.body)
                    res.body.sessions.forEach(s => {
                        if (s.session === state.session){
                            commit("setPanel", [ s.ownerId ])
                        }
                    })
                }
            })
    },
    makeEvent({commit, state, getters, dispatch}, newEv){
      switch(state.reqStatus){
          case "ready":
              let startTs = Date.now()
              commit("setReqStatus", "pending")
              request
                  .post('/events')
                  .send(newEv)
                  .set("Authorization", state.token)
                  .end((err, res)=>{
                      if (err || !res.body) {
                          commit("setReqStatus", "failed")
                        } else {
                          commit("setPing", Date.now() - startTs)
                          commit("setReqStatus", "ready")

                          if (state.pendingRequests.length > 0){
                              let nextEv = state.pendingRequests.slice(-1)
                              commit("popRequest")
                              dispatch("makeEvent", nextEv )
                          }
                      }
                  })
              break
          case "pending":
              commit("addRequest", newEv)
              break
      }
    }
}

const state = {
    token: '',
    session: '',
    connected: 'disconnected',
    connectionError: '',
    pendingRequests: [],
    reqStatus: 'ready',
    lastPing: 1,
}

const mutations = {
    popRequest(loader, newReq){
        loader.pendingRequests.pop()
    },
    addRequest(loader, newReq){
        loader.pendingRequests.push(newReq)
    },
    setPing(loader, ping){
        loader.lastPing = ping
    },
    setReqStatus(loader, status){
        loader.reqStatus = status
    },
    setAuth(loader, auth){
        loader.token = auth.token
        loader.session = auth.session
    },
    setConnected(loader, connected){
        loader.connected = connected
    },
    setConnectionError(loader, error){
        if(error === '') {
            loader.connectionError = ''
            return
        }
        loader.connectionError = error
    }
}

export default {
    state,
    mutations,
    actions
}
