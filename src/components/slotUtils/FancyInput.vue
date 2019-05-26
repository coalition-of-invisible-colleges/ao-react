<template lang='pug'>

div.input-container
  slot
  label(v-bind:for='gen') {{labelText}}
  span.focus-border

</template>

<script>

import uuidV1 from 'uuid/v1'

export default {
    data(){
      return {
        gen: uuidV1()
      }
    },
    props: ['labelText']
}


</script>

<style lang='stylus' scoped>

@import '../../styles/colours';


</style>
