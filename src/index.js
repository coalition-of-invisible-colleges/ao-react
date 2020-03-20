import 'core-js/stable'
import 'regenerator-runtime/runtime'
import mobx from 'mobx'
const { observable, computed, autorun } = mobx
class MyStore {
  @observable data = 'foo'
}
const myStore = new MyStore()
autorun(() => {
  console.log(myStore.data)
  document.getElementById('log').innerHTML += myStore.data + '<br />'
})

myStore.data = 'bar'
// import React from "react";
// import ReactDOM from "react-dom";
// let HelloWorld = () => {
//     return <div>
//               <h1>Hello World!</h1> by Amila Silva (amilasilva88@gmail.com)
//            </div>;
// }
// ReactDOM.render(
//     <HelloWorld />,
//     document.getElementById("root")
// );
