<template lang='pug'>

.flag(v-if="$store.getters.memberCard")
  div(v-if="$store.state.upgrades.mode === 'boat'"   @click='flagIt')
    img.flaggy.faded(v-if='!isFlagged', src='../../assets/images/boatbtn.svg')
    img.flaggy.prioritized(v-else, src='../../assets/images/boatbtnselected.svg')
  div(v-if="$store.state.upgrades.mode === 'badge'")
    img.flaggy.faded(src='../../assets/images/guildwithwhitenobkgrnd.png')
  div(v-if="$store.state.upgrades.mode === 'bounty'"  @click='openPay')
    img.flaggy.faded(src='../../assets/images/address.svg')
    div(v-if='isPayOpen')
        pay-req(v-if='$store.state.upgrades.payment === "lightning" && b.bolt11'  :bolt11='b.bolt11')
        pay-address(v-if='$store.state.upgrades.payment === "lightning" && b.address'  :address='b.address')
  div(v-if="$store.state.upgrades.mode === 'timecube'")
    img.flaggy.faded(src='../../assets/images/time.svg')
</template>

<script>

import PayReq from '../Deck/PayReq'
import PayAddress from '../Deck/PayAddress'

export default {
    components: {PayReq, PayAddress},
    data(){
        return {
            isPayOpen: false
        }
    },
    props: ['b', 'inId'],
    methods: {
        togglePay(){
            this.isPayOpen = !this.isPayOpen
            // get address / qr if not exists
        },
        deckIt(){
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                subTask: this.b.taskId,
                taskId: this.$store.getters.memberCard.taskId,
            })
        },
        flagIt(){
            if (!this.isFlagged) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-prioritized',
                    taskId: this.b.taskId,
                    inId: this.inId,
                })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: 'task-refocused',
                    taskId: this.b.taskId,
                    inId: this.inId,
                })
            }
        },
    },
    computed: {
        isFlagged(){
            let isFlagged = false
            this.$store.state.tasks.forEach( t => {
                if (t.taskId === this.inId){
                    isFlagged = t.priorities.indexOf(this.b.taskId) > -1
                }
            })
            return isFlagged
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/grid';
@import '../../styles/button';

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.flaggy
    float: right
    height: .777em
    cursor: pointer

.prioritized
    height: 1.3em

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

</style>
