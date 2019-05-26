<template lang='pug'>

.memberrow.membershipcard
      .row
          .eleven.grid
              label.hackername {{ m.name }}
          .one.grid
              img.logindicator(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
              img.logindicator(v-else, src='../../assets/images/loggedOut.svg')
      .row
          .nine.grid
              label {{ m.balance.toFixed(2) }}
          .three.grid
              dctrl-active(:m='m')


</template>

<script>

import DctrlActive from '../Members/DctrlActive'
import Badges from '../Members/Badges'
import Addr from '../Members/Addr'
import PreviewDeck from './PreviewDeck'

export default {
    props: ['m'],
    components: {DctrlActive, Badges, Addr, PreviewDeck},
    computed:{
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
                if ( s.ownerId === this.m.memberId ){
                    isLoggedIn = true
                }
            })
            return isLoggedIn
        },
    },
    methods: {
        getName(taskId){
            let name
            this.$store.state.tasks.some(t => {
                if (taskId === t.taskId){
                    name = t.name
                    return true
                }
            })
            return name
        }
    }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

img
    height: 2em

label
    font-size: 1.246em
    font-weight: normal;
    margin: 1em
    display: block

.hackername
    font-family: monospace
    font-size: 1.5em

.membershipcard
    border: 4px solid white
    padding: 1em
    background: rgba(0, 0, 0, 0.75)

.logindicator
    float: right

.logindicator:after
    clear: both

</style>
