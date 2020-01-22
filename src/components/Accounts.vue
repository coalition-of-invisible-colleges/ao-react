<template lang='pug'>

#accounts
  h1.up {{ activeAccounts }} accounts
  .container
    .row
      member-create.five.columns
      .two.columns &nbsp;
      changer.five.columns
    members
</template>

<script>

import MemberCreate from './MemberCreate'
import Changer from './Changer'
import Members from './Members'

export default {
    components:{
        MemberCreate, Changer, Members,
    },
    mounted() {
        this.$store.commit('stopLoading')
    },
    computed:{
        activeAccounts(){
            let a = 0
            this.$store.state.members.forEach(m => {
                if (m.active > 0) {
                    a ++
                }
            })
            return a
        }
    }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/breakpoints'

.btcspot , .satspot
    position: absolute
    top: 0
    z-index: 11
    padding: 1em

@media (max-width: breakpoint)
    .btcspot , .satspot
        display: none

.btcspot
    right: 111px

.satspot
    left: 111px

.center
    text-align: center

.intro
    padding: 5em 0;

p
    font-size:1.1em
    color:white
    font-family: 'Open Sans', light, sans-serif;

h1
    text-align: center

h3
    text-align: center
    color:accent1
    font-family: 'Open Sans', light, sans-serif;
    font-size:3em

a
    color: accent2
    text-decoration: none;

a:visited
    color: accent1

#whales
    width: 100%
    opacity: 0.234567


.evhis
  margin-top: 2em
  button
    background-color: purple
    background: purple

select
  color: white
  background: purple

.info
  color: accent2
  font-size: 1.2em
  text-align: center

.p
  color: purple

#sundogepurp
  width:100%
  max-height:auto

#burg
    float: right;
    margin-bottom: -9em

#addmember
    height: 5em
    float: right
    margin-bottom: -1em
    z-index: 1010

.open
    background: red

.number
    font-size: 1.1em
    color: green

.underline
    border-bottom-style: solid
    border-color: accent2
    padding-left: 1em

.equals
    margin-top: 1.3em
    font-size: 2em

.equals2
    margin-top: 1.1em
    font-size: 1.69em

.padd
    padding: 1em

.purplewx
    color: white
    transition: opacity 2s;

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

ul
    text-align: left

.up
  width: fit-content
  background: rgba(22, 22, 22, 0.8)
  border-radius: 0.5em
  margin: -1.25em auto 0.25em auto
  padding: 0.25em
  z-index: 80
</style>
