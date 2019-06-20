<template lang='pug'>

#archive
    .row.shipwrapper
        .shipbackground
        h1 rollsafe membrane
        p abandoned cards, purge if compeled
        panels(:c='$store.getters.eternalVoid')
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

h1, p
    text-align: center
    opacity: 0.5
    color: purple

.floater
    position: relative;
    top: 0
    left: 0
    width: 100%
    min-height: 500px

.shipwrapper
    position: relative

.shipbackground
    background-image: url('../../assets/images/archive.svg')
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
