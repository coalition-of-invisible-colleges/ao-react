<template lang='pug'>

#deck()
    h1.up.white(v-if='$router.currentRoute.path.trim() == "/deck"') deck
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
      setDeck() {
          if (!this.$store.getters.isLoggedIn && this.$store.getters.pubguildIds.length > 0){
              console.log('setting for offline deck')
              this.$store.commit("setPanel", this.$store.getters.pubguildIds)
              this.$store.commit("setTop", 0)
              this.$store.commit("setParent", [])
              return
          }
          if (this.$store.getters.member.memberId){
              this.$store.commit("setPanel", [this.$store.getters.member.memberId])
              this.$store.commit("setTop", 0)
              this.$store.commit("setParent", [])
              return
          }

          console.log("setdeck dnn set")
          setTimeout( this.setDeck, 111 )
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

.up
  width: fit-content
  margin: -1.25em auto 0em auto
  padding: 0
  z-index: 80
  
.white
  color: white
</style>
