<template lang='pug'>

.resources(@dblclick='goIn')
    h3 {{ r.name }}
        span(v-if='r.stock && r.stock >= 0').stock ({{ r.stock }} remain)
    img.smallguild(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
    span {{ val }}
    .invoices(v-if='showInvoices')
        pay-req(v-if='invoice', :i='invoice')
    .row
        .seven.columns.recent
            label recently used broken, see sun-badge
        .five.columns
            button.use()
                button(@click='use("A")') A
                button(@click='use("B")') B
                button(@click='use("C")') C
                button(@click='use("D")') D
                button(@click='use("E")') E
</template>

<script>
import Current from './Current'
import PayReq from './PayReq'
import calculations from '../../calculations'
import SoundFX from '../../modules/sounds'

export default {
    data(){
        return { showInvoices: false, notes: 'A'  }
    },
    props: ['r', 'c'],
    components: { Current, PayReq },
    computed: {
        val(){
            return calculations.calculateTaskPayout(this.resourceCard)
        },
        resourceCard(){
            return this.$store.getters.hashMap[this.r.resourceId]
        },
        trackStock(){
            return !(this.r.stock == undefined)
        },
        currentMembers(){
            let currentMembers = []
            return currentMembers
        },
        sats(){
            let sats = this.r.charged / this.$store.state.cash.spot * 100000000
            return parseInt( Math.round(sats).toFixed(0) )
        },
    },
    methods: {
        use(letter){
            let newEv = {
                type: 'resource-used',
                resourceId: this.r.resourceId,
                memberId: this.$store.getters.member.memberId,
                amount: 1,
                charged:this.r.charged,
                notes:letter,
            }
            console.log('use triggered:', newEv)
            this.$store.dispatch("makeEvent", newEv)
        },
        goIn(){
            SoundFX.playPageTurn()
            let top = this.c.indexOf(this.r.resourceId)
            console.log("goIn called with TOP: ", top)
            if (top > -1){
                this.$router.push('/' + this.$store.state.upgrades.mode)
                this.$store.dispatch("goIn", {
                    parents: [],
                    panel: this.c,
                    top,
                })
            }
        },
    }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/button'
@import '../../styles/skeleton'
@import '../../styles/skeleton-button'
@import '../../styles/colours'

img
    height: 1.5em
    z-index: 100

button
    color: white
    button
        width: 20%
.resources
    color: accent1
    background-color: darkteal
    border-color: accent4
    border-bottom-style: solid
    border-width: 3px
    width: 100%
    margin-bottom: 1em
    padding-bottom: 1em

.stock
    color: accent2

.refill
    border-color: green
    background: green

.recent
    font-size: .888em

.pay
    border-color: accent2
    background-color: accent2

.use
    border-color: lightteal
    background-color: lightteal

.book
    border-color: purple
    background-color: purple

.current
    background: lightGrey
    color: main
    padding: 0.3em
    border-radius: 0.5em

.fw
    width: 100%

.viney
    float: right
    height: 1.3em

</style>
