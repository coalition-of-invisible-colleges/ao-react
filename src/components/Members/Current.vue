<template lang='pug'>

.current(v-if='memberId')
    img(src='../../assets/images/bullet.svg')
    p {{ name }}

</template>

<script>

export default {
  props: ['memberId'],
  computed:{
    name(){
        let memberId = this.memberId
        let name = false
        this.$store.state.members.forEach(member => {
            if (member.memberId == memberId){
                name = member.name
            }
        })
        return name
    }
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'

img
    height: 0.7em
    float: left
p
    margin-left: 1em
    color: white


</style>
