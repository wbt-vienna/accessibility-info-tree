<template>
    <div v-if="editEntry" class="container" @keydown.esc="$router.push('/entries')" @keydown.ctrl.enter="save()">
        <h2>Eintrag {{isNew ? 'hinzufügen' : 'bearbeiten'}}</h2>
        <div class="row">
            <label class="col-md-3" for="inputHeader">Überschrift</label>
            <input type="text" class="col-md-8" id="inputHeader" v-model="editEntry.header" v-focus autocomplete="off" maxlength="80"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="linkInput">Link</label>
            <input type="text" class="col-md-8" id="linkInput" v-model="editEntry.link" autocomplete="off"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="shortInput">Kurzbeschreibung</label>
            <textarea class="col-md-8" id="shortInput" v-model="editEntry.short" maxlength="500"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="inputTags" style="align-items: initial;">Tags</label>
            <div class="col-md-8" id="inputTags">
                <tag-selector :start-tag-id="constants.TAG_ACCESSIBILITY_ID" :tags="tags" v-model="editEntry.tags"></tag-selector>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="inputMetaTags" style="align-items: initial;">Meta-Tags</label>
            <div class="col-md-8" id="inputMetaTags">
                <tag-selector :start-tag-id="constants.TAG_META_ID" :tags="tags" v-model="editEntry.metaTags"></tag-selector>
            </div>
        </div>
        <div class="row" style="margin-top: 2em">
            <button class="col-md-8 col-md-offset-3" @click="$router.go(-1)"><i class="fas fa-times"></i> Abbrechen [ESC]</button>
        </div>
        <div class="row">
            <button class="col-md-8 col-md-offset-3" :disabled="!valid" @click="save()"><i class="fas fa-check"></i> Eintrag speichern [Strg + ENTER]</button>
        </div>
    </div>
</template>

<script>
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";
    import {Entry} from "../js/model/Entry";
    import TagSelector from "./tagSelector.vue"
    import {constants} from "../js/util/constants";

    let thiz = null;
    export default {
        components: {TagSelector},
        data() {
            return {
                tags: null,
                editEntry: null,
                isNew: false,
                tagUtil: tagUtil,
                constants: constants
            }
        },
        computed: {
            valid: function () {
                return thiz.editEntry && thiz.editEntry.header;
            }
        },
        methods: {
            init() {
                if (!databaseService.isLoggedInReadWrite()) {
                    return thiz.$router.push('/login');
                }
                return dataService.getTags().then(result => {
                    let tags = JSON.parse(JSON.stringify(result)).tags;
                    thiz.tags = tags;
                    dataService.getEntry(thiz.$route.params.editid).then(result => {
                        thiz.isNew = !result;
                        thiz.editEntry = result ? JSON.parse(JSON.stringify(result)) : new Entry();
                    });
                    return Promise.resolve();
                });
            },
            save() {
                if (!thiz.valid) {
                    return;
                }
                if (!thiz.isNew) {
                    thiz.editEntry.updated = new Date().getTime();
                }
                if (!thiz.editEntry.link) {
                    thiz.editEntry.link = 'https://www.google.com/search?q=' + thiz.editEntry.header;
                }
                dataService.saveEntry(thiz.editEntry).then(() => {
                    thiz.$router.go(-1);
                });
            }
        },
        mounted() {
            thiz = this;
            thiz.init();
        },
        beforeDestroy() {
        }
    }
</script>

<style scoped>
    label {
        display: flex;
        justify-content: flex-end;
        padding-right: 1em;
        align-items: center;
    }

    .row {
        margin-top: 0.5em;
    }

    button {
        padding-top: 0.5em;
        padding-bottom: 0.5em;
    }

    .input-error {
        display: flex;
        align-items: center;
        color: red;
    }
</style>