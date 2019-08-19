<template lang='pug'>

span.current
    img.onlineicon(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
    img.onlineicon(v-else src='../../assets/images/loggedOut.svg')
    span(v-if='memberId && name') {{ name }}
    img(v-if='!memberId', src='../../assets/images/lightning.svg')
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

.current
    font-size: 1em
    margin-left: 1em
    margin-right: 1em
    white-space: nowrap

a
    color: accent2
    text-decoration: none

.onlineicon
    margin-right: 0.5em
    height: 1.5em
    position: relative
    top: 0.25em

</style>
