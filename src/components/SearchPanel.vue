<template lang="pug">
#searchPanel.scrollbarwrapper(v-show='$store.state.upgrades.search.length >= 2 && (matchCards.guilds.length + matchCards.doges.length + matchCards.cards.length) > 0')
    .searchresults
        .result(v-for='t in matchCards.guilds'  @click.stop='debounce(loadResult, 500, [t])'  :class='resultInputSty(t)'  @dblclick.stop='goIn(t.taskId)')
            img.smallguild(src='../assets/images/badge.svg')
            span {{ t.guild }}
            div {{ shortName(t.name) }}
        .result(v-for='t in matchCards.doges'  @click.stop='debounce(loadResult, 500, [t])'  :class='resultInputSty(t)'  @dblclick.stop='goIn(t.taskId)')
            current(:memberId='t.taskId')
        .result(v-for='t in matchCards.cards'  @click.stop='debounce(loadResult, 500, [t])'  :class='resultInputSty(t)'  @dblclick.stop='goIn(t.taskId)') {{ shortName(t.name) }}
</template>

<script>
  import calculations from "../calculations";

  export default {
    props: ["x", "y"],
    data() {
      return {
        searchResults: [],
        exploring: false
      };
    },
    methods: {
      resultInputSty(card) {
        return {
          redtx: card.color == "red",
          bluetx: card.color == "blue",
          greentx: card.color == "green",
          yellowtx: card.color == "yellow",
          purpletx: card.color == "purple",
          blacktx: card.color == "black"
        };
      },
      shortName(theName) {
        return calculations.shortName(theName);
      },
      loadResult(t) {
        console.log("loading search result");
        this.exploring = true;
        this.$store.commit("selectSearchResult", t.taskId);
        console.log("search result loaded");
      },
      debounce(func, delay) {
        const context = this;
        const args = arguments;
        clearTimeout(this.inDebounce);
        this.inDebounce = setTimeout(() => func.apply(context, args[2]), delay);
      },
      goIn(taskId) {
        clearTimeout(this.inDebounce);
        let panel = [taskId];
        let parents = [];
        let top = 0;

        if (this.$store.getters.contextCard.taskId) {
          parents.push(this.$store.getters.contextCard.taskId);
        } else if (this.$store.getters.memberCard.taskId) {
          parents.push(this.$store.getters.memberCard.taskId);
        }
        this.$store.dispatch("goIn", {
          parents,
          top,
          panel
        });
        if (
          this.$store.state.upgrades.mode === "doge" &&
          this.$store.getters.contextCard.priorities.length > 0
        ) {
          this.$store.commit("setMode", 1);
        }
        this.$router.push("/" + this.$store.state.upgrades.mode);
      }
    },
    computed: {
      matchCards() {
        if (this.$store.state.upgrades.search.length < 1) return [];
        if (this.exploring) return this.searchResults;
        let matches = [];
        let guildmatches = [];
        let dogematches = [];
        try {
          let regex = new RegExp(this.$store.state.upgrades.search, "i");
          this.$store.state.tasks.forEach(t => {
            if (t.guild && regex.test(t.guild)) {
              guildmatches.push(t);
            } else if (regex.test(t.name)) {
              matches.push(t);
            }
          });
          this.$store.state.members.forEach(member => {
            if (regex.test(member.name)) {
              let result = this.$store.getters.hashMap[member.memberId];
              result.name = member.name;
              dogematches.push(result);
            }
          });
        } catch (err) {
          console.log("regex search terminated in error: ", err);
        }
        this.searchResults = {
          guilds: guildmatches,
          doges: dogematches,
          cards: matches
        };
        return this.searchResults;
      }
    }
  };
</script>

<style lang="stylus" scoped>

  #searchPanel
      z-index: 100

  .scrollbarwrapper
      width: 80vw
      height: 40vh
      position: fixed
      bottom: 0
      left: 10vw
      background: rgba(22, 22, 22, 0.8)
      padding: 1em 0
      border-radius: 20px

  @media only screen and (max-width: 68em)
      .scrollbarwrapper
          width: 100%
          position: absolute
          top: calc(-100% - 0.5em)
          left: 0

  .searchresults
      overflow: auto
      color: white
      font-size: 1.1em
      height: 100%
      padding: 0 1em
      word-wrap: break-word

  ::-webkit-scrollbar
      background-color: rgba(22, 22, 22, 0.4)

  ::-webkit-scrollbar-thumb
      background-color: rgba(89, 89, 89, 0.4)

  ::-webkit-scrollbar-thumb:hover
      background-color: rgba(255, 255, 255, 0.75)

  .result
      margin-bottom: 0.3em
      cursor: pointer

  .smallguild
      height: 1em
      margin-right: 0.3em
      position: relative
      top: 0.16em

  .guildname
      font-weight: bold

  .current.result
      display: block
</style>
