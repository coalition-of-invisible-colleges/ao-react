<template lang='pug'>

#wiki
  .grid
    .ten.grid
      dogeboarding
    .two.grid
      p section 1
      p section 2
      p section 3
      p section etc


</template>

<script>

import Dogeboarding from '../Onboarding/Dogeboarding'



export default {
    name: 'navigation',
    components: {Dogeboarding},
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/button'
@import '../../styles/grid'

#wiki
  width:100%


</style>
