<template lang='pug'>

#frontcalendar
    h1 Upcoming
    calendar(inId='g')
</template>

<script>

import Calendar from './Calendar'

export default {
  mounted(){
      this.$store.commit('setMode' , 4)
      this.$store.commit('setDimension' , 1)
      this.$store.commit('stopLoading')
  },
  components:{
      Calendar,
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/title'

h1
    color: yellow

</style>
