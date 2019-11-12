<template lang='pug'>

.navigation(@contextmenu.prevent)
    h1.loadingscreen(v-if='$store.state.context.loading') loading {{ $store.state.context.loading }}
    img.dableft.adjtooltip(v-if='showImg === "sun"' src="../assets/images/navigas/sunUni.svg"  ref='sun')
    img.dableft.adjtooltip(v-else-if='uniLeft'  src="../assets/images/navigas/uniSun.svg"  ref='sun')
    img.dableft.adjtooltip(v-else  src="../assets/images/navigas/uniSunDab.svg"  ref='sun')
    .tooltiptext.left()
        h1(v-if='!isSun()') Dab to Sun
        h1(v-if='isSun()') Dab to Deck (unicorn)
        p.leftalign Sun Pages:
        ul
            li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
                img.lil(src='../assets/images/buddadoge.svg')
                span Newspaper (dab-and-hodl)
            li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
                img.lil(src='../assets/images/boatblack.svg')
                span Top Missions (double dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
                img.lil(src='../assets/images/badge.svg')
                span Much Recent (triple dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
                img.lil(src='../assets/images/bounty.svg')
                span Bounties (4 dabs)
            li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
                img.lil(src='../assets/images/timecube.svg')
                span Calendar (5 dabs)
        p.leftalign dab once to advance
    img.dabright.adjtooltip(v-if='showImg === "bull"'  src="../assets/images/navigas/bullUni.svg"  ref='bull')
    img.dabright.adjtooltip(v-else-if='uniRight'  src="../assets/images/navigas/uniBull.svg"  ref='bull')
    img.dabright.adjtooltip(v-else  src="../assets/images/navigas/uniBullDab.svg"  ref='bull')
    .tooltiptext.right()
        h1(v-if='!isBull()') Dab to Bull
        h1(v-if='isBull()') Dab to Deck (unicorn)
        p.leftalign Bull Pages:
        ul
            li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
                img.lil(src='../assets/images/buddadoge.svg')
                span Controls (dab-and-hodl)
            li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
                img.lil(src='../assets/images/boatblack.svg')
                span Connections (double dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
                img.lil(src='../assets/images/badge.svg')
                span Accounts (triple dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
                img.lil(src='../assets/images/bounty.svg')
                span Lightning (4 dabs)
            li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
                img.lil(src='../assets/images/timecube.svg')
                span Central Reserve (5 dabs)
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
    .tooltiptext.center(:class='{ fix : $store.state.upgrades.mode !== "doge" }')
        h1 Helm
        p Tap or swipe to change mode
        p.leftalign Card Upgrades:
        ul
            li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
                img.lil(src='../assets/images/buddadoge.svg')
                span Home (dab-and-hodl)
            li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
                img.lil(src='../assets/images/boatblack.svg')
                span Priorities (double dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
                img.lil(src='../assets/images/badge.svg')
                span Missions &amp; Checkmarks (triple dab)
            li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
                img.lil(src='../assets/images/bounty.svg')
                span Send Points (4 dabs)
            li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
                img.lil(src='../assets/images/timecube.svg')
                span Book Event (5 dabs)
    button.moderight(v-if='$store.state.upgrades.mode || !$store.getters.isLoggedIn' id='helmright'  @mousedown='shortFlash')
        img.upg(v-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/buddadoge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/badge.svg')
        img.upg(v-else-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/bounty.svg')
        img.upg.timecube(v-else-if='$store.state.upgrades.mode === "chest"'  src='../assets/images/timecube.svg')
    .pushdown
    div(:class='{suncontext: isSun(), bullcontext: isBull()}' @keydown.tab='nextMode' /* @keydown.shift.tab='previousUpgradeMode'  @keyup.preventDefault */)
        .transparentsides
    template(v-if='showImg === "uni"'  v-for='(n, i) in $store.state.context.parent')
        div(@click='goToParent(n)')
            context(:taskId='n'  :style="{ width: 'calc(100% - 14em - ' + ($store.state.context.parent.length - 1 - (i * 0.5)) + 'em)' }")
    .small.always.left
        .tooltip
            img.doge(v-if='$store.getters.member.muted'  src='../assets/images/bread_corgi.png'  id='dogecomm'  :class='{ red : $store.state.loader.connected !== "connected" }')
            img.doge(v-else-if='!barking'  src='../assets/images/doge_faded.png'  id='dogecomm'  :class='{ red : $store.state.loader.connected !== "connected" }')
            img.doge.flip(v-else  src='../assets/images/bark.png'  id='dogecomm'  :class='{ red : $store.state.loader.connected !== "connected" }')
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
        .wowdar(v-if='!$store.getters.member.muted')
            .ringbase.ring1
            .ringbase.ring2
            .pulse
            .pointer
                .div
            .ping.pos1
            .ping.pos2
        .ringbase.ring3.big(:class='{ showping : pinging }')
    task-create.always(v-if='!isSun() && !isBull()')
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
import FancyInput from './slotUtils/FancyInput'
import Context from './Deck/Context'
import TaskCreate from './forms/TaskCreate'
import Dimensions from '../modules/dimensions'
import HelmControl from '../modules/helm'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import SoundFX from '../modules/sounds'

export default {
    name: 'navigation',
    components: { Auth, CardPanel, FancyInput, Context, TaskCreate },
    mounted() {
        this.setToRoute()
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
                if(this.$store.state.upgrades.mode === 'doge') {
                    HelmControl.flashHelm(5)
                    this.goFront('doge')
                } else {
                    HelmControl.flashHelm(2)
                    this.goUni('doge')
                }
            } else {
                HelmControl.flashHelm(2)
                this.goUni('doge')
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

        let dogeel = document.getElementById('dogecomm')
        let dogemc = new Hammer.Manager(dogeel)

        let Press2 = new Hammer.Press({
          time: 800
        })
        dogemc.add(Press2)
        dogemc.on('press', (e) => {
            if(this.$store.getters.member.muted) {
                return
            }
            SoundFX.playBarkPing()
            this.barking = true
            this.pinging = true
            setTimeout(()=> {
                this.barking = false
            }, 1000)
            setTimeout(()=> {
                this.pinging = false
            }, 2000)
        })

        let Tap4 = new Hammer.Tap({ taps: 2, time: 400, interval: 400 })
        dogemc.add(Tap4)
        dogemc.on('tap', (e) => {
            this.toggleMute()
        })

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
                this.goFront(this.$store.state.upgrades.mode)

            } else {
                this.nextMode()
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
            console.log("single click")
            if(!this.isBull()) {
                this.goDash(this.$store.state.upgrades.mode)
            } else {
                this.nextMode()
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
        console.log("checkpoint 4")
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
        goUni(mode) {
            if(Dimensions.isDeck(this.$router, mode)) {
                SoundFX.playPortalBlocked()
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
        goDash(mode) {
            if(Dimensions.isDash(this.$router, mode)) {
                SoundFX.playPortalBlocked()
                return
            }
            if(mode === 'doge') {
                SoundFX.playBullRoar()
            } else {
                SoundFX.playCaChunk()
            }
            this.$store.commit('startLoading', 'bull')
            this.$router.push('/dash/' + mode)
            setTimeout(() => {
                this.setToRoute()
                this.uniRight = !this.uniRight
            }, 20)
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
        toggleMute() {
            if(this.$store.getters.member.muted) {
                this.$store.dispatch("makeEvent", {
                    type: "doge-unmuted",
                    memberId: this.$store.getters.member.memberId
                })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: "doge-muted",
                    memberId: this.$store.getters.member.memberId
                })
            }
        },
        killSession(){
          //XXX TODO tell server to remove session
          this.$store.dispatch("makeEvent", {
              type: "session-killed",
              session: this.$store.state.loader.session
          })

          window.localStorage.removeItem("token")
          window.localStorage.removeItem("session")
          this.$store.commit('setAuth', {
              token: '', session: ''
          })
        },
        isSun() {
            return Dimensions.isSun(this.$router)
        },
        isBull() {
            return Dimensions.isBull(this.$router)
        },
        isUni() {
            return Dimensions.isUni(this.$router)
        },
        shortFlash() {
            HelmControl.flashHelm(0.5)
        },
        nextMode() {
            SoundFX.playCaChunk()
            HelmControl.nextUpgradeMode(this.$router)
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

body
  background-color: #333
  padding: 50px

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
    filter: hue-rotate(-38deg)
    transform: scaleX(-1)

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

.tooltiptext .leftalign
    text-align: left

.tooltiptext ul, .tooltiptext li
    text-align: left
    list-style-type: none
    position: relative

.tooltiptext li
    padding-left: 0.5em
    margin-left: 1em

.tooltiptext h1
    margin-top: 0
    margin-bottom: 0
    font-size: 1.1em
    font-weight: bold

.tooltiptext.center.fix
    position: fixed
</style>
