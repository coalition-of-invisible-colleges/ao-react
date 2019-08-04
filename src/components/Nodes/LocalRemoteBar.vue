<template lang='pug'>

.localremote
  .local(:style='l') &#12471; {{ parseFloat( c.channel_sat ).toLocaleString() }}
  .remote(:style='r') &#12471; {{ parseFloat( c.channel_total_sat - c.channel_sat ).toLocaleString() }}
</template>

<script>

export default {
    props: ['c'],
    computed: {
      r(){
          let local = parseFloat( this.c.channel_sat )
          let remote = parseFloat( this.c.channel_total_sat - this.c.channel_sat )

          let capacity = local + remote
          let remotePercent =  remote / capacity

          let w = (remotePercent * 100).toFixed(7) + "%"
          return {
              width: w
          }
      },
      l(){
        let local = parseFloat( this.c.channel_sat )
        let remote = parseFloat( this.c.channel_total_sat - this.c.channel_sat )

        let capacity = local + remote
        let localPercent =  this.c.channel_sat / capacity

        let w = (localPercent * 100).toFixed(7) + "%"
        return {
            width: w
        }
      },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.localremote
    width: 100%
    height: 2em

.local
    height: 2em
    background: purple
    float: left
    color: white
    text-align: center

.remote
    height: 2em
    background: green
    float: right
    color: white
    text-align: center

</style>
