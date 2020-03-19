<template lang="pug">

.vouch(v-if='memberId')
    span.name {{ name }}
</template>

<script>
  export default {
    props: ["memberId", "b", "inId"],
    computed: {
      name() {
        let memberId = this.memberId;
        let name = false;
        this.$store.state.members.forEach(member => {
          if (member.memberId == memberId) {
            name = member.name;
          }
        });
        return name;
      }
    }
  };
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'

  img
      height: 0.7em
      float: left
  .name
      color: white
      margin-right: 1em
      // position: relative
      // top: -0.3em
      // font-size: 1em
</style>
