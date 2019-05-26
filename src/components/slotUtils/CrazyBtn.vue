<template lang='pug'>

router-link(:to='to')
    h2 test
    button {{text}}
    //- img.spin(src='../../assets/images/active10.svg')

</template>

<script>

export default {
    props: ['to', 'text']
}


</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/spinners'
@import '../../styles/skeleton-button'

button
    float: right
    color: main
    margin-top: 1.5em
    background: accent2

img
    height: 1em
    position: relative
    right: 0

span
    float:left
    padding-left: .7em
    padding-top: .7em

</style>
