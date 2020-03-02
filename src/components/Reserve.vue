<template lang='pug'>

#home
  .container
    h1 Reserve
    .row.center
        .seven.grid
            p.underline.padd Monthly Cost - {{ parseInt($store.state.cash.rent) }}
            p  {{ activeMembers }} Active
        .one.grid
            .equals =
        .four.grid.equals2
            p {{ parseInt(perMonth) }} each
            p.redtx.equals2 [{{ $store.state.cash.cap }} max]
    .row
        .six.columns
          p.input-instructions Set Monthly Cost
          rent-set
        .six.columns
          p.input-instructions Set Maximum
          cap-set
    ul
      li Each month the node cost is split between accounts
      li Activate account at the treasure chest on your deck
    div(v-if='pendingDeactivations.length > 0  && $store.state.cash.rent > 0')
        h4 Pending Deactivation:
        span(v-for='(mId, i) in pendingDeactivations')
            current(:memberId='mId')
            br(v-if='i % 3 === 2')
    points
</template>

<script>

import Points from './Points'
import RentSet from './RentSet'
import CapSet from './CapSet'
import Current from './Current'

export default {
    components:{
        Points, RentSet, CapSet, Current
    },
    computed: {
        pendingDeactivations(){
            return this.$store.state.members
              .filter(m => m.active > 0 && this.$store.getters.hashMap[m.memberId].boost <= 0)
              .map(m => m.memberId)
        },
        activeMembers(){
            let a = 0
            this.$store.state.members.forEach(m => {
                if (m.active > 0){
                    a ++
                }
            })
            return a
        },
        perMonth(){
            return this.$store.state.cash.rent / this.activeMembers
        }
    },
    mounted() {
        this.$store.commit('setMode' , 4)
        this.$store.commit('setDimension' , 2)
        this.$store.dispatch('loaded')
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/breakpoints'
@import '../styles/title'

.fw
    width: 100%
    opacity: 0.3456

.btcspot , .satspot
    position: absolute
    top: 0
    z-index: 11
    padding: 1em

@media (max-width: breakpoint)
    .btcspot , .satspot
        display: none

.btcspot
    right: 111px

.satspot
    left: 111px

.center
    text-align: center

.intro
    padding: 5em 0;

p
    font-size:1.1em
    color:white
    font-family: 'Open Sans', light, sans-serif;

h1
    text-align: center

h3
    text-align: center
    color:accent1
    font-family: 'Open Sans', light, sans-serif;
    font-size:3em

a
    color: accent2
    text-decoration: none;

a:visited
    color: accent1

#whales
    width: 100%
    opacity: 0.234567


.evhis
  margin-top: 2em
  button
    background-color: purple
    background: purple

select
  color: white
  background: purple

.info
  color: accent2
  font-size: 1.2em
  text-align: center

.p
  color: purple

#sundogepurp
  width:100%
  max-height:auto

#burg
    float: right;
    margin-bottom: -9em

#addmember
    height: 5em
    float: right
    margin-bottom: -1em
    z-index: 1010

.open
    background: red

.number
    font-size: 1.1em
    color: green

.underline
    border-bottom-style: solid
    border-color: accent2
    padding-left: 1em

.equals
    margin-top: 1.3em
    font-size: 2em

.equals2
    margin-top: 1.1em
    font-size: 1.69em

.padd
    padding: 1em

.purplewx
    color: white
    transition: opacity 2s;

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

ul
    text-align: left

</style>
