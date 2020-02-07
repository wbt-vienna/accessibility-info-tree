<template>
    <div v-if="selectedTag" class="container" @keydown.esc="$router.go(-1)" @keydown.ctrl.enter="save()">
        <h2>Tag hinzufügen (Kind von '{{tagUtil.getLabel(parentTag)}}')</h2>
        <div class="row">
            <label class="col-md-3" for="idInput" style="align-items: center;">ID</label>
            <input type="text" class="col-md-6" id="idInput" v-model="selectedTag.id" v-focus autocomplete="off"/>
            <span class="col-md-2" v-if="tagIds.indexOf(selectedTag.id) > -1" style="display:flex; align-items: center; color: red">ID bereits vorhanden!</span>
            <span class="col-md-2" v-if="!/^[A-Z_0-9]*$/.test(selectedTag.id)" style="display:flex; align-items: center; color: red">Nur Großbuchstaben, Zahlen oder "_" erlaubt!</span>
        </div>
        <div class="row">
            <label class="col-md-3" for="labelInput" style="align-items: center;">Label</label>
            <input type="text" class="col-md-6" id="labelInput" v-model="selectedTag.label.de" autocomplete="off"/>
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
                    <span>{{tagUtil.getLabel(parent, tags)}}</span>
                </div>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="listChildren">Kinder</label>
            <div class="col-md-6" id="listChildren">
                <div v-if="selectedTag.children.length === 0">(keine)</div>
            </div>
        </div>
        <div class="row" v-if="!parentTag.searchRoot && !tagUtil.anyParentHasProperty(parentTag, tags, 'searchRoot')">
            <label class="col-md-3" for="searchRoot">Root-Tag für Suche</label>
            <input type="checkbox" v-model="selectedTag.searchRoot" id="searchRoot" class="col-md-1"/>
            <span class="col-md-6">(Kinder dieses Tags werden als Basis für die Eintrags-Suche angeboten)</span>
        </div>
        <div class="row">
            <label class="col-md-3" for="notAssignable">Nicht zuweisbar</label>
            <input type="checkbox" v-model="selectedTag.notAssignable" id="notAssignable" class="col-md-1"/>
            <span class="col-md-6">(Dieser Tag kann Einträgen nicht direkt zugeordnet werden, da er nur ein Sammelbegriff für mehrere Kinder-Tags ist)</span>
        </div>
        <div class="row" v-if="!parentTag.mandatory && !parentTag.optional && !tagUtil.anyParentHasProperty(parentTag, tags, ['mandatory', 'optional'])">
            <label class="col-md-3" for="mandatory">Verpflichtend</label>
            <input type="checkbox" v-model="selectedTag.mandatory" id="mandatory" class="col-md-1" @change="selectedTag.mandatory ? (selectedTag.optional = !selectedTag.mandatory) : null"/>
            <span class="col-md-6">(Jeder Eintrag muss verpflichtend ein Kind dieses Tags zugewiesen werden)</span>
        </div>Sample text for typing scenario
        Sample text for typing scenario
        Sample text for typing scenario
        <div class="row" v-if="!parentTag.mandatory && !parentTag.optional && !tagUtil.anyParentHasProperty(parentTag, tags, ['mandatory', 'optional'])">
            <label class="col-md-3" for="optional">Optional</label>
            <input type="checkbox" v-model="selectedTag.optional" id="optional" class="col-md-1" @change="selectedTag.optional ? (selectedTag.mandatory = !selectedTag.optional) : null"/>
            <span class="col-md-6">(Dieser Tag wird in unter den optionalen zuweisbaren Tags angezeigt)</span>
        </div>
        <div class="row" style="margin-top: 2em">
            <button class="col-md-6 col-md-offset-3" @click="$router.go(-1)"><i class="fas fa-times"></i> Abbrechen [ESC]</button>
        </div>
        <div class="row">
            <button class="col-md-6 col-md-offset-3" :disabled="!valid" @click="save()"><i class="fas fa-check"></i> Tag einfügen [Strg + ENTER]</button>
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
</style>