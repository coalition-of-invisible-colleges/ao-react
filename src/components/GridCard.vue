<template lang="pug">
.meme
    linky(:x='card.name' v-if='!dogeName')
    div(v-else) {{ dogeName }}
</template>

<script>
import Linky from "./Linky";

export default {
	props: ["x", "y"],
	components: { Linky },
	mounted() {
		console.log("grid card mounted");
		let test = this.card;
	},
	computed: {
		taskId() {
			// console.log("taskId function x is ", this.x, " y ", this.y)
			if (
				this.$store.state.grid[this.y] &&
				this.$store.state.grid[this.y][this.x]
			) {
				console.log(
					"returning taskId ",
					this.$store.state.grid[this.y][this.x]
				);
				return this.$store.state.grid[this.y][this.x];
			}
			return false;
		},
		card() {
			if (!this.taskId) return false;
			console.log("returning card ", this.taskId);
			return this.$store.getters.hashMap[this.taskId];
		},
		dogeName() {
			let mc;
			this.$store.state.members.forEach(m => {
				if (this.taskId === m.memberId) {
					mc = m;
				}
			});
			return mc && mc.name ? mc.name : false;
		}
	}
};
</script>

<style lang="stylus" scoped>

.meme
  overflow-wrap: break-word
  word-wrap: break-word
  word-break: break-word
  hyphens: auto
  display: flex
  justify-content: center
  align-items: center
  width: 100%
  height: 100%
  max-height:100%
  max-width:100%

.linky
  max-height: 15em
  max-width: 15em
  object-fit: fill

.linky .noheight
  max-height: 15em
</style>
