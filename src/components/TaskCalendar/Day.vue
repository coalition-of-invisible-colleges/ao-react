<template lang="pug">
.day
  .date {{ day }}
  .tooltip(v-for='t in ev')
    img.upgrade(@click="goIn(t.taskId)"  src='../../assets/images/timecubewithwhite.png'  :class='styl(t.color)')
    .tooltiptext {{ t.name }}
</template>

<script>
import _ from 'lodash'

function getDMY(ts){
    let d = new Date(ts)
    let day =  d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return { day, month, year }
}

export default {
  components: {},
  props: ['day', 'month', 'year', 'inId', 'ev'],
  methods: {
      styl(color){
        return {
            redwx : color == 'red',
            bluewx : color == 'blue',
            greenwx : color == 'green',
            yellowwx : color == 'yellow',
            purplewx : color == 'purple',
            blackwx : color == 'black',
        }
      },
      goIn(){
          window.scrollTo(0, '33px');

          let panel = this.c
          if (panel && panel.length && panel.length > 0){

          } else {
              panel = [this.b.taskId]
          }

          let top = panel.indexOf(this.b.taskId)

          if (top > -1){

          } else {
              top = 0
          }

          this.$store.dispatch("goIn", {
              inId: this.inId,
              top,
              panel
          })

          this.$router.push("/task/" + this.b.taskId)
      },
  },
  computed: {
      calcDayRange(){

          return
      },

  },
}
</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/tooltips'

label
    padding: 0
    margin: 0
    color: black

.upgrade
    width: 60%
    cursor: pointer

.type
    font-size: .5em
    float: left
    white-space: nowrap;
    // font-size

.day
    position: relative
    background-color: softGrey
    overflow: visible

.date
    text-align:right
    height: 1.7em
    margin-top: 0
    margin-bottom:-30px
    font-weight: bolder
    font-size: .9em
    padding: 5px 5px 5px 5px

.amount
    font-size: .49em
    position: absolute;
    bottom: 0;
    left: 0;

.inc
    color: accent2

.dec
    color: red

.b
		text-align: center
		border-radius: 8%
		color: main
		font-size: .8em

.p
		background-color: green
		border-right-style: solid
		border-color: green
.c
		background-color: green

</style>
