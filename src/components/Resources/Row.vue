<template lang='pug'>

.resources
    h3 {{ r.name }}
        span(v-if='r.stock && r.stock >= 0').stock ({{ r.stock }} remain)
    .invoices(v-if='showInvoices')
        pay-req(v-if='invoice', :i='invoice')
    .row
        .seven.columns.recent
            label recently used by:
            .current
                current(v-for='memberId in currentMembers', :memberId='memberId')
        .five.columns
            router-link(v-if='trackStock', :to='"/resource_stock/" + r.resourceId')
                button.refill replenish
            button.use(@click='use')
                span use
            router-link.fw(:to='"/task/" + r.resourceId')
                img.viney(src='../../assets/images/vinebtn.svg')
</template>

<script>
import request from 'superagent'
import Current from './Current'
import PayReq from './PayReq'

export default {
    data(){
        return { showInvoices: false }
    },
    props: ['r'],
    components: { Current, PayReq },
    computed: {
        trackStock(){
            return !(this.r.stock == undefined)
        },
        currentMembers(){
            let currentMembers = []
            let now = Date.now()
            this.$store.state.recent.forEach(ev => {
                let msSince = now - ev.timestamp
                if (
                    ev.type == 'resource-used' &&
                    ev.resourceId == this.r.resourceId
                ){
                    if (currentMembers.indexOf(ev.memberId) === -1 ){
                        currentMembers.push(ev.memberId)
                    }
                }
            })
            return currentMembers
        },
        sats(){
            let sats = this.r.charged / this.$store.state.cash.spot * 100000000
            return parseInt( Math.round(sats).toFixed(0) )
        },
    },
    methods: {
        use(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'resource-used',
                    resourceId: this.r.resourceId,
                    memberId: this.$store.getters.member.memberId,
                    amount: 1,
                    charged:this.r.charged,
                    notes:'ao',
                })
                .end((err,res) => {
                    if (err) return console.log(err);
                    console.log('resource-used:', res.body)
                })
        }
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

.resources
    color: accent1
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
