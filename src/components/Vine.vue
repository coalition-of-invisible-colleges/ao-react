<template lang="pug">

.vine(v-if='b.taskId !== $store.getters.contextCard.taskId'  @click='goIn')
    img.viney(src='../assets/images/orb.svg')
</template>

<script>
  export default {
    props: ['b'],
    methods: {
      goIn() {
        let panel = this.c
        if (panel && panel.length && panel.length > 0) {
        } else {
          panel = [this.b.taskId]
        }

        let top = panel.indexOf(this.b.taskId)

        if (top > -1) {
        } else {
          top = 0
        }

        let parents = []

        if (this.$store.state.context.panel[this.$store.state.context.top]) {
          parents.push(this.$store.getters.contextCard.taskId)
        }

        if (this.inId && parents.indexOf(this.inId) < 0) {
          parents.push(this.inId)
        }

        this.$store.dispatch('goIn', {
          parents,
          top,
          panel
        })

        if (
          this.$store.state.upgrades.mode === 'doge' &&
          this.$store.getters.contextCard.priorities.length > 0
        ) {
          this.$store.commit('setMode', 1)
        }
        if (this.$store.state.upgrades.dimension !== 'unicorn') {
          this.$router.push('/' + this.$store.state.upgrades.mode)
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>

  @import '../styles/colours';
  @import '../styles/skeleton';
  @import '../styles/grid';
  @import '../styles/button';

  .vine, a, div
      width: 100%

  .count
      float: right

  .activated
      border-style: solid
      border-width: thick
      border-color: white

  .upgrade
      height: 3em

  .task
      color: white
      margin:10px 0
      padding:20px

  .row
      width: 100%
      .mainColumn
        width:calc(100% - 75px - 4%)
      .secondaryColumn
        width:75px
        button
          height:75px

  .btn
      width:100%
      margin-top: 2em
      max-height: 3em

  select
      background-color: lightteal

  select.form-control
      color: black

  .curs
      cursor: pointer;

  label
      color: black
      text-align: center
      padding: 0
      margin-bottom: -50px

  .viney
      height: 1.3em
      position: absolute
      bottom: 0.5em
      right: 0.5em
      cursor: pointer
      opacity: 0.8321
</style>
