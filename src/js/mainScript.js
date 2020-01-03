import Vue from 'vue'
import VueRouter from 'vue-router'
import TreeView from '../vue-components/treeView.vue'
import TreeEditView from '../vue-components/treeEditView.vue'
import LoginView from '../vue-components/loginView.vue'
import TagEditView from '../vue-components/tagEditView.vue'
import * as log from 'loglevel';
import {databaseService} from "./service/data/databaseService";
import 'mini.css';
import '@fortawesome/fontawesome-free/js/all.min'

function init() {
    window.log = log;

    let routes = [
        {path: '/tree', component: TreeView},
        {path: '/tree/edit', component: TreeEditView},
        {path: '/login', component: LoginView},
        {path: '/tag/edit/:tagid', component: TagEditView},
        {path: '*', redirect: '/tree'}
    ];

    let router = new VueRouter({
        routes
    });
    router.beforeEach((to, from, next) => {
        if (!databaseService.isLoggedIn()) {
            databaseService.loginReadonly().then(() => {
                next();
            });
        } else {
            next();
        }
    });

    Vue.use(VueRouter);
    let app = new Vue({
        router
    }).$mount('#app');
}

init();