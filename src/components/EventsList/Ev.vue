<template lang='pug'>

.ev.row
  .three.grid
    label {{ e.type }}
    div(v-if='e.memberId')
      label {{ name }}
    div(v-if='e.resourceId')
      label {{ resourceName }}
    div(v-if='e.taskId')
      label {{ taskName }}
  .six.grid
    img(src='../../assets/images/loggedOut.svg')
    div &nbsp;
    div(v-if='e.name')
      p Name: {{ e.name }}
    div(v-if='e.paid')
      p Paid: {{ e.paid }}
    div(v-if='e.amount')
      p Amount: {{ e.amount }}
    div(v-if='e.monthlyValue')
      p Monthly Value: {{ e.monthlyValue }}
    div(v-if='e.cap')
      p Cap: {{ e.cap }}
    div(v-if='e.boost')
      p Boost: {{ e.boost }}
    div(v-if='e.charged')
      p Charged: {{ e.charged }}
    div(v-if='e.notes')
      p Notes: {{ e.notes }}
  .three.grid
      div &nbsp;
      div {{ dateStr }}
      div(v-if='e.blame')
        current(:memberId="e.blame")


</template>


<script>

import Current from '../Resources/Current'
import moment from 'moment'

export default {
    props: ['e'],
    components: { Current },
    computed:{
        name() {
            let name
            this.$store.state.members.forEach(m => {
                if (this.e.memberId === m.memberId) {
                    name = m.name
                }
            })
            return name
        },
        resourceName(){
          let name
          this.$store.state.resources.forEach(r => {
              if (this.e.resourceId === r.resourceId) {
                  name = r.name
              }
          })
          return name
        },
        taskName(){
          let name
          this.$store.state.tasks.forEach(t => {
              if (this.e.taskId === t.taskId) {
                  name = t.name
              }
          })
          return name
        },
        dateStr() {
          return moment(this.e.timestamp).format('YYYY-MM-DD [at] hh:mm A')
        }
    },
    methods: {

    }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/grid'

img
    height: 4em

label
    font-size: 1.246em
    font-weight: normal;
    margin: 1em

.row
    float: left
    width: 100%
    border-bottom-style: solid
    border-bottom-color: accent4
    border-width: 3px
    padding-bottom: 0.8em
    margin-bottom: 0.8em



</style>
