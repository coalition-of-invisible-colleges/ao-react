<template lang="pug">

.Connect.container
    h1 Connect
    div(v-for='r in $store.state.ao')
        h6 {{ r }}
        span.discon(@click='discon(r.address)') delete
    h3 Connect to another AO:
    .input-container
        input.input-effect(v-model='ao.address' type='text'  :class='{"has-content":!!ao.address}')
        label address
    .input-container
        input.input-effect(v-model='ao.secret' type='text'  :class='{"has-content":!!ao.secret}')
        label.input-effect secret
    button(@click='connect') connect
    .ourinfo
        h4 Put this information into another AO to allow it to send cards here.
        h4 Address:
            code(v-if='$store.state.cash.alias') {{ $store.state.cash.address }}
            code(v-else) set an alias for this AO to display address
        h4 Connection Secret:
            code {{ $store.state.loader.token }}
    h3 Update AO label ({{ $store.state.cash.alias }})
    .input-container
        input.input-effect(v-model='aoNamed.alias' type='text'  :class='{"has-content":!!aoNamed.alias}')
        label(for="aoAliasInput") change ao alias:
    button(@click='name') rename
</template>

<script>
  export default {
    mounted() {
      this.$store.commit("setMode", 1);
      this.$store.commit("setDimension", 2);
      this.$store.dispatch("loaded");
    },
    data() {
      return {
        aoNamed: {
          type: "ao-named",
          alias: ""
        },
        ao: {
          type: "ao-outbound-connected",
          address: "",
          secret: ""
        }
      };
    },
    methods: {
      name() {
        this.$store.dispatch("makeEvent", this.aoNamed);
      },
      connect() {
        this.$store.dispatch("makeEvent", this.ao);
      },
      discon(address) {
        console.log("try diconnection", address);
        this.$store.dispatch("makeEvent", {
          type: "ao-disconnected",
          address
        });
      }
    }
  };
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'
  @import '../styles/skeleton'
  @import '../styles/grid'
  @import '../styles/button'
  @import '../styles/title'
  @import '../styles/input'

  h6
      text-align: center

  label
      color: blue

  .count
      float: right

  .activated
      border-style: solid
      border-width: thick
      border-color: white

  .upgrade
      height: 3em

  .task
      color: white
      margin:10px 0
      padding:20px

  .btn
      width:100%
      margin-top: 2em
      max-height: 3em

  select
      background-color: lightteal

  select.form-control
      color: black

  .curs
      cursor: pointer;

  .birdy
      float: left
      height: .777em
      cursor: pointer

  .faded
      opacity: 0.235654

  .faded:hover
      opacity: 1

  .conn, .discon
      font-size: 0.8em
      margin-left: 0.5em
      margin-right: 0.5em

  .discon
      cursor: pointer
      color: red

  .conn
      cursor: pointer
      color: green
      word-wrap: break-word
      word-break: break-word

  .clearboth
      // width: 50%
      // margin-left: 50%
      // transform: translateX(-50%)
      // clear: both
      // margin-top: 1em
      // padding-top: 0.75em

  code
      word-wrap: break-word
      word-break: break-word

  .padleft
      margin-left: 1em

  .topspace
      margin-top: 1em

  .flex
      display: flex
      flex-wrap: wrap
      flex-basis: 50%
      justify-content: center

  @media all and (max-width: 600px)
      .flex
          flex-basis: 100%

  .ourinfo
      background: lightGrey
      color: main
      padding: 1em
      border-radius: 1em
      h4
          text-align: center
</style>
