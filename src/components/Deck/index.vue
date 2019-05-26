<template lang='pug'>

#deck
    .row
        .four.columns(v-if='$store.getters.inbox.length > 0')
            gift-box
        .columns(:class='{eight: $store.getters.inbox.length > 0}')
            hyper-deck(:taskId="membersTaskId")
    .row
        router-link(to='/archive', @click='toTop')
            img.sunkenship(src='../../assets/images/sunken_ship.png')

</template>

<script>

import HyperDeck from './HyperDeck'
import GiftBox from './GiftBox.vue'

export default {
  components:{
      HyperDeck,
      GiftBox,
  },
  methods: {
      getName(taskId){
          let name
          this.$store.state.tasks.some(t => {
              if (taskId === t.taskId){
                  name = t.name
                  return true // ???
              }
          })
          return name
      },
      toTop(){
            window.scrollTo(0, 0)
      },
  },
  computed: {
      membersTaskId(){
          let taskId
          this.$store.getters.memberCards.some(c => {
              if (c.name === this.$store.getters.member.memberId){
                  taskId = c.taskId
                  return true
              }
          })

          return taskId
      }
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

#deck
    width: 100%

.floater
    position: relative;
    top: 0
    left: 0
    width: 100%
    min-height: 500px

.sunkenship
    width: 22em
    opacity: 0.3
    margin: 16em calc(50% - 11em) 0 calc(50% - 11em)

</style>
