<template>
    <div v-if="selectedTag" class="container" @keydown.esc="$router.push('/tree/edit/')" @keydown.ctrl.enter="saveAndReturn()" @keydown.ctrl.s.prevent="save()">
        <h2>Tag bearbeiten ({{selectedTag.id}})</h2>
        <div class="row">
            <label class="col-md-3" for="idSpan">ID</label>
            <span class="col-md-6" id="idSpan">{{selectedTag.id}}</span>
        </div>
        <div class="row">
            <label class="col-md-3" for="labelInput" style="align-items: center;">Label</label>
            <input type="text" class="col-md-6" id="labelInput" v-model="selectedTag.label.de" v-focus autocomplete="off"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="colorInput" style="align-items: center;">Farbe</label>
            <input type="color" id="colorInput" v-model="selectedTag.color"/>
            <button @click="selectedTag.color = ''" style="padding: 0 3px" title="Farbe löschen">X</button>
        </div>
        <div class="row">
            <label class="col-md-3" for="listParents">Eltern</label>
            <div class="col-md-6" id="listParents">
                <div v-if="selectedTag.parents.length === 0">(keine)</div>
                <div v-for="parent in selectedTag.parents">
                    <router-link :to="'/tag/edit/' + parent">{{tagUtil.getLabel(parent, tags)}}</router-link>
                </div>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="listChildren">Kinder</label>
            <div class="col-md-6" id="listChildren">
                <div v-if="selectedTag.children.length === 0">(keine)</div>
                <div v-for="child in selectedTag.children" class="routerLink">
                    <router-link :to="'/tag/edit/' + child"><span class="colorMarker" :style="tagUtil.getColorStyle(child, tags)"></span>{{tagUtil.getLabel(child, tags)}}</router-link>
                </div>
                <div class="routerLink">
                    <router-link :to="'/tag/add/' + selectedTag.id"><i class="fas fa-plus"></i> Kindknoten hinzufügen</router-link>
                </div>
            </div>
        </div>
        <div class="row" style="margin-top: 2em">
            <button class="col-md-6 col-md-offset-3" @click="$router.push('/tree/edit/')"><i class="fas fa-times"></i> Abbrechen [ESC]</button>
        </div>
        <div class="row">
            <button class="col-md-6 col-md-offset-3" :disabled="!dirty" @click="save()"><i class="fas fa-check"></i> Speichern [Strg + S]</button>
        </div>
        <div class="row">
            <button class="col-md-6 col-md-offset-3" :disabled="!dirty" @click="saveAndReturn()"><i class="fas fa-check"></i> Speichern und zum Baum [Strg + ENTER]</button>
        </div>
    </div>
</template>

<script>
    import $ from 'jquery'
    import {constants} from "../js/util/constants";
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";
    import {util} from "../js/util/util";
    import {Tags} from "../js/model/Tags";

    let thiz = null;
    export default {
        data() {
            return {
                tags: null,
                selectedTag: null,
                originalTagsJSON: null,
                tagUtil: tagUtil
            }
        },
        computed: {
            dirty: function () {
                return JSON.stringify(thiz.tags) !== thiz.originalTagsJSON;
            }
        },
        methods: {
            toEditTag(id) {
                thiz.$router.push('/tag/edit/' + id);
            },
            init() {
                if (!databaseService.isLoggedInReadWrite()) {
                    return thiz.$router.push('/login');
                }
                return dataService.getTags().then(result => {
                    let tags = JSON.parse(JSON.stringify(result)).tags;
                    thiz.originalTagsJSON = JSON.stringify(tags);
                    thiz.selectedTag = tagUtil.getTag(thiz.$route.params.tagid, tags) || tags[0];
                    thiz.tags = tags;
                    thiz.$nextTick(() => {
                        document.getElementById('labelInput').focus();
                    });
                    return Promise.resolve();
                });
            },
            save() {
                if (!thiz.selectedTag.label.de) {
                    return Promise.resolve();
                }
                return dataService.saveTags(new Tags({tags: thiz.tags})).then(() => {
                    thiz.originalTagsJSON = JSON.stringify(thiz.tags);
                    return Promise.resolve();
                });
            },
            saveAndReturn() {
                dataService.saveTags(new Tags({tags: thiz.tags})).then(() => {
                    thiz.$router.go(-1)
                });
            },
            updateHandler(event, changedDoc) {
                if (changedDoc.id === constants.TAGS_DOCUMENT_ID) {
                    thiz.init();
                }
            }
        },
        mounted() {
            thiz = this;
            thiz.init();
            $(document).on(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
        },
        beforeDestroy() {
            $(document).off(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
        },
        beforeRouteUpdate(to, from, next) {
            if (to.path.indexOf('/tag/edit') === 0) {
                thiz.selectedTag = null;
                thiz.init();
                next();
            } else {
                next();
            }
        }
    }
</script>

<style scoped>
    label {
        display: flex;
        justify-content: flex-end;
        padding-right: 1em;
    }

    .row {
        margin-top: 0.5em;
    }

    button {
        padding-top: 0.5em;
        padding-bottom: 0.5em;
    }

    .routerLink {
        margin-bottom: 5px;
    }

    .colorMarker {
        padding: 0 5px;
        margin: 0 5px 5px 0
    }
</style>