import Vue from "vue";
import App from "./App.vue";

import "./mock-server";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
