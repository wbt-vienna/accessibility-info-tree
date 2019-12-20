import VueRouter from 'vue-router'
import TreeView from '../vue-components/treeView.vue'
import LoginView from '../vue-components/loginView.vue'
import * as log from 'loglevel';

function init() {
    window.log = log;

    let routes = [
        {path: '/tree', component: TreeView},
        {path: '/login', component: LoginView},
        {path: '*', redirect: '/tree'}
    ];

    let router = new VueRouter({
        routes
    });

    Vue.use(VueRouter);
    let app = new Vue({
        router
    }).$mount('#app');
}
init();