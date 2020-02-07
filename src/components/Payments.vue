<template lang='pug'>

.upgrades
    div(v-if='$store.state.cash.info.alias')
        .togglepayments
            button.submode.marg(@click='togglePayment(0)', :class='{thickborder: $store.state.upgrades.payment === "bitcoin" }')
                img.max(src='../assets/images/bitcoin.svg')
            button.submode(@click='togglePayment(1)', :class='{thickborder: $store.state.upgrades.payment === "lightning" }')
                img.max(src='../assets/images/lightning.svg')
        div(v-show='$store.state.upgrades.payment === "bitcoin"')
            div(v-if='b.address')
                pay-address(:address='b.address')
        div(v-show='$store.state.upgrades.payment === "lightning"')
            div(v-if='b.bolt11')
                pay-req(:bolt11='b.bolt11')
                .submode
                    input.smallbox.fr(v-model='payreqAmount')
                    button(@click='invoiceCreate') ♻️
    div.suggest(v-else) no lightning node :(
</template>

<script>

import calcs from '../calculations'
import PayAddress from './PayAddress'
import PayReq from './PayReq'

export default {
    components:{
      PayReq, PayAddress,
    },
    mounted() {
        this.$store.commit('setMode' , 3)
        this.$store.commit('setDimension' , 0)
        this.$store.dispatch('loaded')
    },
    data(){
        return {
            payreqAmount: 1,
        }
    },
    methods: {
        togglePayment(x){
            let payModes = ['bitcoin', 'lightning']
            if(this.$store.state.upgrades.payment === payModes[x]) {
                this.$store.commit("closePayMode")
                return
            }
            this.$store.commit("setPayMode", x)
            if(x === 0) {
                if(!this.$store.getters.contextCard.address) {
                    this.$store.dispatch('makeEvent', {
                        type: 'address-updated',
                        taskId: this.$store.getters.contextCard.taskId
                    })
                }
            }
            if (x === 1) {
                this.invoiceCreate()
            }
        },
        invoiceCreate(){
          let spot = this.$store.state.cash.spot
          let amount = calcs.cadToSats( this.payreqAmount, spot)
          this.$store.dispatch('makeEvent', {
            type: 'invoice-created',
            taskId: this.b.taskId,
            amount,
            label: '<3'
          })
        },
    },
    computed: {
        b(){
            return this.$store.getters.contextCard
        },
        addressUpdate(){
            return {
                type: 'address-updated',
                taskId: this.b.taskId
            }
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/tooltips'
@import '../styles/spinners'

.marg
    margin-right: 1.97em

.nl
    text-decoration:none

.padded
    padding: 1em

.upgrades
    width: 100%

.tab
    padding-top: .4321em
    height: 5em

.upgrade
    height: 3.7em
    cursor: pointer

.selected
    background: main
    border-radius: 40px 40px 0 0
    padding-bottom: 0.654321em
    border-style: dashed
    border-width: 2px
    border-color: softGrey

.formlabel
    padding-top: 1em
    padding-bottom: 1em
    text-align: center

.card
    padding: 2em
    color: white
    text-align: center

p
    padding-left: .6em
    font-size:1.3em
    font-family: 'Open Sans', light, sans-serif;

a
    color: accent2

h3
    text-align: left
    font-family: 'Open Sans', light, sans-serif;

.grid
    height: 4em
    text-align: center


.mainbg
    background: main


.lightbg
    background: rgba(0,0,0,0)

.fl
    float: left

.dol
    height: 4em
    opacity: 0.27

.two
    text-align: center
    padding: .4321em

.slide-fade-enter-active {
  transition: all .06s ease;
}
.slide-fade-leave-active {
  transition: all .05s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.box
    padding: 1em 0

.ungrabbedcoin {
  opacity: 0.3
}

.dogepepecoin
    height: 3em
    float: right

.pointsinput
    width: 45%;
    margin-bottom: 1em;
    text-align: center;
    font-size: 1.5em;

.centerchildren
    text-align: center;

.gui
    font-size: 1.5em
    cursor: pointer

.row .three
    height: 5em

.dogep
    height: 6em
    width: 6em
    cursor: pointer
    position: relative
    left: calc(50% - 3em)

.spaced
    margin-bottom: 1em
    clear: both

.floatleft
    height: 100%
    float: left
    clear: both
    max-height: 3.3em
    margin-right: 1em
    cursor: pointer
    margin-top: 0.3em

.title
    text-align: center

.description
    color: white
    margin-bottom: 1em
    margin-left: 4.3em

.box
    width: 100%
    margin: 0 auto

.smallbox
    width: 4em
    margin-bottom: 1em

.adjusttop
    margin-top: 0.3em

.centerform
    margin: 0 auto 1em auto

h2
    text-align: center
    color: white
    margin-top: 0
    //font-weight: normal

.checkwrapper
    overflow: auto
    width: 100%

.checkmark, .tinyboat
    font-size: 2em
    display: inline-block
    cursor: pointer

.boat
    display: inline-block
    font-size: 2em

.tinyboat
    height: 0.35em
    position: relative
    top: 0.01em

.plain
    text-decoration: none

.togglepayments
    margin: 0
    padding: 0
    text-align: center

.thickborder
    border-style: solid
    border-color: wrexyellow
    border-width: 4px
    border-radius: 3.3%

.mainbkg
    background: main

.hodlcount
    position: relative
    left: calc(50% - 1.07em)
    top: -3em
    text-align: center
    width: 35px
    bottom: calc(0.75em + 9px)
    padding-bottom: 0
    margin-bottom: 0
    font-weight: bold
    color: rgba(255, 255, 255, 0.75)
    pointer-events: none
    font-size: 2.5em

.grabbedhodlcount {
    opacity: 1
}

.submode
    height: 6em
    width: 6em
    margin-bottom: 1em
    margin-top: 1em
    background-color: rgba(0, 0, 0, 0)

.max
    height: 100%
    width: 100%

.endpad
    padding-top: 1em
    padding-bottom: 1em
    padding-right: 0
    padding-left: 1em

.endpadtwo
    padding-top: 1em
    padding-bottom: 0.5em

.suggest
    color: rgba(255, 255, 255, 0.4)
    font-style: italic
    font-size: 1.2em
    text-align: center

.hodlsuggest, .dogep .hodlsuggest
    font-size: 1.15em

.none
    list-style-type: none
    margin-left: -1em

.gui.yellowtx
    margin-right: 0.5em

.more
    text-align: center
    background-color: rgba(22, 22, 22, 0.4)
    display: inline-block;
    border-width: 2px
    padding: 0.5em
    margin: 0
    font-size: 1em
    opacity: 0.6
    color: white
    text-align: center
    width: calc(100% - 2.25em)
    cursor: pointer

.more:hover
    background-color: rgba(66, 66, 66, 0.4)

ul
    margin-block-end: 0

.padleft
    margin-left: 0.36em
</style>
