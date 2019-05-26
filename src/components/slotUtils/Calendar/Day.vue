<template lang="pug">

.day
	.date {{ day }}
			span {{daysEvents}}
	//- main-event(v-for='e in daysEvents', :e='e')

</template>

<script>
import MainEvent from './MainEvent.vue'
import Tooltip from 'tether-tooltip'
import Vue from 'vue'

export default {
  components: {
    MainEvent
  },
  props: ['day', 'month', 'year'],
  computed: {
    daysEvents() {
				let daysEv = []
				this.$store.state.member.listOfMemberPaidActions.forEach( action => {
						if (
								this.day = action.day &&
								this.year = action.year &&
								this.month = action.month
						){
								daysEv.push(action)
						}
				})
				return daysEv
    },
  },
}
</script>

<style lang='stylus' scoped>

@import '../../../styles/colours'


  .day
    background-color: main
    overflow: visible
		:hover
				background-color: accent1

  .date
    text-align:right
    height: 30px
    margin-top: 0
    margin-bottom:-30px
    font-weight: bolder
    font-size: .9em
    padding: 5px 5px 5px 5px

</style>
