<template>
    <div>
        <label for="passwordField">Passwort: </label>
        <input id="passwordField" type="password" v-model="password"/>
        <button @click="login">Login</button>
        <span v-if="wrongPassword">Falsches Passwort!</span>
    </div>
</template>

<script>
    import TreeItem from "./treeItem.vue"
    import {databaseService} from "../js/service/data/databaseService";

    let fromRoute = null;
    let thiz = null;
    export default {
        components: {TreeItem},
        data() {
            return {
                password: '',
                wrongPassword: false
            }
        },
        methods: {
            login() {
                thiz.wrongPassword = false;
                databaseService.loginReadWrite(this.password).then(() => {
                    thiz.$router.push(fromRoute);
                }).catch(() => {
                    thiz.wrongPassword = true;
                });
            },
        },
        mounted() {
            thiz = this;
        },
        beforeRouteEnter (to, from, next) {
            fromRoute = from.path;
            next();
        },
    }
</script>

<style scoped>
</style>