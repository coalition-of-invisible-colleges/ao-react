<template lang='pug'>

div
    div(:id='id')
        slot
    //- div(:id='pId')
    //-     p test


</template>

<script>
// import Popper from 'popper.js'
import Tooltip from 'tooltip.js'
import uuidv1 from 'uuid/v1'

export default {
    props: ['notes'],
    data(){
        return {
            id: uuidv1(),
            pId: uuidv1()
        }
    },
    mounted(){
      var reference = document.getElementById(this.id);
      var tooltip = new Tooltip(reference, {
          title: this.notes
      })
    }
}
</script>

<style lang="stylus" scoped>



</style>
