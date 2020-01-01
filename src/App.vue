<template lang='pug'>

.app
  navigation
  router-view
  event-feed
</template>

<script>

import Navigation from './components/Navigation'
import MobileHeading from './components/MobileHeading'
import EventFeed from './components/slotUtils/EventFeed'

export default {
    mounted() {
        let token = window.localStorage.token
        let session = window.localStorage.session
        if (token && session){
            this.$store.commit('setAuth', {token, session})
        }
        this.$store.dispatch("connectSocket")
        if(this.$store.getters.member) {
            this.$store.dispatch('loadCurrent')
        }
    },
    components: {
        Navigation, MobileHeading, EventFeed
    },
}


</script>

<style lang="stylus">

@import "./styles/normalize"
@import "./styles/breakpoints"
@import "./styles/skeleton"
@import "./styles/colours"
@import "./styles/input"

.app
    color: accent1
    font-weight: lighter

body
    background: main
    overflow-x: hidden


</style>
