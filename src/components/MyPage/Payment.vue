<template lang='pug'>

.payment
  .row(@click='toggleShowBtc')
    .six.grid
      button.yellowwx(:class="{selected: showBtc}") Blockchain
    .six.grid
      button.purplewx(:class="{selected: !showBtc}") Lightning
  div(v-if='showBtc')
      h2 Use Bitcoin Mainnet
      fancy-input(labelText='Set $ Value')
        input.input-effect(v-model='cadvalueBtc', type='text')
      .centerer
          .qr(v-html='imgTag')
          label {{ address }}
  div(v-else)
    h2 Use Lightning Network
    fancy-input(labelText='Set $ Value')
      input.input-effect(v-model='cadvalue', type='text')
    button(v-if='sats > 0' @click='createPayRec') {{ sats.toLocaleString() }} satoshis - create invoice
    button.sel(v-else) Enter Amount Above
    .invoice(v-if='showInvoice')
      pay-req(v-if='invoice', :i='invoice')

</template>

<script>

import FormBox from '../slotUtils/FormBox'
import qrcode from 'qrcode-generator'
import calcs from '../../calculations'
import PayReq from '../Resources/PayReq'
import Addr from '../Members/Addr'
import FancyInput from '../slotUtils/FancyInput'

export default {
    components: { PayReq, Addr, FormBox, FancyInput },
    data(){
        let cadvalue
        if ( this.$store.getters.member.balance < 0){
            cadvalue = -this.$store.getters.member.balance
        }
        if (!cadvalue){
            cadvalue = ""
        } else {
            cadvalue = cadvalue.toFixed(2)
        }
        return { cadvalueBtc: cadvalue, cadvalue, showInvoice: false, showBtc: true }
    },
    computed: {
        details(){
            return {
                memberId: this.$store.getters.member.memberId
            }
        },
        sats(){
            return parseInt( calcs.cadToSats(this.cadvalue, this.$store.state.cash.spot) )
        },
        btc(){
          let sats = parseInt( calcs.cadToSats(this.cadvalueBtc, this.$store.state.cash.spot) )
          let btc = sats / 100000000
          return btc.toFixed(8)

        },
        name(){
            let name = '...loading'
            this.$store.state.members.forEach( member => {
                if (member.memberId === this.$store.getters.member.memberId){
                    name = member.name.slice()
                }
            })
            return name
        },
        imgTag(){
            console.log('computing imgTag?')
            let typeNumber = 4;
            let errorCorrectionLevel = 'L';
            let qr = qrcode(typeNumber, errorCorrectionLevel);
            let data = 'bitcoin:' + this.address + "?amount=" + this.btc
            qr.addData(data)
            qr.make()
            let cellsize = 7
            let margin = 7
            return qr.createImgTag(cellsize, margin)
        },
        address(){
            return this.$store.getters.member.address
        },
        memberId(){
            return this.$store.getters.member.memberId
        },
        invoice(){
            let invoice
            this.$store.state.invoices.forEach( i => {
                if (i.ownerId === this.memberId) {
                    invoice = i
                }
            })
            console.log('returning invoice', invoice)
            return invoice
        },
    },
    methods: {
        toggleShowBtc(){
            this.showBtc = !this.showBtc
        },
        createPayRec(){
            this.showInvoice = true
            this.$store.dispatch("makeEvent", {
                type: 'invoice-created',
                sats: this.sats,
                memo: 'Payment from ' + this.$store.getters.member.name,
                ownerId: this.$store.getters.member.memberId
            })
        }
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'

.onchainqr
    float: right
    padding:2em

a
    color: accent2
    :visited
        color: accent2

button
  height: 3em
  img
    height: 1.5em
    z-index: 100

.createaddr
    float: right


.ln, .onchain
    padding: 1.5em

.centerer
    align-content: center

.sel
    background: main

.selected
    border-style: solid
    border-color: lightteal
    border-width: 5px

</style>
