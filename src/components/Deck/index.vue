<template lang='pug'>

#deck
    hyper-deck
        router-view
    div
      router-link(to='/archive', @click='sink')
          img.sunkenship(src='../../assets/images/sunken_ship.png')
</template>

<script>

import HyperDeck from './HyperDeck'
import GiftBox from './GiftBox.vue'
import SoundFX from '../../utils/sounds'

export default {
  components:{
      HyperDeck,
      GiftBox,
  },
  mounted() {
      this.$store.commit('stopLoading')
  },
  methods: {
      sink() {
          window.scrollTo(0, 0)
          SoundFX.playBoatCapsize()
      }
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/button'

#deck
    min-width: 100%

.shadow
    box-shadow: -7px -7px 7px 1px rgba(21, 21, 21, 0.5)

.floater
    position: relative;
    top: 0
    left: 0
    min-height: 500px

.sunkenship
    opacity: 0.5
    max-width: 100%

.up
  width: fit-content
  margin: -1.25em auto 0em auto
  padding: 0
  z-index: 80

.white
  color: white
</style>
