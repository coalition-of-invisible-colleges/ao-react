<template lang='pug'>

div
    img(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
    img(v-else src='../../assets/images/loggedOut.svg')
    span(v-if='memberId') {{ name }}
        //img(src='../../assets/images/active15.svg')
        //span {{ name }}
    img(v-else, src='../../assets/images/lightning.svg')

</template>

<script>

export default {
  props: ['memberId'],
  computed:{
    name(){
        let memberId = this.memberId
        let name = false
        this.$store.state.members.forEach(member => {
            if (member.memberId == memberId){
                name = member.name
            }
        })
        return name
    },
    isLoggedIn(){
        let isLoggedIn
        this.$store.state.sessions.forEach( s => {
            if ( s.ownerId === this.memberId ){
                isLoggedIn = true
            }
        })
        return isLoggedIn
    }
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'

img
    height: 1.7em

span
    font-size: 1em

a
    color: accent2
    text-decoration: none

</style>