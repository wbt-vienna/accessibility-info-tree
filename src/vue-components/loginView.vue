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
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";

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
                databaseService.login(this.password).then(() => {
                    thiz.$router.push('/tree');
                }).catch(() => {
                    thiz.wrongPassword = true;
                });
            },
        },
        mounted() {
            thiz = this;
        }
    }
</script>

<style scoped>
</style>