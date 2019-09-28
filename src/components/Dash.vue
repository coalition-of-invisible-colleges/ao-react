<template lang='pug'>

#home
    .container(v-if='$store.state.upgrades.mode === "doge"')
        h1.up {{ $store.state.cash.alias }} status
        .row
            p server is running
            sidewalk
    .container(v-if='$store.state.upgrades.mode === "boat"')
        h1.up resources
        .row
            aos
        .row
            resources
    .container(v-if='$store.state.upgrades.mode === "badge"')
        h1.up accounts
        .row
            member-create.five.columns
            .two.columns &nbsp;
            changer.five.columns
        members
    .container(v-if='$store.state.upgrades.mode === "bounty"')
        h1.up lightning
        nodes(v-if='$store.state.cash.info.alias')
        p(v-else) no lightning node :(
    .container.row(v-if='$store.state.upgrades.mode === "timecube"')
        h1.up central reserve
        ul
          li Each month cost is split between active accounts
          li Activate account at the treasure chest on your deck
          .row.center
              .seven.grid
                  p.underline.padd Node Cost
                  p Active Doges
              .one.grid
                  .equals =
              .four.grid.equals2
                  p Cost each
          .row.center
              .seven.grid
                  p.number.underline.padd {{ parseInt($store.state.cash.rent) }}
                  p.number {{ $store.getters.activeMembers.length }}
              .one.grid
                  .equals =
              .four.grid
                  p.redtx.equals2 [{{ $store.state.cash.cap }} max]
                  p.number.equals2 {{ parseInt( $store.getters.perMonth )}}
          .row
              .six.columns
                p.input-instructions Set Node Cost
                rent-set
              .six.columns
                p.input-instructions Set Cost Cap
                cap-set
        points
    .btcspot 1BTC = ${{ $store.state.cash.spot.toLocaleString() }}
    .satspot 1 = {{ $store.getters.satPointSpot.toLocaleString() }}&#12471;
</template>

<script>

import SharedTitle from './slotUtils/SharedTitle'
import Auth from './Auth'
import Changer from './MyPage/Changer'
import MemberCreate from './forms/MemberCreate'
import TaskCreate from './forms/TaskCreate'
import PreviewDeck from './Deck/PreviewDeck'
import Calendar from './MemberCalendar'
import Nodes from './Nodes'
import Panels from './Deck/Panels'
import WhyLightning from './Nodes/WhyLightning'
import Members from './Members'
import Home from './Home'
import Sidewalk from './Sidewalk'
import RentSet from './forms/RentSet'
import CapSet from './forms/CapSet'
import Resources from './Resources'
import Aos from './Aos'
import Points from './Points'

export default {
    components:{
        SharedTitle, Auth, Changer,
        TaskCreate, PreviewDeck, Calendar, Nodes,
        Panels, WhyLightning, Members, Home, MemberCreate, RentSet,
        CapSet, Resources, Sidewalk, Aos, Points
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/breakpoints'

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

.up
  width: fit-content
  background: rgba(22, 22, 22, 0.8)
  border-radius: 0.5em
  margin: -1.25em auto 0.25em auto
  padding: 0.25em
  z-index: 80
</style>
