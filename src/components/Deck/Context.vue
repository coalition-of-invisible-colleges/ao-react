<template lang='pug'>

.context.paperwrapper(:class="cardInputSty")
    //router-link(:to='"/task/" + taskId')
    //div.paperwrapper
    img(v-if='card.guild'  src="../../assets/images/badge.svg")
    img(v-if='isMember' src="../../assets/images/loggedIn.svg")
    .hyperpaper
    .popup()
        span
            span(v-if='isMember')  {{ isMember }}
            span(v-else-if='card.guild')  {{ card.guild }}
            linky.here(v-else  :x='name'  :key='name')
    slot
</template>

<script>

import Linky from '../Card/Linky'

export default {
    props: ['taskId'],
    components: { Linky },
    computed: {
        isMember(){
            let is = false
            this.$store.state.members.some(m => {
                if (m.memberId === this.taskId){
                    is = m.name
                    return true
                }
            })
            return is
        },
        name(){
            return this.$store.getters.hashMap[this.taskId].name
        },
        card(){
            return this.$store.getters.hashMap[this.taskId]
        },
        cardInputSty() {
          let color = this.card.color
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

img
    height: 1.1em
    float: left
    padding-left: 1em

.context
    opacity: 0.6
    color: white

.paperwrapper
    position: relative

.hyperpaper
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    opacity: 0.2

.popup
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: relative
    width: 100%
    height: 1.5em
    cursor: pointer

.popup .here
    visibility: hidden

.popup:hover
    height: 100%

.popup:hover .here
    visibility: visible
    padding: 1em

.here
    position: inline
    color: white
    pointer-events: none
</style>
