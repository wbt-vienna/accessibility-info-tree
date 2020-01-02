import Vue from 'vue'
import VueRouter from 'vue-router'
import TreeView from '../vue-components/treeView.vue'
import TreeEditView from '../vue-components/treeEditView.vue'
import LoginView from '../vue-components/loginView.vue'
import * as log from 'loglevel';
import 'mini.css';

function init() {
    window.log = log;

    let routes = [
        {path: '/tree', component: TreeView},
        {path: '/tree/edit', component: TreeEditView},
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