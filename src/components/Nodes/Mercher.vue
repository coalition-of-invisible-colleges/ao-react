<template lang='pug'>

.channel
  .row.grid
    .seven.grid
        h3 {{ r.name }}
        fancy-input(labelText='Set $ Value')
          input.input-effect(v-model='cadvalue', type='text')
        button(v-if='sats > 0' @click='createPayRec') {{ sats.toLocaleString() }} satoshis - create invoice
        button.sel(v-else) Enter Amount Above
        .invoice(v-if='showInvoice')
            pay-req(v-if='invoice', :i='invoice')
    .five.grid
        local-remote-bar(v-for='cc in channels', :c='cc')

</template>

<script>

import LocalRemoteBar from './LocalRemoteBar'
import FancyInput from '../slotUtils/FancyInput'
import PayReq from '../Resources/PayReq'
import Channel from './Channel'
import calcs from '../../calculations'

export default {
    components: { LocalRemoteBar, FancyInput, Channel, PayReq },
    props: ['r'],
    data(){
        return { cadvalue: '' , showInvoice: false}
    },
    computed: {
      invoice(){
          let invoice = {}
          return invoice
      },
      node(){
          return false
      },
      channels(){
          let channels = []
          return channels
      },
      sats(){
          if (this.cadvalue){
              return parseInt( calcs.cadToSats(this.cadvalue, this.$store.state.cash.spot) )
          }
          return 0
      },
      btc(){
          let sats = parseInt( calcs.cadToSats(this.cadvalue, this.$store.state.cash.spot) )
          let btc = sats / 100000000
          return btc.toFixed(8)
      },
    },
    methods: {
        createPayRec(){
            this.showInvoice = true
            this.$store.dispatch("makeEvent", {
                type: 'invoice-requested',
                sats: this.sats,
                memo: 'Payment to ' + this.r.name,
                ownerId: this.r.resourceId
            })
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/button'
@import '../../styles/grid'

.channel
    color: accent3
    padding: 1em

.h
    height: 2em

.local
    height: 2em
    background: purple
    float: left
    color: main
    text-align: center

.remote
    height: 2em
    background: green
    float: right
    color: main
    text-align: center

#nodes
  width: 100%

img
  position: relative
  height: 3em
  left: -10px


</style>
