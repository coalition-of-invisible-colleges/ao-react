<template lang='pug'>

form(v-on:submit.prevent.stop="")
    .response(v-if='response')
        div(v-if='showError')
            .three.columns
                img(src='../../assets/images/clippy.svg')
            .nine.columns
                label ERROR: {{ errTxt }}
        .row(v-if='response.type')
    slot(v-else)
    button(v-if='!response' @click.prevent.stop='post') {{ btntxt }}
</template>

<script>
import request from 'superagent'
import _ from 'lodash'

export default {
    data(){
      return {
          response: false,
          memberFob: "",
          showError: false,
          errTxt: '...'
       }
    },
    props: ['event', 'data', 'btntxt'],
    components: { },
    methods: {
      post(){
          this.$store.dispatch("makeEvent", _.clone(this.data))
      },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours';
@import '../../styles/framework';
@import '../../styles/button';

.response
    color: red

form
    padding: 0em
    max-width:400px
    // color: accent1
    //margin: 1em

.small button
    height: 2.4em
    position: relative
    top: -0.1em
</style>
