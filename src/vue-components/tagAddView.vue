<template>
    <div class="container" v-if="selectedTag" @keydown.esc="$router.go(-1)" @keydown.ctrl.enter="save()">
        <h2>Begriff hinzufügen (Kind von '{{tagUtil.getLabel(parentTag)}}')</h2>
        <div class="form-group">
            <label for="idInput" style="align-items: center;">ID</label>
            <input type="text" class="form-control" id="idInput" v-model="selectedTag.id" v-focus autocomplete="off"/>
            <div class="pt-1" v-if="tagIds.indexOf(selectedTag.id) > -1" style="color: red">ID bereits vorhanden!</div>
            <div class="pt-1" v-if="!/^[A-Z_0-9]*$/.test(selectedTag.id)" style="color: red">Nur Großbuchstaben, Zahlen oder "_" erlaubt!</div>
        </div>
        <div class="form-group">
            <label for="labelInput">Label</label>
            <input type="text" class="form-control" id="labelInput" v-model="selectedTag.label.de" autocomplete="off"/>
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
                    <span>{{tagUtil.getLabel(parent, tags)}}</span>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="listChildren">Kinder</label>
            <div id="listChildren">
                <div v-if="selectedTag.children.length === 0">(keine)</div>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check" v-if="!parentTag.searchRoot && !tagUtil.anyParentHasProperty(parentTag, tags, 'searchRoot')">
                <input type="checkbox" v-model="selectedTag.searchRoot" id="searchRoot" class="form-check-input"/>
                <label class="form-check-label" for="searchRoot">Root-Begriff für Suche</label>
                <span class="ml-2">(Kinder dieses Begriffe werden als Basis für die Eintrags-Suche angeboten)</span>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check">
                <input type="checkbox" v-model="selectedTag.notAssignable" id="notAssignable" class="form-check-input"/>
                <label class="form-check-label" for="notAssignable">Nicht zuweisbar</label>
                <span class="ml-2">(Dieser Begriff kann Einträgen nicht direkt zugeordnet werden, da er nur ein Sammelbegriff für mehrere Kinder-Begriffe ist)</span>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check" v-if="!parentTag.mandatory && !parentTag.optional && !tagUtil.anyParentHasProperty(parentTag, tags, ['mandatory', 'optional'])">
                <input type="checkbox" v-model="selectedTag.mandatory" id="mandatory" class="form-check-input" @change="selectedTag.mandatory ? (selectedTag.optional = !selectedTag.mandatory) : null"/>
                <label class="form-check-label" for="mandatory">Verpflichtend</label>
                <span class="ml-2">(Jeder Eintrag muss verpflichtend ein Kind dieses Begriffes zugewiesen werden)</span>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check" v-if="!parentTag.mandatory && !parentTag.optional && !tagUtil.anyParentHasProperty(parentTag, tags, ['mandatory', 'optional'])">
                <input type="checkbox" v-model="selectedTag.optional" id="optional" class="form-check-input" @change="selectedTag.optional ? (selectedTag.mandatory = !selectedTag.optional) : null"/>
                <label class="form-check-label" for="optional">Optional</label>
                <span class="ml-2">(Kinder dieses Begriffes werden unter den optionalen zuweisbaren Begriffes angezeigt)</span>
            </div>
        </div>
        <div class="row save-buttons" style="margin-top: 3em">
            <div class="form-group col-md-6">
                <button class="form-control btn-primary" @click="$router.go(-1)"><i class="fas fa-times"></i> Abbrechen [ESC]</button>
            </div>
            <div class="form-group col-md-6">
                <button class="form-control btn-primary" :disabled="!valid" @click="save()"><i class="fas fa-check"></i> Begriff einfügen [Strg + ENTER]</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";
    import {Tags} from "../js/model/Tags";
    import {Tag} from "../js/model/Tag";

    let thiz = null;
    export default {
        data() {
            return {
                tags: null,
                tagIds: [],
                selectedTag: null,
                parentTag: null,
                tagUtil: tagUtil
            }
        },
        computed: {
            valid: function () {
                return thiz.selectedTag && thiz.selectedTag.id && thiz.tagIds.indexOf(thiz.selectedTag.id) === -1 && thiz.selectedTag.label.de && /^[A-Z_0-9]*$/.test(thiz.selectedTag.id);
            }
        },
        methods: {
            init() {
                if (!databaseService.isLoggedInReadWrite()) {
                    return thiz.$router.push('/login');
                }
                return dataService.getTags().then(result => {
                    let tags = JSON.parse(JSON.stringify(result)).tags;
                    thiz.parentTag = tagUtil.getTag(thiz.$route.params.parentid, tags) || tags[0];
                    thiz.selectedTag = new Tag({
                        parents: [thiz.parentTag.id]
                    });
                    thiz.tagIds = tags.map(tag => tag.id);
                    thiz.tags = tags;
                    return Promise.resolve();
                });
            },
            save() {
                if (!thiz.valid) {
                    return;
                }
                thiz.parentTag.children.push(thiz.selectedTag.id);
                thiz.tags.push(thiz.selectedTag);
                thiz.parentTag.children = tagUtil.sortTags(thiz.parentTag.children, thiz.tags, true);
                let allChildren = tagUtil.getAllChildren(thiz.selectedTag, thiz.tags);
                allChildren.forEach(child => {
                    child.searchRoot = thiz.selectedTag.searchRoot ? false : child.searchRoot;
                    child.mandatory = thiz.selectedTag.mandatory ? false : child.mandatory;
                    child.optional = thiz.selectedTag.optional ? false : child.optional;
                });
                return dataService.saveTags(new Tags({tags: thiz.tags})).then(() => {
                    thiz.$router.go(-1)
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
</style>