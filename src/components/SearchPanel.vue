<template lang="pug">
#searchPanel.scrollbarwrapper(v-show='showCreate && task.search.length >= 2 && (matchCards.guilds.length + matchCards.doges.length + matchCards.cards.length) > 0'  v-model='task.search')
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

export default {
	props: ["x", "y"],
  data() {
    return {
      showCreate: false,
      task: {
        name: "",
        search: "",
        color: "green"
      },
      swipeTimeout: 0,
      searchResults: [],
      exploring: false,
      inDebounce: false
    }
  },
	computed: {
    debouncedName: {
      get() {
        return this.task.name
      },
      set(newValue) {
        this.task.name = newValue
        this.debounce(() => {
          this.task.search = newValue
        }, 400)
      }
    },
    matchCard() {
      let foundId;
      this.$store.state.tasks.filter(t => {
        if (t.name === this.task.name.trim()) {
          foundId = t.taskId;
        }
      });
      return foundId;
    },
    matchCards() {
        if (this.task.search.length < 1) return [];
        if (this.exploring) return this.searchResults;
        let matches = [];
        let guildmatches = [];
        let dogematches = [];
        try {
            let regex = new RegExp(this.task.search, "i");
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
    },
	}
}
</script>

<style lang="stylus" scoped>

.scrollbarwrapper
    width: 37vw
    height: calc(100% - 2em)
    position: fixed
    top: 0
    left: 22em
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
