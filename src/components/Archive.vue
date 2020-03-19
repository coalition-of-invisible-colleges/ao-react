<template lang="pug">

#archive
    .row.shipwrapper
        .shipbackground
        gen-panels(:c='archive')
</template>

<script>
  import GenPanels from "./GenPanels";

  export default {
    data() {
      let hodld = [];
      this.$store.state.tasks.forEach(t => {
        if (t.deck.indexOf(this.$store.getters.member.memberId) > -1) {
          hodld.push(t);
        }
      });
      let crawler = [this.$store.getters.memberCard.taskId].concat(
        this.$store.getters.myGuilds.map(t => t.taskId)
      );
      let deck = [];
      let history = [];
      let newCards = [];
      do {
        newCards = [];
        crawler = _.filter(crawler, t => {
          if (deck.concat(history).indexOf(t) > -1) return false;
          let task = this.$store.getters.hashMap[t];
          if (
            task === undefined ||
            task.subTasks === undefined ||
            task.priorities === undefined ||
            task.completed === undefined
          )
            return false;

          if (task.deck.indexOf(this.$store.getters.member.memberId) > -1) {
            deck.push(t);
          } else {
            history.push(t);
          }
          newCards = newCards
            .concat(task.subTasks)
            .concat(task.priorities)
            .concat(task.completed);
          return true;
        });
        crawler = newCards;
      } while (crawler.length > 0);
      let archive = _.filter(hodld, st => deck.indexOf(st.taskId) === -1);
      archive = _.filter(
        archive,
        st =>
          !archive.some(
            t =>
              t.subTasks
                .concat(t.priorities)
                .concat(t.completed)
                .indexOf(st.taskId) > -1
          )
      );
      return { archive };
    },
    components: {
      GenPanels
    },
    mounted() {
      this.$store.dispatch("loaded");
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.clearContext();
      });
    },
    methods: {
      clearContext() {
        this.$store.commit("setPanel", [this.$store.getters.member.memberId]);
        this.$store.commit("setTop", 0);
        this.$store.commit("setParent", []);
      }
    }
  };
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'
  @import '../styles/skeleton'
  @import '../styles/button'

  #archive
      width: 100%

  .shipwrapper
      position: relative
      min-height: 76vh

  .shipbackground
      background-repeat: no-repeat
      background-position: center center
      background-size: contain
      opacity: 0.2
      top: 0
      left: 0
      bottom: 0
      right: 0
      position: absolute
      z-index: -1
      width: 100%
      height: 100%
</style>
