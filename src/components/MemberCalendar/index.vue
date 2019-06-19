<template lang='pug'>

.resourcesummary
    shared-title(:title='calcTitle')
    calendar

</template>

<script>

import request from 'superagent'
import Calendar from './Calendar'
import SharedTitle from '../slotUtils/SharedTitle'

export default {
    data(){
        return {
            search: '',
            id: ''
        }
    },
    mounted(){
      let memberId = this.$router.currentRoute.path.split('/')[2]
      if (!memberId){
          // This sets the default shown to the logged in member
          memberId = this.$store.getters.member.memberId
      }
      this.id = memberId
    },
    computed: {
        calcTitle(){
            let name
            this.$store.state.members.forEach( m => {
                if (this.id === m.memberId){
                    name = m.name
                }
            })
            return name
        },
    },
    components:{
        SharedTitle, Calendar
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.padding
    display: inline
    padding: 3em
    height: 200px

p
    font-size:1.3em
    color:white
    font-family: 'Open Sans', light, sans-serif;

a
    color: accent2

img
    display:inline

h3
    text-align: left
    color:accent1
    font-family: 'Open Sans', light, sans-serif;


</style>
