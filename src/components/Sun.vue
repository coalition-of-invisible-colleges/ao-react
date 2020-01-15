<template lang='pug'>
div
  img.l(src="../assets/images/navigas/sun.svg"  ref='sun'  :class='{ bigger : isSun() }')
  //- .tooltiptext.left(v-if='$store.getters.member.muted')
  //-     h2.leftalign Sun Pages:
  //-     ul
  //-         li(:class='{ dabstination : $store.state.upgrades.mode === "doge" }')
  //-             img.lil(src='../assets/images/buddadoge.svg')
  //-             span Oracle *
  //-         li(:class='{ dabstination : $store.state.upgrades.mode === "boat" }')
  //-             img.lil(src='../assets/images/boatblack.svg')
  //-             span Top Missions **
  //-         li(:class='{ dabstination : $store.state.upgrades.mode === "badge" }')
  //-             img.lil(src='../assets/images/badge.svg')
  //-             span Recent ***
  //-         li(:class='{ dabstination : $store.state.upgrades.mode === "chest" }')
  //-             img.lil(src='../assets/images/bounty.svg')
  //-             span Bounties ****
  //-         li(:class='{ dabstination : $store.state.upgrades.mode === "timecube" }')
  //-             img.lil(src='../assets/images/timecube.svg')
  //-             span Calendar *****
  //-     p once to advance or multiclick to a specific page
</template>

<script>
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import SoundFX from '../utils/sounds'
import Dimensions from '../utils/dimensions'

export default {
  methods: {
    isSun() {
        return Dimensions.isSun(this.$router.currentRoute.path)
    },
    nextMode() {
        SoundFX.playCaChunk()
        this.$store.commit('nextMode')
    },
    goFront(mode) {
        if(!mode) {
            mode = this.$store.state.upgrades.mode
        }
        this.$store.commit('startLoading', 'sun-' + mode)
        SoundFX.playCaChunk()
        this.$router.push('/front/' + mode)
    },
  },
  components:{},
  mounted(){
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
  }
}

</script>

<style lang='stylus' scoped>

.l
    position: fixed
    top: 0
    cursor: pointer
    z-index: 152
    height: 3.5555555555em
    left: 0

</style>
