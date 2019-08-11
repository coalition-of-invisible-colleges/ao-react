<template lang='pug'>

#archive
    .row.shipwrapper
        .shipbackground
        h3 {{$store.getters.member.name}} Archive
        panels(:c='$store.getters.archive')
</template>

<script>

import Panels from './Panels'

export default {
  components:{
      Panels,
  },
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
    height: 100%
    min-height: 99vh

</style>
