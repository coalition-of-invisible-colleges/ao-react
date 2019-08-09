<template lang='pug'>

#auth
  div(v-if='!confirmed')
      fancy-input(labelText='dogename')
          input.input-effect(type='text', v-model='name', autocapitalize="none", autocomplete="off", autocorrect="off")
      br
      div.input-container
        input#password.input-effect(type='password', v-model='pass', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createSession')
        label(for='password',) password
        span.focus-border
      br
      p.red {{ err }}
      button.primary(@click="createSession") login
  button(v-else  @click="killSession") log out
</template>

<script>

import request from 'superagent'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import FancyInput from './slotUtils/FancyInput'

export default {
  name: 'Auth',
  components: {
    FancyInput
  },
  data(){
      return {
          name: '',
          pass: '',
          err: ''
      }
  },
  computed: {
      confirmed(){
          return this.$store.getters.isLoggedIn
      },
  },
  methods: {
      createSession(){
          let session = uuidV1()
          let sessionKey = cryptoUtils.createHash(session + cryptoUtils.createHash(this.pass))
          let token = cryptoUtils.hmacHex(session, sessionKey)
          request
              .post('/session')
              .set('authorization', token)
              .set('session', session)
              .set('name', this.name)
              .end((err,res)=>{
                  if (err) {
                      console.log(err)
                      this.pass = ''
                      return this.err = err.message
                  }

                  console.log('Authentication creation response', res.body)
                  this.pass = ""
                  this.$store.commit('setAuth', {
                      token,
                      session,
                  })

                  window.localStorage.setItem("token", token)
                  window.localStorage.setItem("session", session)

                  console.log('createSession about to connect')

                  this.$store.dispatch('loadCurrent')
              })
      },
      killSession(){
          //XXX TODO tell server to remove session
          this.$store.dispatch("makeEvent", {
              type: "session-killed",
              session: this.$store.state.loader.session
          })

          window.localStorage.removeItem("token")
          window.localStorage.removeItem("session")
          this.$store.commit('setAuth', {
              token: '', session: ''
          })
      }
  }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/button'


#auth
    background-color:accent5

main #auth
    margin: 0 0 0 50px
    padding: 20px 20px 20px 20px;
    width:calc(100% - 90px)

#mobileheading #auth
  margin: 50px auto 50px auto
  padding: 20px 50px 50px 50px;
  width:300px

.secret
    -webkit-text-fill-color: transparent; /* sets just the text color */

.container
    width: 100%

.red
    color: accent2

</style>
