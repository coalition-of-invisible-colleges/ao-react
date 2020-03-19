<template lang="pug">

.upgrades
    projects
    div(v-if='$store.getters.contextMember')
        div(v-for='n in $store.getters.contextCard.deck' )
            current(:memberId='n')
            //- coin(:b='$store.getters.hashMap[n]') XXX absolute wrong place
    div(v-else)
      div(v-for='n in $store.getters.contextRelevantMembers'   :key='n')
        current-checks(:memberId='n')
</template>

<script>
  import CurrentChecks from "./CurrentChecks";
  import Current from "./Current";
  import Projects from "./Projects";
  import Coin from "./Coin";

  export default {
    components: {
      CurrentChecks,
      Projects,
      Current,
      Coin
    },
    mounted() {
      this.$store.commit("setMode", 2);
      this.$store.commit("setDimension", 0);
      this.$store.dispatch("loaded");
    }
  };
</script>

<style lang="stylus" scoped></style>
