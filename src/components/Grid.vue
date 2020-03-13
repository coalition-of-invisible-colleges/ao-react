<template lang="pug">
    
.gridContainer
    .grid
        .gridTwo(v-for="y in 17") 
            .box(v-for="x in 17"  :style="{ gridColumnStart: x+1, gridRowStart: y+1 }"  @click="select(x,y)"  :class="{ selected: $store.state.upgrades.grid.selX === x && $store.state.upgrades.grid.selY === y }") 


    //- .start(v-if="$store.state.grid === {}")
    //- div(v-else  v-for="(row, x) in Object.keys($store.state.grid)")
    //-     .gridItem(v-for="(tId, y) in Object.keys(row)") {{getCard(tId).name}} 
    //-         hypercard(v-for='y in Object.keys(x)'  :b="getCard(y)"  :key="y")
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
import Hypercard from "./Card";

export default {
	components: {},

	methods: {
		select(x, y) {
			this.$store.commit("selectGridMeme", { x, y });
		},

		addCard() {},

		createCard() {},

		getCard(taskId) {
			return this.$store.getters.hashMap[taskId];
		}
	},

	computed: {}
};
</script>

<style lang="stylus" scoped>

.start

.gridContainer
    height:100%
    width:100%

.grid
    display: grid
    grid-template-rows: repeat(17, 25px)
    grid-template-columns: (25px)

.gridTwo
    display:grid
    grid-template-columns: repeat(17, 25px)
    grid-template-rows: (25px)

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
    height: 25x
    width: 25px
    border: 1px solid purple
    background-color: yellow
    min-height: 25px
    min-width: 25px

.box:hover
    background-color: blue

.box.selected
    background-color: green
</style>
