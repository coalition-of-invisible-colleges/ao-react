<template lang='pug'>
.flag(v-if="$store.getters.memberCard")
    .flaggy(:id='uuid'  :class='{ boat : ($store.state.upgrades.mode === "boat" || $store.state.upgrades.mode === "doge") && !isDoged, doge : ($store.state.upgrades.mode === "boat" || $store.state.upgrades.mode === "doge") && isDoged, chest : $store.state.upgrades.mode === "chest", timecube : $store.state.upgrades.mode === "timecube", nolightning : $store.state.upgrades.mode === "chest" && !$store.state.cash.info.alias  }')
        img(v-if='!$store.state.context.panel[$store.state.context.top]'  src='../../assets/images/scroll.svg')
        span.checkmark(v-else-if='($store.state.upgrades.mode === "badge" || isOracle()) && isCompleted') ☑
        span.checkmark(v-else-if='($store.state.upgrades.mode === "badge" || isOracle()) && !isCompleted') ☐
        img(v-else-if='($store.state.upgrades.mode === "boat" || $store.state.upgrades.mode === "doge") && isDoged'  src='../../assets/images/doge_faded.png')
        img.svgwhite.faded(v-else-if='($store.state.upgrades.mode === "boat" || $store.state.upgrades.mode === "doge") && !isFlagged', src='../../assets/images/boatwhite.svg',  :class='{raiseboat: !inId}')
        img(v-else-if='($store.state.upgrades.mode === "boat" || $store.state.upgrades.mode === "doge") && isFlagged', src='../../assets/images/boatbtnselected.svg')
        img(v-else-if='$store.state.upgrades.mode === "chest"'  src='../../assets/images/bounty.svg')
        img(v-else-if='$store.state.upgrades.mode === "timecube"' src='../../assets/images/timecube.svg')
    .opened
        resource-book(v-if='isCubeOpen'  :tId='b.taskId')
        div(v-if='isPayOpen')
          tag(v-if='$store.state.upgrades.payment === "lightning" && b.bolt11'  :d='b.bolt11')
          tag(v-if='$store.state.upgrades.payment === "bitcoin" && b.address'  :d='b.address')
</template>

<script>
import calcs from '../../calculations'
import PayReq from '../Deck/PayReq'
import PayAddress from '../Deck/PayAddress'
import Tag from '../Nodes/Tag'
import ResourceBook from '../forms/ResourceBook'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import HelmControl from '../../utils/helm'
import SoundFX from '../../utils/sounds'
import uuidv1 from 'uuid/v1'
import Dimensions from '../../utils/dimensions'

export default {
    components: { PayReq, PayAddress, Tag, ResourceBook },
    data(){
        return {
            isPayOpen: false,
            isCubeOpen: false,
            uuid: uuidv1(),
        }
    },
    props: ['b', 'inId'],
    mounted() {
        let el = document.getElementById(this.uuid)
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let Tap = new Hammer.Tap({ time: 400 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            switch(this.$store.state.upgrades.mode) {
                case 'doge':
                    if(this.isOracle()) {
                        if(!this.isCompleted) {
                            this.complete()
                        } else {
                            this.uncheck()
                        }
                        break
                    }
                case 'boat':
                    if(this.isDoged) {
                        this.dogeIt()
                    } else {
                        this.flagIt()
                    }
                    break
                case 'badge':
                    if(!this.isCompleted) {
                        this.complete()
                    } else {
                        this.uncheck()
                    }
                    break
                case 'chest':
                    if(this.$store.state.cash.info.alias) {
                        this.togglePay()
                    }
                    break
                case 'timecube':
                    this.toggleCube()
                    break
            }
            e.stopPropagation()
        })

        let Press = new Hammer.Press({ time: 400 })
        mc.add(Press)
        mc.on('press', (e) => {
            switch(this.$store.state.upgrades.mode) {
                case false:
                    return
                case 'doge':
                case 'boat':
                    this.dogeIt()
                    break
                case 'badge':
                    return
                case 'chest':
                    return
                case 'timecube':
                    return
            }
            e.stopPropagation()
        })

        let Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            HelmControl.flashHelm()
            SoundFX.playCaChunk()
            HelmControl.previousUpgradeMode(this.$router)
            e.stopPropagation()
        })

        mc.on('swiperight', (e) => {
            HelmControl.flashHelm()
            SoundFX.playCaChunk()
            HelmControl.nextUpgradeMode(this.$router)
            e.stopPropagation()
        })
    },
    methods: {
        complete(){
            SoundFX.playTickMark()
            this.$store.dispatch("makeEvent", {
                type: 'task-claimed',
                inId: this.inId,
                taskId: this.b.taskId,
                memberId: this.$store.getters.member.memberId,
                notes: 'checked by ' + this.$store.getters.member.memberId
            })
        },
        uncheck(){
            SoundFX.playTickMark()
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
            SoundFX.playTwinkleUp()
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                subTask: this.b.taskId,
                taskId: this.$store.getters.memberCard.taskId,
            })
        },
        flagIt(){
            if (!this.isFlagged) {
                if (this.inId){
                    if(this.inId === this.$store.getters.memberCard.taskId) {
                        SoundFX.playDogeBark()
                    } else {
                        SoundFX.playSailUnfurl()
                    }
                    this.$store.dispatch("makeEvent", {
                      type: 'task-prioritized',
                      taskId: this.b.taskId,
                      inId: this.inId,
                    })
                } else {
                    this.deckIt()
                }
            } else {
                if (this.inId){
                    SoundFX.playBoatCapsize()
                    this.$store.dispatch("makeEvent", {
                      type: 'task-refocused',
                      taskId: this.b.taskId,
                      inId: this.inId,
                    })
                } else {
                    this.deckIt()
                }
            }
        },
        dogeIt(){
            if(this.$store.getters.memberCard.priorities.indexOf(this.b.taskId) === -1) {
                SoundFX.playDogeBark()
                this.$store.dispatch("makeEvent", {
                  type: 'task-prioritized',
                  taskId: this.b.taskId,
                  inId: this.$store.getters.memberCard.taskId,
                })
            } else {
                SoundFX.playBoatCapsize()
                this.$store.dispatch("makeEvent", {
                  type: 'task-refocused',
                  taskId: this.b.taskId,
                  inId: this.$store.getters.memberCard.taskId,
                })
            }
        },
        isOracle() {
            return Dimensions.isSun(this.$router) && this.$store.state.upgrades.mode === 'doge'
        },
    },
    computed: {
        isFlagged(){
            if(!this.inId) {
                return false
            }
            return this.$store.getters.hashMap[this.inId].priorities.indexOf(this.b.taskId) > -1
        },
        isCompleted(){
            return this.b.claimed.indexOf(this.$store.getters.member.memberId) > -1
        },
        isDoged() {
            return this.$store.getters.memberCard.priorities.indexOf(this.b.taskId) > -1
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/grid';
@import '../../styles/button';

.raiseboat
    transform: rotate(-30deg)

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

.flaggy
    position: absolute
    right: 1em
    top: 1em
    height: 1em
    cursor: pointer
    z-index: 99
    
.flaggy img
    pointer-events: none
    height: 100%

.doge
    height: 1.3em
    margin-top: -0.1em
    margin-right: -0.1em

.chest, .timecube
    height: 1.1em
    margin-top: -0.2em
    margin-right: -0.2em
    
.boat
    height: 1em
    margin-top: -0.2em
    margin-right: -0.4em
    
.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

.checkmark
    font-size: 1.58em
    float: right
    margin-top: -.3em
    margin-right: -.3em
    opacity: 0.5
    cursor: pointer
    color: white

.svgwhite
    fill: white

.svgwhite.hover
    transform: rotate(-30deg)

.opened
    display: block
    position: relative
    
.nolightning
    opacity: 0.15
    cursor: default
</style>
