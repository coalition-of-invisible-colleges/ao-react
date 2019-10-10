<template lang='pug'>

.navigation(@contextmenu.prevent)
    .loadingscreen(v-if='$store.state.context.loading')
        h1 loading the {{ $store.state.context.loading }} dimension
    div.ztop(@click='cycleLeft')
        img.bullimgleft(v-if='showImg === "sun"' src="../assets/images/navigas/sunUni.svg")
        img.bullimgleft(v-else-if='uniLeft'  src="../assets/images/navigas/uniSun.svg")
        img.bullimgleft(v-else  src="../assets/images/navigas/uniSunDab.svg")
    div.ztop(@click='cycleRight')
        img.bullimgright(v-if='showImg === "bull"'  src="../assets/images/navigas/bullUni.svg")
        img.bullimgright(v-else-if='uniRight'  src="../assets/images/navigas/uniBull.svg")
        img.bullimgright(v-else  src="../assets/images/navigas/uniBullDab.svg")
    button.modeleft(v-if='$store.state.upgrades.mode || !$store.getters.isLoggedIn'  id='helmleft'  :class='{ boat : $store.state.upgrades.mode === "badge" }')
        img.upg(v-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/boatblack.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/badge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/bounty.svg')
        img.upg.timecube(v-else-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/buddadoge.svg')
    button.topcenter(:class='{ closed : !$store.state.upgrades.mode && $store.getters.isLoggedIn }' id='helm')
        .full
            img.upg(v-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/boatblack.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/badge.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/bounty.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/timecube.svg')
            img.upg(v-else  src='../assets/images/buddadoge.svg')
    button.moderight(v-if='$store.state.upgrades.mode || !$store.getters.isLoggedIn' id='helmright')
        img.upg(v-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/buddadoge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/badge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/bounty.svg')
        img.upg.timecube(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/timecube.svg')
    .pushdown
    div(:class='{suncontext: isSun(), bullcontext: isBull()}' @keydown.tab='nextUpgradeMode' /* @keydown.shift.tab='previousUpgradeMode'  @keyup.preventDefault */)
        .transparentsides
    template(v-if='showImg === "uni"'  v-for='(n, i) in $store.state.context.parent')
        div(@click='goToParent(n)')
            context(:taskId='n'  :style="{ width: 'calc(100% - 14em - ' + ($store.state.context.parent.length - 1 - (i * 0.5)) + 'em)' }")
    .small.always.left
        .tooltip
            img.doge(v-if='!barking'  src='../assets/images/doge_faded.png'  id='dogecomm'  :class='{ red : $store.state.loader.connected == "disconnected" }')
            img.doge.flip(v-else  src='../assets/images/bark.png'  id='dogecomm'  :class='{ red : $store.state.loader.connected == "disconnected" }')
            .tooltiptext.right
                p {{ $store.state.cash.alias }}
                p
                    span.dot.redwx(v-if="$store.state.loader.connected == 'disconnected'")
                    span.dot.yellowwx(v-else-if="$store.state.loader.connected == 'connecting'")
                    span.dot.greenwx(v-else-if="$store.state.loader.connected == 'connected'")
                    span.dot.purplewx(v-else="$store.state.loader.connectionError")
                    span(v-if="$store.state.loader.connected == 'connecting'") connecting
                    span(v-else-if="$store.state.loader.connected == 'connected'") connected
                    span(v-else-if="$store.state.loader.connected == 'disconnected'") disconnected
                    span.pong ({{ $store.state.loader.lastPing }} ms pong)
                p(v-if="$store.state.loader.connectionError") {{ $store.state.loader.connectionError }}
                p(v-if="$store.state.loader.pendingRequests.length > 0") - {{ $store.state.loader.pendingRequests.length }} pending : {{ $store.state.loader.pendingRequests }}
        .wowdar
            .ringbase.ring1
            .ringbase.ring2
            .pulse
            .pointer
                .div
            .ping.pos1
            .ping.pos2
        .ringbase.ring3.big(:class='{ showping : pinging }')
    task-create.always
</template>

<script>

import Auth from './Auth'
import calculations from '../calculations'
import CardPanel from './Deck/CardPanel'
import FancyInput from './slotUtils/FancyInput'
import Context from './Deck/Context'
import TaskCreate from './forms/TaskCreate'
import SoundFX from '../modules/sounds'

export default {
    name: 'navigation',
    components: { Auth, CardPanel, FancyInput, Context, TaskCreate },
    props: ['barking', 'pinging'],
    computed: {

    },
    mounted() {
        this.setToRoute()

        // helm gestures
        let el = document.getElementById('helm')
        let mc = new Hammer.Manager(el)

        let Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            this.flashHelm()
            this.previousUpgradeMode()
        })

        mc.on('swiperight', (e) => {
            this.flashHelm()
            this.nextUpgradeMode()
        })

        mc.on('swipeup', (e) => {
            this.flashHelm()
            this.closeUpgrades()
        })

        mc.on('swipedown', (e) => {
            this.flashHelm()
            this.nextUpgradeMode()
        })

        let Press = new Hammer.Press({
          time: 400
        })
        mc.add(Press)
        mc.on('press', (e) => {
            if(this.$router.currentRoute.path === '/front'){
                if(!this.$store.state.upgrades.mode) {
                    SoundFX.playPortalBlocked()
                    this.flashHelm(5)
                } else {
                    this.flashHelm(2)
                    SoundFX.playPortalTransit()
                    this.closeUpgrades()
                }
            } else {
                this.flashHelm(2)

                this.$router.push('/front/doge')
            }
        })

        let Tap = new Hammer.Tap({ time: 400 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            this.flashHelm(0.5)
            if (!this.$store.state.upgrades.mode){
                this.setMode(0)
            } else {
                this.nextUpgradeMode()
            }
        })

        // helm left and right icon gestures
        let lel = document.getElementById('helmright')
        let lmc = new Hammer.Manager(lel)

        let Tap2 = new Hammer.Tap({ time: 400 })
        lmc.add(Tap2)
        lmc.on('tap', (e) => {
            this.flashHelm(0.5)
            this.nextUpgradeMode()
        })

        let rel = document.getElementById('helmleft')
        let rmc = new Hammer.Manager(rel)

        let Tap3 = new Hammer.Tap({ time: 400 })
        rmc.add(Tap3)
        rmc.on('tap', (e) => {
            this.flashHelm(0.5)
            this.previousUpgradeMode()
        })

        // doge wowdar gestures
        let dogeel = document.getElementById('dogecomm')
        let dogemc = new Hammer.Manager(dogeel)

        let Press2 = new Hammer.Press({
          time: 800
        })
        dogemc.add(Press2)
        dogemc.on('press', (e) => {
            SoundFX.playBarkPing()
            console.log("pre barking is ", this.barking)
            this.barking = true
            this.pinging = true
            console.log("post barking is ", this.barking)
            setTimeout(()=> {
                this.barking = false
                console.log("postpost barking is ", this.barking)
            }, 1000)
            setTimeout(()=> {
                this.pinging = false
                console.log("postpost barking is ", this.barking)
            }, 2000)
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
            uniRight: false
        }
    },
    methods: {
        isSun(){
            let mainroute = this.$router.currentRoute.path.split('/')[1]
            return mainroute === "front"
        },
        isBull(){
            let mainroute = this.$router.currentRoute.path.split('/')[1]
            return mainroute === "dash"
        },
        killSession(){
            console.log("kill Session called")
            this.$store.dispatch("makeEvent", {
                type: "session-killed",
                session: this.$store.state.loader.session
            })
            setTimeout(()=>{
                this.$store.dispatch("loadCurrent")
            }, 999)

        },
        goToParent(target){
            console.log("go to parent called")
            console.log("target is ", target)
            this.$store.dispatch("goUp", {
                target,
                panel: [target],
                top: 0
            })
            if(target === this.$store.getters.member.memberId) {
                target = "/deck"
            } else {
                target = "/task/" + target
            }
            this.$router.push(target)
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
            this.$router.push('/dash/ '  + this.$store.state.upgrades.mode)
            setTimeout(() => {
                this.setToRoute()
                this.uniRight = !this.uniRight
            }, 20)
        },
        setToRoute() {
            let mainroute = this.$router.currentRoute.path.split('/')[1]
            console.log({mainroute})
            switch (mainroute){
              case "front": return this.showImg = "sun"
              case "dash": return this.showImg = "bull"
              default: return this.showImg = "uni"
            }
        },
        toggleShowBtc() {
            this.showBtc = !this.showBtc
        },
        setMode(index) {
            SoundFX.playCaChunk()
            this.$store.commit("setMode", index)
        },
        nextUpgradeMode() {
            SoundFX.playCaChunk()
            this.$store.commit("nextMode")
            //  only on sun
            if (this.isSun()){
                return this.$router.push('/front/' + this.$store.state.upgrades.mode)
            }
            this.$router.push('/' + this.$store.state.upgrades.mode)
        },
        previousUpgradeMode() {
            SoundFX.playCaChunk()
            this.$store.commit("previousMode")
            if (this.isSun()){
                return this.$router.push('/front/' + this.$store.state.upgrades.mode)
            }
            this.$router.push('/' + this.$store.state.upgrades.mode)
        },
        closeUpgrades() {
            this.$store.commit("closeUpgrades")
        },
        flashHelm(flashes = 1) {
            let ms = 350
            let helm = document.getElementById('helm')
            let addedClasses = ' flash'
            if(flashes < 1) {
                addedClasses += ' half'
                ms *= 0.7
            } else if(flashes === 2) {
                addedClasses += ' twice'
                ms *= flashes
            } else if(flashes === 5) {
                addedClasses += ' five'
                ms *= flashes
            }

            helm.className += addedClasses
            setTimeout( () => { helm.className = helm.className.replace(addedClasses, '') }, ms)
        }
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

li
    color: accent2

.p
    color: white
    text-align: center
    padding: 1em

hr
    color: lightteal

.bullimgleft
    width: 7em
    cursor: pointer
    // float: left
    flex-direction: column
    display: flex
    position: absolute
    left: 0
    top: 0

.bullimgright
    width: 7em
    cursor: pointer
    // float: left
    flex-direction: column
    display: flex
    position: absolute
    right: 0
    top: 0

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

#createtask.always
    position: fixed
    bottom: 0
    left: 50%
    transform: translateX(-50%)
    z-index: 149

.small.always.left
    position: fixed
    bottom: 0
    left: 0
    margin-left: 0.5em
    margin-bottom: 0.3em
    z-index: 151

.tooltiptext.right
    font-size: 1.5em
    height: fit-content
    width: fit-content
    position: fixed
    bottom: 3.85em
    top: initial
    left: 0.5em
    z-index: 149
    padding: 0 1em 1em 1em

.ztop
    z-index: 152

body {
  background-color: #333
  padding: 50px
}

.wowdar
  float:left
  position:relative
  width:70px
  height:70px
  background-size: 100% 100%
  border-radius:35px
  box-shadow:0 1px 1px 0 rgba(0,0,0,0.4), 0 0 4px 1px rgba(0,0,0,0.2), inset 0 1px 1px 0 rgba(255,255,255,0.2), inset 0 2px 4px 1px rgba(255,255,255,0.1)
  display: none

@keyframes wow
  0% { opacity: 0 }
  100% { opacity: 1 }

.tooltip:hover > .tooltiptext
    animation-name: wow
    animation-duration: 0.5s
    transition-timing-function: ease
    transition-property: opacity

.tooltip:hover+.wowdar
    display: block
    animation-name: wow
    animation-duration: 0.2s
    transition-timing-function: ease
    transition-property: opacity

.pulse
  position:absolute
  top:0
  left:0
  width:70px
  height:70px
  border-radius:35px
  background:#dcf48a
  -moz-animation: pulsating 2s ease-in-out
  -moz-animation-iteration-count: infinite
  -webkit-animation: pulsating 2s ease-in-out
  -webkit-animation-iteration-count: infinite
  opacity:0.0
  z-index:5

.ringbase {
  position:absolute
  top:0
  left:0
  width:70px
  height:70px
  border-radius:35px
  opacity:0.0
  z-index:10
}

.ring1 {
  box-shadow:0 0 2px 1px #8eb716, inset 0 0 2px 1px #00f400
  -moz-animation: ring 2s ease-in-out
  -moz-animation-iteration-count: infinite
  -webkit-animation: ring 2s ease-in-out
  -webkit-animation-iteration-count: infinite
  animation: ring 2s ease-in-out
  animation-iteration-count: infinite
}

.ring2 {
  box-shadow:0 0 1px 0px #cbe572, inset 0 0 1px 0px #00f400
  -moz-animation: ring 2s ease-in-out
  -moz-animation-iteration-count: infinite
  -moz-animation-delay: 0.5s
  -webkit-animation: ring 2s ease-in-out
  -webkit-animation-iteration-count: infinite
  -webkit-animation-delay: 0.5s
  animation: ring 2s ease-in-out
  animation-iteration-count: infinite
  animation-delay: 0.5s
}

.ring3 {
  box-shadow:0 0 3px 0px #cbe572, inset 0 0 1px 0px #cbe572
  -moz-animation: ring 1.5s ease-in-out
  -moz-animation-iteration-count: infinite
  -moz-animation-delay: 0.5s
  -webkit-animation: ring 1.5s ease-in-out
  -webkit-animation-iteration-count: infinite
  -webkit-animation-delay: 0.5s
  animation: ring 1.5s ease-in-out
  animation-iteration-count: infinite
  animation-delay: 0.5s
  display: block
}

@-webkit-keyframes pulsating {
  0% {opacity: 0.0}
  50% {opacity: 0.2}
  100% {opacity: 0.0}
}

@-moz-keyframes pulsating {
  0% {opacity: 0.0}
  50% {opacity: 0.2}
  100% {opacity: 0.0}
}

@keyframes pulsating {
  0% {opacity: 0.0}
  50% {opacity: 0.2}
  100% {opacity: 0.0}
}

@-webkit-keyframes ring {
  0% {-webkit-transform: scale(0.4, 0.4); opacity: 0.0}
  50% {opacity: 0.6}
  100% {-webkit-transform: scale(1.1, 1.1); opacity: 0.0}
}

@-moz-keyframes ring {
  0% {-moz-transform: scale(0.4, 0.4); opacity: 0.0}
  50% {opacity: 0.6}
  100% {-moz-transform: scale(1.1, 1.1); opacity: 0.0}
}

@keyframes ring {
  0% {transform: scale(0.4, 0.4); opacity: 0.0}
  50% {opacity: 0.6}
  100% {transform: scale(1.1, 1.1); opacity: 0.0}
}


.pointer {
  position: absolute
  width: 70px
  top: 35px
  -webkit-animation: circling 2s linear
  -webkit-animation-iteration-count: infinite
  -moz-animation: circling 2s linear
  -moz-animation-iteration-count: infinite
  animation: circling 2s linear
  animation-iteration-count: infinite
  z-index: 20
}

.pointer div {
  width: 49%
  border-bottom:2px solid #00f400
}

.ping {
  opacity: 0
  border: 3px solid #e0f400
  border-radius: 100%
  position:absolute
  -webkit-animation: blink 2s ease-out
  -webkit-animation-iteration-count: infinite
  -moz-animation: blink 2s ease-out
  -moz-animation-iteration-count: infinite
  animation: blink 2s ease-out
  animation-iteration-count: infinite
  z-index: 25
}

.ping.pos1 {
  left:10px
  top:38px
}

.ping.pos2 {
  left:40px
  top:18px
  -webkit-animation-delay: 0.6s
  -moz-animation-delay: 0.6s
  animation-delay: 0.6s
}

@-webkit-keyframes circling {
  0% {-webkit-transform: rotate(0deg)}
  50% {-webkit-transform: rotate(180deg)}
  100% {-webkit-transform: rotate(360deg)}
}

@-moz-keyframes circling {
  0% {-moz-transform: rotate(0deg)}
  50% {-moz-transform: rotate(180deg)}
  100% {-moz-transform: rotate(360deg)}
}

@keyframes circling {
  0% {transform: rotate(0deg)}
  50% {transform: rotate(180deg)}
  100% {transform: rotate(360deg)}
}

@-webkit-keyframes blink {
  0% { opacity: 1 }
  100% { opacity: 0 }
}

@-moz-keyframes blink {
  0% { opacity: 1 }
  100% { opacity: 0 }
}

@keyframes blink {
  0% { opacity: 1 }
  100% { opacity: 0 }
}

.doge
    left: 25px
    bottom: 23px
    position: fixed
    opacity: 0.5
    height: 35px
    width: 35px
    cursor: pointer
    z-index: 9001

.doge.red
    filter: hue-rotate(30deg)

.big
    position: fixed
    left: -85%
    bottom: 27px
    width: 2000px
    height: 2000px
    border-radius: 50%
    display: none

.showping
    display: block

.flip
    transform: scaleX(-1)

.pong
    margin-left: 0.25em

.loadingscreen
    position: fixed
    left: 0
    top: 0
    width: 100vw
    height: 100vh
    background-color: rgba(22, 22, 22, 0.5)
    z-index: 9002
</style>
