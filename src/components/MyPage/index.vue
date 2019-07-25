<template lang='pug'>

#mypage
  shared-title(:title='calcTitle')
  .row
    .seven.columns
      h2.pushdown Get Points for Bitcoin:
      payment
      badges(:m='member')
    .five.columns
      h2
        span {{ member.name }}:
        span.red(v-if='member.active < 0') {{member.balance}} points
        span.purple(v-else) {{parseInt( member.balance ) }} points
      hr
      changer
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import Calendar from '../MemberCalendar'
import Payment from './Payment'
import Changer from './Changer'
import Badges from '../Members/Badges'
import TofuBadges from '../Members/TofuBadges'
import PreviewDeck from '../Deck/PreviewDeck'
import TaskCreate from '../forms/TaskCreate'

export default {
    components: {
        SharedTitle, Calendar, Payment, Changer,
        Badges, TofuBadges, PreviewDeck, TaskCreate
    },
    computed: {
        member(){
            return this.$store.getters.member
        },
        calcTitle(){
            return this.$store.getters.member.name + "'s Account"
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

.red
    color: red

.purple
    color: purple

p
    font-size: 1.2em

h6
    padding: 2em

select
    margin: 2em
    color: main
    height: 2em

.card
    height: 2em
    background: blue

.floater
    position: relative;
    top: 0
    left: 0
    width: 100%
    min-height: 500px


</style>
