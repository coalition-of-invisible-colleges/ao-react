<template lang='pug'>

div
  div(v-if='m.active > 0')
    img(v-if='m.active == 1' src='../../assets/images/active1.svg')
    img(v-if='m.active == 2' src='../../assets/images/active2.svg')
    img(v-if='m.active == 3' src='../../assets/images/active3.svg')
    img(v-if='m.active == 4' src='../../assets/images/active4.svg')
    img(v-if='m.active == 5' src='../../assets/images/active5.svg')
    img(v-if='m.active == 6' src='../../assets/images/active6.svg')
    img(v-if='m.active == 7' src='../../assets/images/active7.svg')
    img(v-if='m.active == 8' src='../../assets/images/active8.svg')
    img(v-if='m.active == 9' src='../../assets/images/active9.svg')
    img(v-if='m.active == 10' src='../../assets/images/active10.svg')
    img(v-if='m.active == 11' src='../../assets/images/active11.svg')
    img(v-if='m.active == 12' src='../../assets/images/active12.svg')
    img(v-if='m.active == 13' src='../../assets/images/active13.svg')
    img(v-if='m.active == 14' src='../../assets/images/active14.svg')
    img(v-if='m.active >= 15' src='../../assets/images/active15.svg')
  img(v-else src='../../assets/images/inactive.svg')

</template>


<script>

export default {
    methods: {
        calcSpin(m){
            if (m.balance > 0){
                return {
                    spin:true
                }
            }
        }
    },
    props: ['m'],
}

</script>

<style lang="stylus" scoped>
@import '../../styles/spinners'

img
    height: 3em

</style>
