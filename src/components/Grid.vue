<template lang="pug">
    
.gridContainer
    div(v-for="x in Object.keys($store.state.grid)")
        .gridItem(v-for="y in Object.keys(x)") {{getCard(y).name}} 
            hypercard(v-for='y in Object.keys(x)'  :b="getCard(y)"  :key="y")


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
		selectSpace() {},

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

.gridContainer
    height:100%
    width:100%

.gridItem
    height:75px
    width:75px
</style>
