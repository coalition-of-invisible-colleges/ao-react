<template lang="pug">

.modal(v-show='visible', @click='close')
  .modal-content(v-bind:class='contentClass', @click.stop='')
      a(href="#" class="modal__close-btn" @click.prevent='close') X
      slot

</template>

<script>
export default {
  props: ['visible', 'close', 'sm'],
  computed: {
    contentClass(){
      if (this.sm){
        return {
          "content--sm": true
        }
      }
      return {}
    }
  }
}
</script>

<style lang='stylus' scoped>
@import '../../styles/breakpoints'
@import '../../styles/colours'

.modal {
    display: block; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1000; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgba(94,171,152,.3)  /* Fallback color */
  }

.modal-content {
    position:absolute
    width:(100/3)%
    left:(100/3)%
    top:100px
    background-color: main;
    padding: 25px;
}

.modal__close-btn {
  line-height: 0;
  float: right;
  margin-left: 1rem;
  font-size: 12px;
  text-decoration: none;
  padding: 1.25rem 0.75rem;
  margin-top: 0.5rem;
}

@media (min-width: smBreakpoint) {

  .content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    width: minBreakpoint;
    height: auto;
    min-height: 0;
    background: main
    border-style:solid
    border-width:4px
    border-color:teal
  }

  .content.content--sm {
    height: 65rem;
    max-height: 75%;
    overflow: auto;
  }

  .content.content--md {
    margin: 5% auto;
    width: 85%;
  }
}

@media (min-width: mdBreakpoint) {
  .content.content--sm {
    width: 60rem;
  }
}

a
  color:teal

</style>
