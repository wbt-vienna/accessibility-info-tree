<template>
    <div class="container" v-if="selectedTag" @keydown.esc="$router.push('/tree/edit/')" @keydown.ctrl.enter="saveAndReturn()" @keydown.ctrl.s.prevent="save()">
        <h2>Begriff bearbeiten ({{selectedTag.id}})</h2>
        <div class="form-group">
            <label for="idSpan">ID</label>
            <span class="form-control" id="idSpan">{{selectedTag.id}}</span>
        </div>
        <div class="form-group">
            <label for="labelInput" style="align-items: center;">Label</label>
            <input type="text" class="form-control" id="labelInput" v-model="selectedTag.label.de" v-focus autocomplete="off"/>
        </div>
        <div class="form-group">
            <label for="colorInput">Farbe</label>
            <div class="row">
                <div class="col-3 col-md-1">
                    <input type="color" id="colorInput" v-model="selectedTag.color" title="Farbe wählen" style="height: 100%; width: 100%"/>
                </div>
                <div class="col-6 col-md-3">
                    <button class="btn-primary form-control" @click="selectedTag.color = ''" title="Farbe löschen"><span>Farbe löschen</span></button>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="listParents">Eltern</label>
            <div id="listParents">
                <div v-if="selectedTag.parents.length === 0">(keine)</div>
                <div v-for="parent in selectedTag.parents">
                    <router-link :to="'/tag/edit/' + parent">{{tagUtil.getLabel(parent, tags)}}</router-link>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="listChildren">Kinder</label>
            <div id="listChildren">
                <div v-if="selectedTag.children.length === 0">(keine)</div>
                <div v-for="child in selectedTag.children" class="routerLink">
                    <router-link :to="'/tag/edit/' + child"><span class="colorMarker" :style="tagUtil.getColorStyle(child, tags)"></span>{{tagUtil.getLabel(child, tags)}}</router-link>
                </div>
                <div class="routerLink">
                    <router-link :to="'/tag/add/' + selectedTag.id"><i class="fas fa-plus"></i> Kindknoten hinzufügen</router-link>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check" v-if="!tagUtil.anyParentHasProperty(selectedTag, tags, 'searchRoot')">
                <input class="form-check-input" type="checkbox" v-model="selectedTag.searchRoot" id="searchRoot"/>
                <label class="form-check-label" for="searchRoot">Root-Begriff für Suche</label>
                <span class="ml-2">(Kinder dieses Begriffes werden als Basis für die Eintrags-Suche angeboten)</span>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="selectedTag.notAssignable" id="notAssignable"/>
                <label class="form-check-label" for="notAssignable">Nicht zuweisbar</label>
                <span class="ml-2">(Dieser Begriff kann Einträgen nicht direkt zugeordnet werden, da er nur ein Sammelbegriff für mehrere Kinder-Begriffe ist)</span>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check" v-if="!tagUtil.anyParentHasProperty(selectedTag, tags, ['mandatory', 'optional'])">
                <input class="form-check-input" type="checkbox" v-model="selectedTag.mandatory" id="mandatory" @change="selectedTag.mandatory ? (selectedTag.optional = !selectedTag.mandatory) : null"/>
                <label class="form-check-label" for="mandatory">Verpflichtend</label>
                <span class="ml-2">(Jeder Eintrag muss verpflichtend ein Kind dieses Begriffes zugewiesen werden)</span>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check" v-if="!tagUtil.anyParentHasProperty(selectedTag, tags, ['mandatory', 'optional'])">
                <input class="form-check-input" type="checkbox" v-model="selectedTag.optional" id="optional" @change="selectedTag.optional ? (selectedTag.mandatory = !selectedTag.optional) : null"/>
                <label class="form-check-label" for="optional">Optional</label>
                <span class="ml-2">(Kinder dieses Begriffes werden unter den optionalen zuweisbaren Begriffes angezeigt)</span>
            </div>
        </div>
        <div class="row save-buttons" style="margin-top: 3em">
            <div class="form-group col-md-4">
                <button class="form-control btn-primary" @click="$router.push('/tree/edit/')"><i class="fas fa-times"></i> Abbrechen [ESC]</button>
            </div>
            <div class="form-group col-md-4">
                <button class="form-control btn-primary" :disabled="!dirty" @click="save()"><i class="fas fa-check"></i> Speichern [Strg + S]</button>
            </div>
            <div class="form-group col-md-4">
                <button class="form-control btn-primary" :disabled="!dirty" @click="saveAndReturn()"><i class="fas fa-check"></i> Speichern und zur Übersicht [Strg + ENTER]</button>
            </div>
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
                return thiz.saveInternal().then(() => {
                    thiz.originalTagsJSON = JSON.stringify(thiz.tags);
                    return Promise.resolve();
                });
            },
            saveAndReturn() {
                thiz.saveInternal().then(() => {
                    thiz.$router.go(-1)
                });
            },
            saveInternal() {
                let allChildren = tagUtil.getAllChildren(thiz.selectedTag, thiz.tags);
                allChildren.forEach(child => {
                    child.searchRoot = thiz.selectedTag.searchRoot ? false : child.searchRoot;
                    child.mandatory = thiz.selectedTag.mandatory ? false : child.mandatory;
                    child.optional = thiz.selectedTag.optional ? false : child.optional;
                });
                return dataService.saveTags(new Tags({tags: thiz.tags}));
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
        font-weight: bold;
    }

    .row {
        margin-top: 0.5em;
    }

    button {
        padding-top: 0.5em;
        padding-bottom: 0.5em;
    }

    .save-buttons div {
        display: flex;
    }

    .routerLink {
        margin-bottom: 5px;
    }

    .colorMarker {
        padding: 0 5px;
        margin: 0 5px 5px 0
    }
</style>