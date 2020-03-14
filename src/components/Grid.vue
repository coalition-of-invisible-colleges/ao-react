<template lang="pug">
    
#theGrid
    .grid
        .gridTwo(v-for="y in 17") 
            .box(v-for="x in 17"  :style="{ gridColumnStart: x + 1, gridRowStart: y + 1 }"  @click="select(x, y)"  :class="{ selected: $store.state.upgrades.grid.selX === x && $store.state.upgrades.grid.selY === y }")
                grid-card(:x='x'  :y='y')

    //- .start(v-if="$store.state.grid === {}")
    //- div(v-else  v-for="(row, x) in Object.keys($store.state.grid)")
    //-     .gridItem(v-for="(tId, y) in Object.keys(row)") {{getCard(tId).name}} 
    //-         .addCard.left(v-if="$store.state.grid[x][y-1] === undefined"  @click="selectSpace()")
    //-         .addCard.right(v-if="$store.state.grid[x][y+1] === undefined"  @click="selectSpace()")
    //-         .addCard.top(v-if="$store.state.grid[x+1][y] === undefined"  @click="selectSpace()")
    //-         .addCard.bottom(v-if="$store.state.grid[x-1][y] === undefined"  @click="selectSpace()")


    //- 1. Create grid background
    //- 2. Have initial card-placement button in center, initialize grid object
    //- 3. Allow for concatenation of new cards at available grid spaces, push card ID's into grid object
    //- 4. Re-sizing and re-centering of grid as cards are added
    //- 5. Zoom in & out of grid
    //- 6. On-hover expands cards to their full size, On-click opens the clicc'd card for viewing, until clicc'd back into grid
    //- this.state.grid._keys
    //- obj[x][y] delivers the object at the specified grid coordinates

</template>

<script>
import GridCard from "./GridCard";

export default {
	components: { GridCard },
    beforeCreate() {
        console.log("grid premount")
    },
    created() {
        console.log("grid created")
    },
    mounted() {
        console.log("grid mounted")
    },
	methods: {
		select(x, y) {
			this.$store.commit("selectGridMeme", { x, y });
		},
		getTaskId(x, y) {
			if (this.$store.state.grid[y] && this.$store.state.grid[y][x]) {
				return this.$store.state.grid[y][x];
			}
			return false;
		},
<<<<<<< HEAD
		getCard(taskId) {
			if (!taskId) return false;
			return this.$store.getters.hashMap[taskId];
		},
		cardName(x, y) {
			let taskId = this.getTaskId(x, y);
			if (taskId) {
				return this.getCard(taskId).name;
			}
		}
=======
>>>>>>> 888dc030b030e13564ca1f0abafb306ee1d44116
	},
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.gridContainer

.grid
    display: grid
    grid-template-rows: repeat(17, 15em)
    grid-template-columns: (15em)
    margin-top: -1.5em

.gridTwo
    display:grid
    grid-template-columns: repeat(17, 15em)
    grid-template-rows: (15em)

.gridItem
    height:75px
    width:75px

.addCard
    background-color: #AAA;
    opacity: 0.3

.left
    left: -25px
    width: 25px
    height: 75px

.right
    right: 0px
    width: 25px
    height: 75px

.top
    top: -25px
    height: 25px
    width: 75px

.bottom
    bottom: 0px
    height: 25px
    width: 75px

.box
    height: 15em
    width: 15em
    border: 1px solid wrexpurple
    background-color: rgba(22, 22, 22, 0.3)
    min-height: 15em
    min-width: 15em

.box:hover
    background-color: rgba(28, 78, 176, 0.5)

.box.selected
    background-color: rgba(39, 107, 22, 0.5)
</style>
