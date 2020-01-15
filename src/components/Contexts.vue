<template lang='pug'>
.contexts(:class="cardInputSty")
    div(:class='{suncontext: isSun(), bullcontext: isBull()}')
        .transparentsides
    template(v-for='(n, i) in $store.state.context.parent')
        .narrow(@click='goToParent(n)')
            context-row(:taskId='n')
</template>

<script>

import ContextRow from './Deck/Context'
import Dimensions from '../utils/dimensions'

export default {
    components: { ContextRow },
    computed: {
        cardInputSty() {
          let color = this.$store.getters.contextCard.color
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        },
    },
    methods: {
        goToParent(target){
            this.$store.dispatch("goUp", {
                target,
                panel: [target],
                top: 0
            })
        },
        isSun() {
            return Dimensions.isSun(this.$router.currentRoute.path)
        },
        isBull() {
            return Dimensions.isBull(this.$router.currentRoute.path)
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.narrow
    padding-left: 4em
    padding-right: 4em

.contexts
    opacity: 0.9

.bullcontext, .suncontext
    height: 1.75em
    background-repeat: repeat-x
    background-size: 3em
    // margin-left: 7em
    // margin-right: 7em
    z-index: -1

h4
    padding-left: 3.655em
</style>
