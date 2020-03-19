<template lang="pug">
.checkbox(ref='checkbox'  :id='uuid')
    img.checkmark(v-if='isCompleted'  src='../assets/images/completed.svg'  draggable='false')
    img.checkmark(v-else  src='../assets/images/uncompleted.svg'  draggable='false')
</template>

<script>
  import uuidv1 from 'uuid/v1'
  import Hammer from 'hammerjs'
  import Propagating from 'propagating-hammerjs'

  export default {
    props: ['b', 'inId'],
    data() {
      return {
        uuid: uuidv1()
      }
    },
    mounted() {
      let checkel = document.getElementById(this.uuid)
      if (!checkel) return
      let checkmc = Propagating(new Hammer.Manager(checkel))

      let checkTap = new Hammer.Tap({ event: 'singletap', time: 400 })
      let checkDoubleTap = new Hammer.Tap({
        event: 'doubletap',
        taps: 2,
        time: 400,
        interval: 400
      })
      checkmc.add([checkDoubleTap, checkTap])

      checkDoubleTap.recognizeWith(checkTap)
      checkTap.requireFailure(checkDoubleTap)

      checkmc.on('singletap', e => {
        if (!this.isCompleted) {
          this.complete()
        } else {
          this.uncheck()
        }
        e.stopPropagation()
      })

      checkmc.on('doubletap', e => {
        e.stopPropagation()
      })
    },
    computed: {
      isCompleted() {
        return this.b.claimed.indexOf(this.$store.getters.member.memberId) > -1
      }
    },
    methods: {
      complete() {
        this.$store.dispatch('makeEvent', {
          type: 'task-claimed',
          inId: this.inId,
          taskId: this.b.taskId,
          memberId: this.$store.getters.member.memberId,
          notes: 'checked by ' + this.$store.getters.member.memberId
        })
      },
      uncheck() {
        this.$store.dispatch('makeEvent', {
          type: 'task-unclaimed',
          taskId: this.b.taskId,
          memberId: this.$store.getters.member.memberId,
          notes: ''
        })
      }
    }
  }
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'

  .checkbox
      opacity: 0.5
      cursor: pointer
      color: white
      z-index: 105
      position: absolute
      right: 0.25em
      top: 0.15em
      display: block
      min-width: 0.75em
      user-drag: none

  img.checkmark
      margin-bottom: -0.25em
      margin-left: 0.25em
      height: 1.58em

  .checkmark
      position: relative
      z-index: 106
      height: 100%
      display: block
      min-width: 0.75em
</style>
