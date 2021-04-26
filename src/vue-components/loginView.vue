<template>
    <div>
        <div class="container">
            <h2>Login</h2>
        </div>
        <div v-if="loggedIn" class="container">
            <div class="row">
                <span class="col-md-12">Bereits eingeloggt!</span>
                <div class="col-md-4">
                    <button  @click="logout()" class="form-control btn-primary my-3">Ausloggen</button>
                </div>
            </div>
        </div>
        <div v-if="!loggedIn" class="container">
            <div class="form-group row">
                <label class="col-md-2 col-form-label" for="username">Username</label>
                <div class="col-md-4">
                    <input type="text" class="form-control" id="username" v-model="username"/>
                </div>
            </div>
            <div class="form-group row">
                <label class="col-md-2 col-form-label" for="passwordField">Passwort </label>
                <div class="col-md-4">
                    <input type="password" class="form-control" id="passwordField" v-model="password"/>
                </div>
                <div class="col-md-2">
                    <button @click="login" class="form-control my-2 my-md-0 btn-primary">Login</button>
                </div>
                <span class="col-md-4" v-if="wrongPassword">Falsches Passwort!</span>
            </div>
            <div class="form-group">
                <div class="form-check">
                    <input id="inSavePassword" type="checkbox" v-model="savePassword" class="form-check-input"/>
                    <label for="inSavePassword" class="form-check-label">Passwort speichern und in Zukunft automatisch einloggen</label>
                </div>
            </div>
        </div>
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
                username: '',
                wrongPassword: false,
                savePassword: false,
                loggedIn: databaseService.isLoggedInReadWrite(),
                databaseService: databaseService
            }
        },
        methods: {
            login() {
                thiz.wrongPassword = false;
                databaseService.loginWithUser(this.username, this.password, this.savePassword).then(() => {
                    thiz.$router.push(fromRoute);
                }).catch(() => {
                    thiz.wrongPassword = true;
                });
            },
            logout() {
                databaseService.loginReadonly().then(() => {
                    thiz.loggedIn = false;
                });
            }
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