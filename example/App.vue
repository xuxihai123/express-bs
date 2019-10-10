<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <button @click="testMock">test</button>
    <button @click="testQuery">test-query</button>
    <button @click="testParams">test-params</button>
    <button @click="testBody">test-body</button>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import axios from "axios";
export default {
  name: "app",
  components: {
    HelloWorld
  },
  methods: {
    testMock() {
      axios.get("/api/users").then(resp => {
        console.log(resp);
      });
    },
    testQuery() {
      axios
        .get("/api/users", {
          params: { pageSize: 10, currentPage: 5, keyword: 111 }
        })
        .then(resp => {
          console.log(resp);
        });
    },
    testParams() {
      axios.get("/api/users/99").then(resp => {
        console.log(resp);
      });
    },
    testBody() {
      axios
        .post("/api/users", { userName: "admin", password: "12345" })
        .then(resp => {
          console.log(resp);
        });
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
