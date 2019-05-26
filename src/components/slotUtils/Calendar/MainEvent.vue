<template lang="pug">

.event
  img.logo.header-container__block(
    :src='imgUrl'
  )

</template>

<script>
  import Popup from './Popup.vue'
  export default {
    props:['e'],
    computed: {
      imgUrl(){
        return '../assets/images/event-' + this.e.image + '.svg'
      }
    },
  }

</script>

<style lang='stylus' scoped>

img
    float:right
    height:100%
    width:100%


</style>
