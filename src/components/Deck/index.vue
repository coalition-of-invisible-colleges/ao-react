<template lang='pug'>

#deck
    .row
        .four.columns(v-if='$store.getters.inbox.length > 0')
            gift-box
        .columns(:class='{eight: $store.getters.inbox.length > 0}')
            hyper-deck
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
  beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.setDeck()
        })
  },
  methods: {
      setDeck(){
          console.log("deck route handle called")
          this.$store.commit("setPanel", [this.$store.getters.member.memberId])
          this.$store.commit("setTop", 0)
          this.$store.commit("setParent", [])
      },
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
