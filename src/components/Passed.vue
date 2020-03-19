<template lang="pug">

div.totop(v-if='b.passed.length > 0')
    div(@click='toggleBird')
        .singlebird(v-if='!$store.state.upgrades.bird')
            .row.pad.centered
                img.send(src='../assets/images/send.svg')
                span {{ b.passed.length}}
        template(v-else  v-for='n in b.passed'  @click='toggleBird')
            .row.pad.centered
                current(:memberId='n[0]')
                img.send(src='../assets/images/send.svg')
                current(:memberId='n[1]')
</template>

<script>
  import request from "superagent";
  import Current from "./Current";

  export default {
    props: ["b"],
    components: { Current },
    methods: {
      toggleBird() {
        this.$store.commit("toggleBird");
      }
    },
    computed: {
      toMe() {
        let m = [];
        if (this.b && this.b.passed.length > 0) {
          m = this.b.passed.filter(
            p => p[1] === this.$store.getters.member.memberId
          );
        }
        return m;
      }
    }
  };
</script>

<style lang="stylus" scoped>

  @import '../styles/grid';
  @import '../styles/colours';

  .row
      width: 100%

  .send
      height: 1.5em

  .accept, .dontaccept
      width: 100%
      background: accent5
      padding: .789em
      border-style: none
      img
          background: white
          padding: .1em
          border-radius: 3px

  .arrow
      height: 3.35em

  .fl
      float: left
  .fr
      float: right

  .totop
      z-index: 1000

  .pad
      margin-top: 1em
      margin-bottom: 1em

  .centered
      text-align: center
</style>
