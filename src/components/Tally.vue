<template lang="pug">

.tally.tooltip
    img.tallies(v-for='n in b.claimed'  src='../assets/images/mark.svg')
    .tooltiptext(v-if='b.claimed.length >= 1')
        p(v-if='$store.getters.member.muted') completed by:
        current.block(v-for='memberId in b.claimed', :memberId='memberId')
    span.points(v-if='b.completeValue > 0') {{ b.completeValue }}
    img.chest(v-if='b.completeValue > 0'  src='../assets/images/chest.svg')
</template>

<script>
  import Current from './Current'

  export default {
    props: ['b'],
    components: { Current }
  }
</script>

<style lang="stylus" scoped>

  @import '../styles/tooltips'

  .tally
      padding-right: 0.5em
      padding-left: 0.5em
      min-height: 0.1em
      font-size: 1em

  img
      height: 1em
  img.tallies
      position: relative
      bottom: 0
      right: 0

  img.chest
      display: inline

  .block
      display: block
      clear: both

  .points
      position: relative
      top: -0.25em
      margin-right: 0.25em
</style>
