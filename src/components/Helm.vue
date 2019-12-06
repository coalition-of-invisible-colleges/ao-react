<template lang='pug'>

.helm(@contextmenu.prevent)
    button.modeleft(v-if='$store.state.upgrades.mode || !$store.getters.isLoggedIn'  id='helmleft'  :class='{ boat : $store.state.upgrades.mode === "badge" }'  @mousedown='shortFlash')
        img.upg(v-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/boatblack.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/badge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/bounty.svg')
        img.upg.timecube(v-else-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/buddadoge.svg')
    button.topcenter.adjtooltip(:class='{ closed : $store.state.upgrades.mode === "doge" && $store.getters.isLoggedIn }' id='helm'  @mousedown='shortFlash')
        .full
            img.upg(v-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/boatblack.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/badge.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/bounty.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/timecube.svg')
            img.upg(v-else  src='../assets/images/buddadoge.svg')
    .tooltiptext.center(v-if='$store.getters.member.muted'  :class='{ fix : $store.state.upgrades.mode !== "doge" }')
        h1 Helm
        p dab to advance mode, multidab to jump to a specific mode, or swipe left/right to change mode
        p.leftalign Card Upgrades:
        ul
            li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
                img.lil(src='../assets/images/buddadoge.svg')
                span Doge Mode - Member Card (dab-and-hodl)
            li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
                img.lil(src='../assets/images/boatblack.svg')
                span Boat Mode - Priorities (double dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
                img.lil(src='../assets/images/badge.svg')
                span Badge Mode - Missions &amp; Checkmarks (triple dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
                img.lil(src='../assets/images/bounty.svg')
                span Chest Mode - Send Points (4 dabs)
            li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
                img.lil(src='../assets/images/timecube.svg')
                span Timecube - Book Event (5 dabs)
    button.moderight(v-if='$store.state.upgrades.mode || !$store.getters.isLoggedIn' id='helmright'  @mousedown='shortFlash')
        img.upg(v-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/buddadoge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/badge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/bounty.svg')
        img.upg.timecube(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/timecube.svg')
</template>

<script>

import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import HelmControl from '../utils/helm'
import Dimensions from '../utils/dimensions'
import SoundFX from '../utils/sounds'
import Status from './Status'

export default {
    mounted() {
        let el = document.getElementById('helm')
        let mc = Propagating(new Hammer.Manager(el))

        let Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            HelmControl.flashHelm()
            this.nextMode()
            e.stopPropagation()
        })

        mc.on('swiperight', (e) => {
            HelmControl.flashHelm()
            this.nextMode()
            e.stopPropagation()
        })

        mc.on('swipeup', (e) => {
            HelmControl.flashHelm()
            HelmControl.closeUpgrades()
            if(this.$router.currentRoute.path.split("/")[1] === 'front') {
                this.$router.push('/front/doge')
            } else if(this.$router.currentRoute.path.split("/")[1] === 'dash') {
                this.$router.push('/dash/doge')
            } else {
                this.$router.push('/doge')
            }
            e.stopPropagation()
        })

        mc.on('swipedown', (e) => {
            HelmControl.flashHelm()
            this.nextMode()
            e.stopPropagation()
        })

        let helmTap = new Hammer.Tap({ time: 400 })
        let helmDoubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })
        let helmTripleTap = new Hammer.Tap({ event: 'tripletap', taps: 3, time: 400, interval: 400 })
        let helmQuadrupleTap = new Hammer.Tap({ event: 'quadrupletap', taps: 4, time: 400, interval: 400 })
        let helmQuintupleTap = new Hammer.Tap({ event: 'quintupletap', taps: 5, time: 400, interval: 400 })
        let helmPress = new Hammer.Press({ time: 600 })
        mc.add([helmPress, helmQuintupleTap, helmQuadrupleTap, helmTripleTap, helmDoubleTap, helmTap])
        helmPress.recognizeWith([helmQuintupleTap, helmQuadrupleTap, helmTripleTap, helmDoubleTap, helmTap])
        helmTap.recognizeWith([helmQuintupleTap, helmQuadrupleTap, helmTripleTap, helmDoubleTap])
        helmTap.requireFailure([helmQuintupleTap, helmQuadrupleTap, helmTripleTap, helmDoubleTap])
        helmDoubleTap.recognizeWith([helmQuintupleTap, helmQuadrupleTap, helmTripleTap])
        helmDoubleTap.requireFailure([helmQuintupleTap, helmQuadrupleTap, helmTripleTap])
        helmTripleTap.recognizeWith([helmQuintupleTap, helmQuadrupleTap])
        helmTripleTap.requireFailure([helmQuintupleTap, helmQuadrupleTap])
        helmQuadrupleTap.recognizeWith(helmQuintupleTap)
        helmQuadrupleTap.requireFailure(helmQuintupleTap)

        mc.on('tap', (e) => {
            HelmControl.flashHelm(0.5)
            if(!this.isUni()) {
                this.goUni(this.$store.state.upgrades.mode)
            } else {
                this.nextMode()
            }
            e.stopPropagation()
        })

        mc.on('doubletap', (e) => {
            console.log("double click")
            HelmControl.flashHelm(0.5)
            this.goUni('boat')
            e.stopPropagation()
        })

        mc.on('tripletap', (e) => {
            console.log("triple click")
            HelmControl.flashHelm(0.5)
            this.goUni('badge')
            e.stopPropagation()
        })

        mc.on('quadrupletap', (e) => {
            HelmControl.flashHelm(0.5)
            this.goUni('chest')
            e.stopPropagation()
        })

        mc.on('quintupletap', (e) => {
            HelmControl.flashHelm(0.5)
            this.goUni('timecube')
            e.stopPropagation()
        })

        mc.on('press', (e) => {
            if(this.isUni()){
                if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.taskId === this.$store.getters.memberCard.taskId) {
                    HelmControl.flashHelm(5)
                    this.goFront('doge')
                } else {
                    HelmControl.flashHelm(2)
                    this.goUni('doge', true)
                    if(this.$store.getters.contextCard.taskId !== this.$store.getters.memberCard.taskId) {
                        this.goHome()
                    }
                }
            } else {
                HelmControl.flashHelm(2)
                this.goUni('doge')
                if(this.$store.getters.contextCard.taskId !== this.$store.getters.memberCard.taskId) {
                    this.goHome()
                }
            }
            e.stopPropagation()
        })

        let rel = document.getElementById('helmright')
        let rmc = new Hammer.Manager(rel)

        let Tap2 = new Hammer.Tap({ time: 400 })
        rmc.add(Tap2)
        rmc.on('tap', (e) => {
            HelmControl.flashHelm(0.5)
            SoundFX.playCaChunk()
            HelmControl.nextUpgradeMode(this.$router)
        })

        let lel = document.getElementById('helmleft')
        let lmc = new Hammer.Manager(lel)

        let Tap3 = new Hammer.Tap({ time: 400 })
        lmc.add(Tap3)
        lmc.on('tap', (e) => {
            HelmControl.flashHelm(0.5)
            SoundFX.playCaChunk()
            HelmControl.previousUpgradeMode(this.$router)
        })
    },
    methods: {
        setToRoute() {
            let mainroute = this.$router.currentRoute.path.split('/')[1]
            switch (mainroute){
              case "front": return this.showImg = "sun"
              case "dash": return this.showImg = "bull"
              default: return this.showImg = "uni"
            }
        },
        goUni(mode, silent = false) {
            if(Dimensions.isDeck(this.$router, mode)) {
                if(!silent) {
                    SoundFX.playPortalBlocked()
                }
                return
            }
            if(!this.isUni()) {
                SoundFX.playPortalTransit()
            } else {
                SoundFX.playCaChunk()
            }
            this.$store.commit('startLoading', 'uni')
            this.$router.push('/' + mode)
            setTimeout(() => {
                this.setToRoute()
                // this.uniRight = !this.uniRight
            }, 20)
        },
        isUni() {
            return Dimensions.isUni(this.$router)
        },
        goFront(mode) {
            if(Dimensions.isFront(this.$router, mode)) {
                SoundFX.playPortalBlocked()
                return
            }
            if(mode === 'doge') {
                SoundFX.playDogeBark()
            } else {
                SoundFX.playCaChunk()
            }
            this.$store.commit('startLoading', 'sun')
            this.$router.push('/front/' + mode)
            setTimeout(() => {
                this.setToRoute()
                this.uniLeft = !this.uniLeft
            }, 20)
        },
        shortFlash() {
            HelmControl.flashHelm(0.5)
        },
        nextMode() {
            SoundFX.playCaChunk()
            HelmControl.nextUpgradeMode(this.$router)
        },
        goHome(taskId){
            SoundFX.playPortalTransit()
            let parents = []
            if (this.$store.getters.contextCard.taskId){
                parents.push(this.$store.getters.contextCard.taskId)
            }
            this.$store.dispatch("goIn", {
                panel: [this.$store.getters.memberCard.taskId],
                top: 0,
                parents
            })
            this.$router.push("/" + this.$store.state.upgrades.mode)
        },
    },
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/grid'
@import '../styles/tooltips'

.full
    width: 100%
    height: 100%

.helpcontrol
  display: flex
  flex-direction: column
  min-height: 5.8em

.side_bar ul
  margin-left: 10px

.toggle ul
  padding-left:0

a
  text-decoration: none
  color: accent1
  padding: 10px 20px
  margin-bottom: 0
  margin-left:auto
  margin-right:auto
  list-style: none
  font-family:sans-serif
  display: block
  margin-bottom:5px
  max-width:360px
  text-align:center
  background-color:accent5

a:hover, .router-link-active
  background-color: accent4
  color:contentColour
  border-style: none

a.router-link-active
    background-color: purple
    color:contentColour
    :hover
        background-color: purple

.admin
  color: main
  background: green
  border-radius: .6em
  padding: .5em

.p
    color: white
    text-align: center
    padding: 1em

hr
    color: lightteal

.dableft, .dabright
    position: absolute
    top: 0
    display: flex
    flex-direction: column
    width: 7em
    cursor: pointer
    z-index: 152

.dableft
    left: 0

.dabright
    right: 0

@media only screen and (max-width: 550px) {
  .modeleft, .moderight {
    display: none
  }
}

.btc
    border: 2px purple solid
    border-radius: 5px
    background-color: purple
    color: white
    height: 4em
    margin-left: 0.5em
    margin-right: 0.5em
    margin-top: 1.5em
    margin-bottom: 0em
    -webkit-transition-property: background-color margin-bottom margin-top border
    -webkit-transition-duration: 7s
    -webkit-transition-timing-function: ease-in-out
    transition-property: background-color margin-bottom margin-top border
    transition-duration: 7s
    transition-timing-function: ease-in-out

.sat
    border: 2px teal solid
    border-radius: 5px
    background-color: teal
    color: white
    height: 4em
    margin-top: 0em
    margin-bottom: 1.5em
    -webkit-transition-property: background-color margin-bottom margin-top border
    -webkit-transition-duration: 7s
    -webkit-transition-timing-function: ease-in-out
    transition-property: background-color margin-bottom margin-top border
    transition-duration: 7s
    transition-timing-function: ease-in-out

.smallbird
    height:1em

.subheading
    opacity: 0.9
    font-size: 85%

.dot
    height: 0.5em
    width: 0.5em
    border-radius: 50%
    display: inline-block
    margin-right: 0.5em

.faded
    opacity: 0.4

#helm
    cursor: pointer

.upg
    height: 2em
    pointer-events: none

.lil
    height: 1em
    position: absolute
    left: -1em
    transform: translateX(-50%)

.topcenter
    position: fixed
    top: 0
    left: 50%
    transform: translateX(-50%)
    width: 10em
    max-width: 33%
    background: softGray
    color: main
    padding-left: 2em
    padding-right: 2em
    padding-top: .29em
    padding-bottom: .29em
    z-index: 77777
    opacity: 0.71
    border-bottom-left-radius: 50%
    border-bottom-right-radius: 50%
    border-top: none

.modeleft, .moderight
    position: fixed
    top: 0
    left: calc(50% - 10em)
    opacity: 0.4
    // background: white
    // box-shadow: rgba(255, 255, 255, 0.65) 0px 0px 10px
    background: none
    border: none
    z-index: 153

.modeleft
    transform: translateX(50%)

.moderight
    left: calc(50% + 7.5em)
    transform: translateX(-50%)

.closed
    opacity: 1
    position: absolute

@keyframes flashhalf
    0% { background-color: #9ff; border-color: #aff }
    100% { background-color: softGray; border-color: buttonface }

@keyframes flash
    // 0% { background-color: softGray; border-color: buttonface }  // this makes the flash start late when there is GUI lag. but looks better.
    0% { background-color: #9ff; border-color: #aff }
    50% { background-color: #9ff; border-color: #aff }
    100% { background-color: softGray; border-color: buttonface }

.topcenter.flash
    animation-name: flash
    animation-duration: 0.35s
    animation-iteration-count: 1
    transition-timing-function: ease
    transition-property: background-color

.topcenter.flash.half
    animation-name: flashhalf
    animation-duration: 0.245s

.topcenter.flash.twice
    animation-duration: 0.1725
    animation-iteration-count: 2

.topcenter.flash.five
    animation-duration: calc(0.1725 * 5)
    animation-iteration-count: 5

.topcenter:hover
    background-color: #d3e3e3

.boat
    transform: none

.timecube
    transform: translateX(-0.2em)

.dabstination:before
    content: ""
    border: 1px solid white
    border-width: 2px 2px 0 0
    display: block
    height: 0
    width: 0
    position: absolute
    top: 0.42em
    left: -2.5em
    height: 5px
    width: 5px
    transform: rotate(45deg)

.dabstination
    font-weight: bold

.tooltiptext.left, .tooltiptext.right, .tooltiptext.center
    position: absolute
    font-size: 1.3em
    width: 20em
    z-index: 88888
    top: 0.5em

.tooltiptext.left
    left: 6em

.tooltiptext.right
    right: 6em

.tooltiptext.center
    left: 50%
    top: 3em
    transform: translateX(-50%)

.tooltiptext.center.fix
    position: fixed
</style>
