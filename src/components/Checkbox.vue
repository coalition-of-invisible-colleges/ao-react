<template lang='pug'>
.checkbox(ref='checkbox'  :id='uuid')
    span.checkmark(v-if='isCompleted') ☑
    span.checkmark(v-else) ☐
</template>

<script>

import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import SoundFX from '../utils/sounds'

export default {
    props: ['b', 'inId'],
    data() {
        return {
            uuid:  uuidv1(),
        }
    },
    mounted() {
        let checkel = document.getElementById(this.uuid)
        if(!checkel) return
        let checkmc = Propagating(new Hammer.Manager(checkel))

        let checkTap = new Hammer.Tap({ event: 'singletap', time: 400 })
        let checkDoubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })
        checkmc.add([checkDoubleTap, checkTap])

        checkDoubleTap.recognizeWith(checkTap)
        checkTap.requireFailure(checkDoubleTap)

        checkmc.on('singletap', (e) => {
            console.log("checkbox tap")
            if(!this.isCompleted) {
                this.complete()
            } else {
                this.uncheck()
            }
            e.stopPropagation()
        })

        checkmc.on('doubletap', (e) => {
            e.stopPropagation()
        })
        console.log("checkbox mounted")
    },
    computed: {
        isCompleted(){
            return this.b.claimed.indexOf(this.$store.getters.member.memberId) > -1
        },
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
    }
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.checkbox
    font-size: 1.58em
    // margin-top: -.15em
    margin-bottom: -0.25em
    margin-left: 0.25em
    opacity: 0.5
    cursor: pointer
    color: white
    z-index: 105
    position: absolute
    right: 0.25em
    top: 0.15em
    height: 100%
    display: block
    min-width: 0.75em

.checkmark
    position: relative
    z-index: 106
    height: 100%
    display: block
    min-width: 0.75em
</style>
