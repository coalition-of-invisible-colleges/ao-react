<template lang='pug'>

.payreq
  .row
    .six.columns
        label lightning payment request
        a(:href='"lightning:" + (this.bolt11)')
            button Open Wallet
        .small {{ bolt11 }}
    .six.columns
        div(v-html='imgTag')
</template>

<script>

import qrcode from 'qrcode-generator'
import calculations from '../../calculations'

export default {
    props: ['bolt11'],
    computed: {
        imgTag(){
            let typeNumber = 0;
            let errorCorrectionLevel = 'L';
            let qr = qrcode(typeNumber, errorCorrectionLevel);
            let data = this.bolt11
            try {
                qr.addData(data)
                qr.make()
            } catch(err) {
               return console.log('err from qrcode', err)
            }
            let cellsize = 4
            let margin = 2
            let tag = qr.createImgTag(cellsize, margin)
            return tag
        },
        cadAmount(){
            return 1
            // return calculations.satsToCad(this.i.sats, this.$store.state.cash.spot)
        }
    }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/button'
@import '../../styles/colours'
@import '../../styles/skeleton'

.payreq
    color: main
    background-color: lightGrey
    border-radius: 0.5em
    padding: 1em
    margin-bottom: 1.654321em

a
    text-decoration: none
    color: main

.box
    word-wrap:break-word
    max-width: 500px
    z-index: 100001
    padding: 1em

.paid
    color: purple
    font-size: 5em

p
    color: accent1

.small
    font-size: .82em
    word-wrap: break-word;


</style>
