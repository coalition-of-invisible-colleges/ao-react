<template lang='pug'>
.flag(v-if="$store.getters.memberCard")
  div(v-if='!$store.state.context.panel[$store.state.context.top]')
    img.flaggy(@click='deckIt', src='../../assets/images/scroll.svg')
  div(v-else-if="$store.state.upgrades.mode === 'boat'"  @click='flagIt')
    img.flaggy.svgwhite(v-if='!isFlagged', src='../../assets/images/boatblack.svg')
    img.flaggy.prioritized(v-else, src='../../assets/images/boatbtnselected.svg')
  div(v-else-if="$store.state.upgrades.mode === 'badge'")
    span.flaggy.checkmark.clickable(v-if='isCompleted'  @click='uncheck') ☑
    span.flaggy.checkmark.clickable(v-else  @click='complete') ☐
  div(v-else-if="$store.state.upgrades.mode === 'bounty'"  @click='togglePay')
    img.flaggy(src='../../assets/images/bounty.svg')
    .fl(v-if='isPayOpen')
        tag(v-if='$store.state.upgrades.payment === "lightning" && b.bolt11'  :d='b.bolt11')
        tag(v-if='$store.state.upgrades.payment === "bitcoin" && b.address'  :d='b.address')
  div(v-else-if="$store.state.upgrades.mode === 'timecube'")
    img.flaggy(src='../../assets/images/timecube.svg'  @click='toggleCube')
    .fl(v-if='isCubeOpen')
        resource-book(:tId='b.taskId')
</template>

<script>
import calcs from '../../calculations'
import PayReq from '../Deck/PayReq'
import PayAddress from '../Deck/PayAddress'
import Tag from '../Nodes/Tag'
import ResourceBook from '../forms/ResourceBook'


export default {
    components: {PayReq, PayAddress, Tag, ResourceBook},
    data(){
        return {
            isPayOpen: false,
            isCubeOpen: false,
        }
    },
    props: ['b', 'inId'],
    methods: {
        complete(){
            this.$store.dispatch("makeEvent", {
                type: 'task-claimed',
                inId: this.inId,
                taskId: this.b.taskId,
                memberId: this.$store.getters.member.memberId,
                notes: 'checked by ' + this.$store.getters.member.memberId
            })
        },
        uncheck(){
            this.$store.dispatch("makeEvent", {
                type: 'task-unclaimed',
                taskId: this.b.taskId,
                memberId:  this.$store.getters.member.memberId,
                notes: ''
            })
        },
        togglePay(){
            this.isPayOpen = !this.isPayOpen

            if (this.isPayOpen && this.$store.state.upgrades.payment === "bitcoin" && !this.b.address){
              this.$store.dispatch("makeEvent", {
                  type: 'address-updated',
                  taskId: this.b.taskId
              })
            }

            if (this.isPayOpen && this.$store.state.upgrades.payment === "lightning" && !this.b.bolt11){
                let spot = this.$store.state.cash.spot | 10000
                let amount = calcs.cadToSats( 1 , spot)
                this.$store.dispatch("makeEvent", {
                    type: 'invoice-created',
                    taskId: this.b.taskId,
                    amount, //
                    label: '<3'
                })
            }
        },
        toggleCube(){
            this.isCubeOpen = !this.isCubeOpen
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
        },
        isCompleted(){
            return this.b.claimed.indexOf(this.$store.getters.member.memberId) > -1
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

.fl
    position:relative
    left: -500%

.checkmark
    font-size: 1.58em
    float: right
    margin-top: -.3em
    margin-right: -.3em
    opacity: 0.5

.clickable
    cursor: pointer
    color: white

.svgwhite
    fill: white
</style>
