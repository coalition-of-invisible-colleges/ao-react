<template lang='pug'>

#giftbox
    img.fw(src='../assets/images/pins.svg')
    img.gift(src='../assets/images/gifts.svg')
    span Gifts
    card-panel(:c="$store.getters.inbox")
    img.fw(src='../assets/images/pins.svg')
</template>

<script>

import Hypercard from "./Card"
import CardPanel from './CardPanel'

export default {
  components:{
      Hypercard,
      CardPanel,
  },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'

#giftbox
    width: 100%

.fw
    width: 100%
    height: auto

.gift
    display: inline
    height: 5em
    clear: none

span
    font-size: 1.321em
    padding: .5em

</style>
