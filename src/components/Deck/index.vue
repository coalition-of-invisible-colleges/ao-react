<template lang='pug'>

#deck()
    .shadow
      hyper-deck
          router-view
    .row
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
@import '../../styles/skeleton'
@import '../../styles/button'

#deck
    width: 100%

.row.shadow
    box-shadow: -7px -7px 7px 1px rgba(21, 21, 21, 0.5)

.floater
    position: relative;
    top: 0
    left: 0
    width: 100%
    min-height: 500px

.sunkenship
    width: 22em
    opacity: 0.5
    margin: 16em calc(50% - 11em) 4em calc(50% - 11em)

.up
  width: fit-content
  margin: -1.25em auto 0em auto
  padding: 0
  z-index: 80

.white
  color: white
</style>
