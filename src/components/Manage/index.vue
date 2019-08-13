<template lang='pug'>

#manage
    shared-title(title='Manage Autonomous Organization')
    .row
      .six.columns.info
        button(:class='{open: showAo}' @click='toggleAo')
            span(v-if='showAo') hide ao controls
            span(v-else) open ao controls
        .purplewx
          ul
            li Each month cost is split between active accounts
            li Activate account at the treasure chest on your deck
        transition(name='slide-fade')
          .purplewx(v-if='showAo')
            .row
                .seven.grid
                    p.underline.padd Node Cost
                    p Active Doges
                .one.grid
                    .equals =
                .four.grid.equals2
                    p Cost each
            .row
                .seven.grid
                    p.number.underline.padd {{ parseInt($store.state.cash.rent) }}
                    p.number {{ $store.getters.activeMembers.length }}
                .one.grid
                    .equals =
                .four.grid
                    p.number.equals2 {{ parseInt( $store.getters.perMonth )}}
                        span.redtx [{{ $store.state.cash.cap }} max]
            .row
                .six.columns
                  p.input-instructions Set Node Cost
                  rent-set
                .six.columns
                  p.input-instructions Set Cost Cap
                  cap-set
        img#sundogepurp(src="../../assets/images/sundogepurp.png")
      .six.columns
          p Add a doge!
          member-create
          changer
    .row
      .six.columns
        h5 Recent activity at contact points where you can use your fob:
        resources
      .six.columns
        img#sundogepurp(src="../../assets/images/ao.svg")
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import MemberPaid from '../forms/MemberPaid'
import RentSet from '../forms/RentSet'
import CapSet from '../forms/CapSet'
import Resources from '../Resources'
import AdminRow from './AdminRow'
import Summaryy from '../Nodes/Summary'
import ChannelCreate from '../forms/ChannelCreate'
import MemberCreate from '../forms/MemberCreate'
import CardPanel from '../Deck/CardPanel'
import Changer from '../MyPage/Changer'

export default {
    data(){
        return {
            selectedMember: '',
            showCash: false,
            showAo: false,
        }
    },
    methods: {
        toggleCash(){
            this.showCash = !this.showCash
        },
        toggleAo(){
            this.showAo = !this.showAo
        }
    },
    components:{
        SharedTitle, Changer,
        RentSet, CapSet, Resources, MemberPaid, AdminRow,
        Summaryy, ChannelCreate, MemberCreate, CardPanel
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/button';

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
