<template lang='pug'>

#app
  .contain
    main-menu
    router-view
</template>

<script>

import MainMenu from './components/MainMenu'
import MobileHeading from './components/MobileHeading'
import EventFeed from './components/slotUtils/EventFeed'

export default {
    mounted(){
        let token = window.localStorage.token
        let session = window.localStorage.session
        if (token && session){
            this.$store.commit('setAuth', {token, session})
        }
        this.$store.dispatch("connectSocket")
        this.$store.dispatch('loadCurrent')

        setInterval(()=>{
            if (this.$store.state.loader.connected !== "connected"){
                this.$store.dispatch('loadCurrent')
            }
        }, 1000)


    },
    components: {
        MainMenu, MobileHeading, EventFeed
    },
}


</script>

<style lang="stylus">

@import "./styles/normalize"
@import "./styles/breakpoints"
@import "./styles/skeleton"
@import "./styles/colours"
@import "./styles/input"

.contain
    padding-left: 1em
    padding-right: 1em

#app
    position:relative
    color: accent1
    font-weight: lighter

body
    background: main

main
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;

hr
    background-color: purple
    border-color: purple
    color: purple

h4
  margin-bottom:35px

.side_bar, .content
    display: flex;

.content
    flex-grow: 4;
    overflow-y:scroll;
    padding:0 5rem;

.side_bar {
    flex-basis: 10rem;
    flex-shrink: 0;
    flex-grow: 0;
}

.mobile
    width: calc(100% - 40px);
    padding-left: 20px;
    padding-right: 20px;

@media (max-width: breakpoint)
    main
        display: none


@media (min-width: breakpoint)
    .mobile
        display: none

</style>
