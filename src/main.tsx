import { observable, autorun } from 'mobx';
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
interface MyState {
  data: string;
}

class MyStore {
  @observable state: MyState = { data: 'foo' };
}
const myStore = new MyStore();
autorun(() => {
  console.log(myStore.state.data);
  document.getElementById('log').innerHTML += myStore.state.data + '<br />';
});

myStore.state.data = 'bar';
