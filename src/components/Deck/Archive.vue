<template lang='pug'>

#archive
    .row.shipwrapper
        .shipbackground
        gen-panels(:c='$store.getters.archive')
</template>

<script>

import GenPanels from './GenPanels'

export default {
  components:{
      GenPanels,
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
        vm.clearContext()
    })
  },
  methods: {
      clearContext(){
          this.$store.commit("setPanel", [this.$store.getters.member.memberId])
          this.$store.commit("setTop", 0)
          this.$store.commit("setParent", [])
      },
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

#archive
    width: 100%

.floater
    position: relative;
    top: 0
    left: 0
    width: 100%
    min-height: 500px

.shipwrapper
    position: relative

.shipbackground
    background-image: url('../../assets/images/sunken_ship.png')
    background-repeat: no-repeat
    background-position: center center
    background-size: contain
    opacity: 0.2
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    z-index: -1
    width: 100%
    height: 110%
    min-height: 76vh

</style>
