import request from 'superagent'
import uuidV1 from 'uuid/v1'
import io from 'socket.io-client'
const socket = io()

var attached = false
function attachSocket(commit, dispatch){
    if (!attached){

        socket.on('unauthorized', (reason)=> {
            console.log('unauthorized event')
            commit('setConnectionError', 'Unauthorized: ' + JSON.stringify(reason))
        })

        socket.on('connect', ()=> {
            console.log('socket connected, emiting authentication')
            commit('setConnected', 'connecting')
            socket.emit('authentication', {
                session: state.session,
                token: state.token
            })
        })

        socket.on('authenticated', ()=> {
            console.log('authentication rec, applying stream')
            commit('setConnected', 'connected')
            commit('setConnectionError', '')
            socket.on('eventstream', ev => {
                console.log('stream triggered c!!')
                commit('applyEvent', ev)
                dispatch('displayEvent', ev)
            })
        })

        socket.on('disconnect', (reason)=> {
            console.log('disconnected from server')
            commit('setConnected', 'disconnected')
            commit('setConnectionError', 'disconnect: ' + reason)
            //socket.open()
       })

        socket.on('connect_error', (error)=> {
            console.log('connection error')
            commit('setConnectionError', error.message)
        })

        socket.on('error', (error)=> {
            console.log('general connection error')
            commit('setConnectionError', error.message)
        })

        socket.on('connect_timeout', (timeout)=> {
            console.log('connection timed out')
            commit('setConnectionError', 'Timed out: ' + timeout + 'ms')
        })

        socket.on('reconnect_attempt', (timeout)=> {
            console.log('reconnection attempt')
            commit('setConnected', 'connecting')
            commit('setConnectionError', 'reconnect attempt')
        })

        socket.on('reconnect', (timeout)=> {
            console.log('reconnected to server')
            commit('setConnected', 'connected')
            commit('setConnectionError', '')
        })

        socket.on('reconnect_error', (error)=> {
            console.log('reconnection error')
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
        console.log('loadCurrent')

        if (state.connected !== "connected"){
            socket.connect()
        }

        request
            .post('/state')
            .set("Authorization", state.token)
            .end((err, res)=>{
                if (err || !res.body) {
                    console.log("error from state load, load failed", err, "attempt getting pubstate")
                    request
                        .put('/dctrl')
                        .end((err, res2)=>{
                            console.log("got res", res2.body, err)
                            commit('setCurrent', res2.body)
                        })
                } else {
                    console.log('got an authorized response?')
                    commit('setCurrent', res.body)
                }
            })
    },
    makeEvent({commit, state, getters, dispatch}, newEv){

      console.log("make event called", newEv)

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
                          console.log("error from state load, load failed", err, "attempt getting pubstate")
                          commit("setReqStatus", "failed")
                          setTimeout(()=> {
                              dispatch("loadCurrent")
                              dispatch("makeEvent", newEv )
                          }, 1000)
                        } else {
                          console.log(res.body)
                          commit("setPing", Date.now() - startTs)
                          commit("popRequest")
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
    // lastRes: '',
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
