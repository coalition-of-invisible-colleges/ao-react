<template lang="pug">

#mobileheading
    a.hamburger(href="#", @click.prevent='toggleHeaderNav')
        img(src='../assets/images/hamburger.svg')
    .wrapper
        router-link(to="/")
            img(src='../assets/images/dctrl.svg')
        .toggle(v-if="showHeaderNav")
            navigation().navigation--header
    auth(v-if='!$store.getters.isLoggedIn')
    slot
    auth(v-if='$store.getters.isLoggedIn')

</template>

<script>
import Navigation from './Navigation'
import Auth from './Auth'

export default {
    components: { Navigation, Auth },
    props: ['content'],
    data(){
      return {
        showHeaderNav: false,
      }
    },
    methods:{
      toggleHeaderNav(){
        this.showHeaderNav = !this.showHeaderNav
      },
    },
}
</script>

<style lang="stylus" scoped>
@import "../styles/framework"
@import "../styles/breakpoints"
@import "../styles/colours"
#mobileheading
    display:fixed
    width:100%
    background:main
    color: accent1

img
    height:90px

.hamburger
    position:absolute
    right:0

</style>
