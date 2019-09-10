<template lang='pug'>

.context.paperwrapper(:class="cardInputSty")
    //router-link(:to='"/task/" + taskId')
    //div.paperwrapper
    .popup
        .here
            span.front(v-if='isMember')  {{ isMember }}
            span.front(v-else-if='card.guild')  {{ card.guild }}
            linky.front(v-else  :x='name'  :key='name')
    img.front(v-if='card.guild'  src="../../assets/images/badge.svg")
    img.front(v-if='isMember' src="../../assets/images/loggedIn.svg")
    div.right.front(v-if='card.book.startTs')
        span {{ cardStart.days.toFixed(1) }} days
        img(src="../../assets/images/timecube.svg")
    .hyperpaper
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
            return this.card.name
        },
        card(){
            return this.$store.getters.hashMap[this.taskId]
        },
        cardStart(){
            // XXX recalc on nav
            if ( this.card.book.startTs ){
              let now = Date.now()
              let msTill = this.card.book.startTs - now
              // XXX TODO
              let days = msTill / (1000 * 60 * 60 * 24)
              let hours = 0
              let minutes = 0
              console.log({now, msTill, days})
              return {
                  days,
                  hours,
                  minutes
              }
            }
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
    z-index: 1

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
    z-index: 2
    position: absolute

.popup
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: relative
    width: 100%
    height: 1.5em
    cursor: pointer
    z-index: 50

.popup .here
    visibility: hidden

.popup:hover
    height: 100%
    z-index: 99

.popup:hover .here
    visibility: visible
    padding: 1em
    z-index: 99

.here
    position: inline
    color: white
    pointer-events: none
    margin-left: 2.5em
    
img.front
    position: absolute
    top: 0.2em
    left: -0.5em

.right.front
    position: absolute
    top: 0.2em
    right: 0.5em

.right.front img
    margin-right: 0.5em
    margin-left: 0.15em
    
.front
    z-index: 100
    position: relative
    pointer-events: none

.right.front
    float: right

.popup:hover ~ .right.front
    top: 0
    right: 0

.popup:hover ~ img.front
    height: 2.2em
    top: 0.41em

.popup:hover ~ .right.front img
    height: 2.2em
    margin-top: 0.41em
    margin-right: -0.5em
    
.popup:hover ~ .right.front span
    display: inline-block
    padding: 1em
    
.context
    box-shadow: -7px -7px 7px 1px rgba(21, 21, 21, 0.5)
</style>
