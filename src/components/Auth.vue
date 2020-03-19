<template lang="pug">

#auth
  div(v-if='!confirmed')
      input(type='text', v-model='name', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createSession', placeholder='dogename')
      input#password(type='password', v-model='pass', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createSession', placeholder='password')
      p.red {{ err }}
      button.primary(@click="createSession") login
</template>

<script>
  import request from 'superagent'
  import uuidV1 from 'uuid/v1'
  import cryptoUtils from '../crypto'

  export default {
    name: 'Auth',
    data() {
      return {
        name: '',
        pass: '',
        err: ''
      }
    },
    computed: {
      confirmed() {
        return this.$store.getters.isLoggedIn
      }
    },
    methods: {
      createSession() {
        let session = uuidV1()
        let sessionKey = cryptoUtils.createHash(
          session + cryptoUtils.createHash(this.pass)
        )
        let token = cryptoUtils.hmacHex(session, sessionKey)
        request
          .post('/session')
          .set('authorization', token)
          .set('session', session)
          .set('name', this.name)
          .end((err, res) => {
            if (err) {
              this.pass = ''
              return (this.err = err.message)
            }

            this.pass = ''
            this.$store.commit('setAuth', {
              token,
              session
            })

            window.localStorage.setItem('token', token)
            window.localStorage.setItem('session', session)

            this.$store.dispatch('loadCurrent')
          })
      },
      killSession() {
        this.$store.dispatch('makeEvent', {
          type: 'session-killed',
          session: this.$store.state.loader.session
        })
        window.localStorage.removeItem('token')
        window.localStorage.removeItem('session')
        window.localStorage.clear()
        this.$store.commit('setAuth', {
          token: '',
          session: ''
        })
        window.location.replace('/')
      }
    }
  }
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'
  @import '../styles/button'
  @import '../styles/input'

  #auth
      background-color:accent5
      margin: 50px auto 50px auto
      padding: 20px 50px 50px 50px;
      width:300px

  main #auth
      margin: 0 0 0 50px
      padding: 20px 20px 20px 20px;
      width:calc(100% - 90px)

  input
      border: 2px solid wrexyellow
      margin-bottom: 0.5em
      border-radius: 0.25em


  .secret
      -webkit-text-fill-color: transparent; /* sets just the text color */

  .container
      width: 100%

  .red
      color: accent2
</style>
