<template lang="pug">

.arrow_box
  h5 test
  p testing 123

</template>

<script>
// TODO: details popup

  export default {
    data(){
      return {
        x:'sparta'
      }
    }
  }
</script>

<style lang='stylus' scoped>
@import "../../../styles/colours";

.arrow_box
  padding: 1em
  position: absolute
  bottom: 280%
  display: block
  background-color: main
  color: white
  height: auto

.arrow_box:after, .arrow_box:before
	top: 100%
	left: 50%
	border: solid transparent
	content: " "
	height: 0
	width: 0
	position: absolute
	pointer-events: none

.arrow_box:after
	border-color: rgba(0,0,0,0)
	border-top-color: mainDark
	border-width: 9px
	margin-left: -9px

.arrow_box:before
	border-color: rgba(194, 225, 245, 0)
	border-top-color:  rgba(0, 0, 0, 0)
	border-width: 5px
	margin-left: -5px


</style>
