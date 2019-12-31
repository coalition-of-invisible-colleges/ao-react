<template lang='pug'>

.navigation(@contextmenu.prevent)
    h1.loadingscreen(v-if='$store.state.context.loading') loading {{ $store.state.context.loading }}
    img.dableft.adjtooltip(src="../assets/images/navigas/sun.svg"  ref='sun'  :class='{ bigger : isSun() }')
    //- img.dableft.adjtooltip(v-if='$store.state.upgrades.warp > -1'  src="../assets/images/navigas/sun_red.svg"  ref='sun')
    .tooltiptext.left(v-if='$store.getters.member.muted')
        h2.leftalign Sun Pages:
        ul
            li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
                img.lil(src='../assets/images/buddadoge.svg')
                span Oracle *
            li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
                img.lil(src='../assets/images/boatblack.svg')
                span Top Missions **
            li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
                img.lil(src='../assets/images/badge.svg')
                span Recent ***
            li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
                img.lil(src='../assets/images/bounty.svg')
                span Bounties ****
            li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
                img.lil(src='../assets/images/timecube.svg')
                span Calendar *****
        p once to advance or multiclick to a specific page
    img.dabright.adjtooltip(src="../assets/images/navigas/bull.svg"  ref='bull'  :class='{ bigger : isBull() }')
    .tooltiptext.right(v-if='$store.getters.member.muted')
        h2.leftalign Bull Pages:
        ul
            li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
                img.lil(src='../assets/images/buddadoge.svg')
                span Controls *
            li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
                img.lil(src='../assets/images/boatblack.svg')
                span Connections **
            li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
                img.lil(src='../assets/images/badge.svg')
                span Accounts ***
            li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
                img.lil(src='../assets/images/bounty.svg')
                span Lightning ****
            li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
                img.lil(src='../assets/images/timecube.svg')
                span Central Reserve *****
        p once to advance or multiclick to a specific page
    helm
    .pushdown
    div(:class='{suncontext: isSun(), bullcontext: isBull()}' @keydown.tab='nextMode' /* @keydown.shift.tab='previousUpgradeMode'  @keyup.preventDefault */)
        .transparentsides
    template(v-if='showImg === "uni"'  v-for='(n, i) in $store.state.context.parent')
        div(@click='goToParent(n)')
            context(:taskId='n'  :style="{ width: 'calc(100% - 14em - ' + ($store.state.context.parent.length - 1 - (i * 0.5)) + 'em)' }")
    status
    task-create(v-if='!isBull() && !isSun()')
    img.uni(v-else  src="../assets/images/navigas/uni.svg"  @click='toCardMode')
    div(v-if='isBull()')
        .btcspot 1BTC = ${{ $store.state.cash.spot.toLocaleString() }}
        .satspot 1 = {{ $store.getters.satPointSpot.toLocaleString() }}&#12471;
    .logout(v-if='isBull() && $store.getters.isLoggedIn'  @click="killSession") log out
</template>

<script>

import Vue from 'vue'
import calculations from '../calculations'
import Auth from './Auth'
import CardPanel from './Deck/CardPanel'
import Context from './Deck/Context'
import TaskCreate from './forms/TaskCreate'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import Dimensions from '../utils/dimensions'
import Helm from './Helm'
import HelmControl from '../utils/helm'
import Themes from '../utils/themes'
import SoundFX from '../utils/sounds'
import Status from './Status'

export default {
    name: 'navigation',
    components: { Auth, CardPanel, Context, TaskCreate, Status, Helm },
    mounted() {
        this.setToRoute()

        let sunel = this.$refs.sun
        let sunmc = Propagating(new Hammer.Manager(sunel))
        let sunTap = new Hammer.Tap({ time: 400 })
        let sunDoubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })
        let sunTripleTap = new Hammer.Tap({ event: 'tripletap', taps: 3, time: 400, interval: 400 })
        let sunQuadrupleTap = new Hammer.Tap({ event: 'quadrupletap', taps: 4, time: 400, interval: 400 })
        let sunQuintupleTap = new Hammer.Tap({ event: 'quintupletap', taps: 5, time: 400, interval: 400 })
        let sunPress = new Hammer.Press({ time: 600 })
        sunmc.add([sunPress, sunQuintupleTap, sunQuadrupleTap, sunTripleTap, sunDoubleTap, sunTap])
        sunPress.recognizeWith([sunQuintupleTap, sunQuadrupleTap, sunTripleTap, sunDoubleTap, sunTap])
        sunTap.recognizeWith([sunQuintupleTap, sunQuadrupleTap, sunTripleTap, sunDoubleTap])
        sunTap.requireFailure([sunQuintupleTap, sunQuadrupleTap, sunTripleTap, sunDoubleTap])
        sunDoubleTap.recognizeWith([sunQuintupleTap, sunQuadrupleTap, sunTripleTap])
        sunDoubleTap.requireFailure([sunQuintupleTap, sunQuadrupleTap, sunTripleTap])
        sunTripleTap.recognizeWith([sunQuintupleTap, sunQuadrupleTap])
        sunTripleTap.requireFailure([sunQuintupleTap, sunQuadrupleTap])
        sunQuadrupleTap.recognizeWith(sunQuintupleTap)
        sunQuadrupleTap.requireFailure(sunQuintupleTap)

        sunmc.on('tap', (e) => {
            if(!this.isSun()) {
                this.goFront(false)

            } else {
                this.nextMode()
                this.goFront(false)
            }
            e.stopPropagation()
        })

        sunmc.on('doubletap', (e) => {
            console.log("double click")
            this.goFront('boat')
            e.stopPropagation()
        })

        sunmc.on('tripletap', (e) => {
            console.log("triple click")
            this.goFront('badge')
            e.stopPropagation()
        })

        sunmc.on('quadrupletap', (e) => {
            this.goFront('chest')
            e.stopPropagation()
        })

        sunmc.on('quintupletap', (e) => {
            this.goFront('timecube')
            e.stopPropagation()
        })

        sunmc.on('press', (e) => {
            this.goFront('doge')
            e.stopPropagation()
        })

        let bullel = this.$refs.bull
        let bullmc = Propagating(new Hammer.Manager(bullel))
        let bullTap = new Hammer.Tap({ time: 400 })
        let bullDoubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })
        let bullTripleTap = new Hammer.Tap({ event: 'tripletap', taps: 3, time: 400, interval: 400 })
        let bullQuadrupleTap = new Hammer.Tap({ event: 'quadrupletap', taps: 4, time: 400, interval: 400 })
        let bullQuintupleTap = new Hammer.Tap({ event: 'quintupletap', taps: 5, time: 400, interval: 400 })
        let bullPress = new Hammer.Press({ time: 600 })
        bullmc.add([bullPress, bullQuintupleTap, bullQuadrupleTap, bullTripleTap, bullDoubleTap, bullTap])
        bullPress.recognizeWith([bullQuintupleTap, bullQuadrupleTap, bullTripleTap, bullDoubleTap, bullTap])
        bullTap.recognizeWith([bullQuintupleTap, bullQuadrupleTap, bullTripleTap, bullDoubleTap])
        bullTap.requireFailure([bullQuintupleTap, bullQuadrupleTap, bullTripleTap, bullDoubleTap])
        bullDoubleTap.recognizeWith([bullQuintupleTap, bullQuadrupleTap, bullTripleTap])
        bullDoubleTap.requireFailure([bullQuintupleTap, bullQuadrupleTap, bullTripleTap])
        bullTripleTap.recognizeWith([bullQuintupleTap, bullQuadrupleTap])
        bullTripleTap.requireFailure([bullQuintupleTap, bullQuadrupleTap])
        bullQuadrupleTap.recognizeWith(bullQuintupleTap)
        bullQuadrupleTap.requireFailure(bullQuintupleTap)

        bullmc.on('tap', (e) => {
            console.log("single click bull")
            if(!this.isBull()) {
                this.goDash(false)
            } else {
                this.nextMode()
                this.goDash(false)
            }
            e.stopPropagation()
        })

        bullmc.on('doubletap', (e) => {
            console.log("double click")
            this.goDash('boat')
            e.stopPropagation()
        })

        bullmc.on('tripletap', (e) => {
            console.log("triple click")
            this.goDash('badge')
            e.stopPropagation()
        })

        bullmc.on('quadrupletap', (e) => {
            this.goDash('chest')
            e.stopPropagation()
        })

        bullmc.on('quintupletap', (e) => {
            this.goDash('timecube')
            e.stopPropagation()
        })

        bullmc.on('press', (e) => {
            this.goDash('doge')
            e.stopPropagation()
        })
    },
    watch: {
      '$route': 'setToRoute'
    },
    data(){
        return {
            showBtc: false,
            search: '',
            showImg: 'uni',
            uniLeft: false,
            uniRight: false,
        }
    },
    methods: {
        toCardMode(){
            this.$router.push("/" + this.$store.state.upgrades.mode)
        },
        killSession(){
            this.$store.dispatch("makeEvent", {
                type: "session-killed",
                session: this.$store.state.loader.session
            })
        },
        goToParent(target){
            this.$store.dispatch("goUp", {
                target,
                panel: [target],
                top: 0
            })
        },
        cycleLeft(){
            SoundFX.playSqaWink()
            if(this.isSun()){
                this.$store.commit('startLoading', 'unicorn')
                return this.$router.push('/' + this.$store.state.upgrades.mode)
            }
            this.$store.commit('startLoading', 'sun')
            this.$router.push('/front/' + this.$store.state.upgrades.mode)
            setTimeout(() => {
                this.setToRoute()
                this.uniLeft = !this.uniLeft
            }, 20)
        },
        cycleRight(){
            SoundFX.playSqaWink()
            if(this.isBull()) {
                this.$store.commit('startLoading', 'unicorn')
                return this.$router.push('/'  + this.$store.state.upgrades.mode)
            }
            this.$store.commit('startLoading', 'bull')
            this.$router.push('/dash/'  + this.$store.state.upgrades.mode)
            setTimeout(() => {
                this.setToRoute()
                this.uniRight = !this.uniRight
            }, 20)
        },
        goFront(mode) {
            if(mode && this.isSun() && this.$store.state.upgrades.mode === mode) {
                mode = 'timecube'
            }
            if(!mode) {
                mode = this.$store.state.upgrades.mode
            }
            this.$store.commit('startLoading', 'sun-' + mode)
            if(mode === 'doge') {
                SoundFX.playDogeBark()
            } else {
                SoundFX.playCaChunk()
            }
            this.$router.push('/front/' + mode)
        },
        goDash(mode) {
            if(mode && this.isBull() && this.$store.state.upgrades.mode === mode) {
                mode = 'timecube'
            }
            if(!mode) {
                mode = this.$store.state.upgrades.mode
            }
            this.$store.commit('startLoading', 'bull-' + mode)
            if(mode === 'doge') {
                SoundFX.playBullRoar()
            } else {
                SoundFX.playCaChunk()
            }
            this.$router.push('/dash/' + mode)
        },
        setToRoute() {
            let mainroute = this.$router.currentRoute.path.split('/')[1]
            switch (mainroute){
              case "front": return this.showImg = "sun"
              case "dash": return this.showImg = "bull"
              default: return this.showImg = "uni"
            }
        },
        toggleShowBtc() {
            this.showBtc = !this.showBtc
        },
        killSession(){
          this.$store.dispatch("makeEvent", {
              type: "session-killed",
              session: this.$store.state.loader.session
          })

          window.localStorage.removeItem("token")
          window.localStorage.removeItem("session")
          this.$store.commit('setAuth', {
              token: '', session: ''
          })
          this.$store.dispatch('loadCurrent')
        },
        isSun() {
            return Dimensions.isSun(this.$router)
        },
        isBull() {
            return Dimensions.isBull(this.$router)
        },
        nextMode() {
            SoundFX.playCaChunk()
            this.$store.commit('nextMode')
        },
    },
}

function updateTransition() {
  let btc = document.querySelector("span.btc")
  let sat = document.querySelector("span.sat")

  if (btc) {
      btc.className = "sat"
  }
  if(sat){
      sat.className="btc"
  }

}

updateTransition()
let intervalID = window.setInterval(updateTransition, 7000)

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/grid'
@import '../styles/tooltips'


.uni
    position: fixed
    bottom: 0
    left: 50%
    transform: translateX(-50%)
    height: 5.5555555555em
    cursor: pointer

.bullcontext, .suncontext
    height: 1.75em
    background-repeat: repeat-x
    background-size: 3em
    margin-left: 7em
    margin-right: 7em
    z-index: -1

.bullcontext
    background-image: url("../assets/images/bullleg.svg")
    bacground-position: top center
    margin-left: 9em
    margin-right: 9em

.suncontext
    background-image: url("../assets/images/sunbean.svg")
    bacground-position: top center
    margin-left: 9em
    margin-right: 9em

.transparentleft
    width: 100%
    height: 100%
    background: -moz-linear-gradient(right, rgba(32,32,32,0) 0%, rgba(32,32,32,0) 1%, rgba(32,32,32,0) 90%, rgba(32,32,32,1) 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(right, rgba(32,32,32,0) 0%,rgba(32,32,32,0) 1%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to left, rgba(32,32,32,0) 0%,rgba(32,32,32,0) 1%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */

.transparentright
    width: 100%
    height: 100%
    background: -moz-linear-gradient(left, rgba(32,32,32,0) 0%, rgba(32,32,32,0) 1%, rgba(32,32,32,0) 90%, rgba(32,32,32,1) 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(left, rgba(32,32,32,0) 0%,rgba(32,32,32,0) 1%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to right, rgba(32,32,32,0) 0%,rgba(32,32,32,0) 1%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */

.transparentbottom
    width: 100%
    height: 100%
    background: -moz-linear-gradient(top, rgba(32,32,32,0) 0%, rgba(32,32,32,0) 1%, rgba(32,32,32,0) 90%, rgba(32,32,32,1) 100%)
    background: -webkit-linear-gradient(top, rgba(32,32,32,0) 0%,rgba(32,32,32,0) 1%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%)
    background: linear-gradient(to bottom, rgba(32,32,32,0) 0%,rgba(32,32,32,0) 1%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%)

.transparentsides
    width: 100%
    height: 100%
    background: -moz-linear-gradient(left,  rgba(32,32,32,1) 0%, rgba(32,32,32,0) 10%, rgba(32,32,32,0) 90%, rgba(32,32,32,1) 100%)
    background: -webkit-linear-gradient(left,  rgba(32,32,32,1) 0%,rgba(32,32,32,0) 10%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%)
    background: linear-gradient(to right,  rgba(32,32,32,1) 0%,rgba(32,32,32,0) 10%,rgba(32,32,32,0) 90%,rgba(32,32,32,1) 100%)

.full
    width: 100%
    height: 100%

.navigation
  display: flex
  flex-direction: column
  min-height: 5.8em
  max-width: 100vw

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
    position: fixed
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

.topauth
    max-width: 50%
    padding: 1em
    position: absolute
    top: 0
    right: 0
    cursor: pointer

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

.context
    width: calc(100% - 14em)
    margin: 0 auto
    align-self: flex-end

.fl
    float: left

.fr
    float: right
    width: 7em

.pushdown
    margin-top: auto

.loadingscreen
    position: fixed
    left: 50%
    top: 32%
    transform: translateX(-50%)
    z-index: 9002
    padding: 0.5em
    background-color: rgba(22, 22, 22, 0.8)
    text-align: center
    border-radius: 0.5em

.btcspot , .satspot
    position: absolute
    top: 0
    z-index: 11
    padding: 1em

@media (max-width: breakpoint)
    .btcspot , .satspot
        display: none

.btcspot
    right: 111px

.satspot
    left: 111px

.logout
    position: fixed
    right: 1em
    bottom: 1em
    color: teal
    font-size: 1.3em
    font-weight: bold
    cursor: pointer

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
    
.bigger
    width: 8em
</style>
