<template lang="pug">

.upgrades
    task-calendar(:inId='$store.getters.contextCard.taskId')
    .gui(v-if='calcTime') {{ calcTime.slice(0,24) }}
    resource-book(:tId='$store.getters.contextCard.taskId')
</template>

<script>
  import calcs from '../calculations'
  import TaskCalendar from './Calendar'
  import ResourceBook from './ResourceBook'

  export default {
    mounted() {
      this.$store.commit('setMode', 4)
      this.$store.commit('setDimension', 0)
      this.$store.dispatch('loaded')
    },
    components: {
      ResourceBook,
      TaskCalendar
    },
    computed: {
      calcTime() {
        if (this.$store.getters.contextCard.book.startTs) {
          let now = new Date(this.$store.getters.contextCard.book.startTs)
          return now.toString()
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>

  .upgrades
      width: 100%

  .gui
      font-size: 1.5em
      cursor: pointer
</style>
