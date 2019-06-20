<template lang='pug'>

nav
  navigation
</template>

<script>
import Navigation from './Navigation'
import Auth from './Auth'
import CardPanel from './Deck/CardPanel'

export default {
  components:{
      Navigation,
      Auth,
      CardPanel,
  },
  computed: { }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/framework'
@import '../styles/breakpoints'

nav
    display: flex;
    width: 100%;
    flex-direction: column;

img
    padding: 2rem 0 0 40px
    height: 222px

.bullimg
    height: 10em

</style>
