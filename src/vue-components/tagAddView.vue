<template>
    <div v-if="newTag" class="container" @keydown.esc="$router.go(-1)" @keydown.ctrl.enter="save()">
        <h2>Tag hinzufügen (Kind von '{{tagUtil.getLabel(parentTag)}}')</h2>
        <div class="row">
            <label class="col-md-3" for="idInput" style="align-items: center;">ID</label>
            <input type="text" class="col-md-6" id="idInput" v-model="newTag.id" v-focus autocomplete="off"/>
            <span class="col-md-2" v-if="tagIds.indexOf(newTag.id) > -1" style="display:flex; align-items: center; color: red">ID bereits vorhanden!</span>
            <span class="col-md-2" v-if="!/^[A-Z_]*$/.test(newTag.id)" style="display:flex; align-items: center; color: red">Nur Großbuchstaben oder "_" erlaubt!</span>
        </div>
        <div class="row">
            <label class="col-md-3" for="labelInput" style="align-items: center;">Label</label>
            <input type="text" class="col-md-6" id="labelInput" v-model="newTag.label.de" autocomplete="off"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="listParents">Eltern</label>
            <div class="col-md-6" id="listParents">
                <div v-if="newTag.parents.length === 0">(keine)</div>
                <div v-for="parent in newTag.parents">
                    <span>{{tagUtil.getLabel(parent, tags)}}</span>
                </div>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="listChildren">Kinder</label>
            <div class="col-md-6" id="listChildren">
                <div v-if="newTag.children.length === 0">(keine)</div>
            </div>
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
                newTag: null,
                parentTag: null,
                tagUtil: tagUtil
            }
        },
        computed: {
            valid: function () {
                return thiz.newTag && thiz.newTag.id && thiz.tagIds.indexOf(thiz.newTag.id) === -1 && thiz.newTag.label.de && /^[A-Z_]*$/.test(thiz.newTag.id);
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
                    thiz.newTag = new Tag({
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
                thiz.parentTag.children.push(thiz.newTag.id);
                thiz.tags.push(thiz.newTag);
                thiz.parentTag.children = tagUtil.sortTags(thiz.parentTag.children, thiz.tags, true);
                return dataService.saveTags(new Tags({tags: thiz.tags})).then(() => {
                    thiz.$router.go(-1)
                });
            },
            back() {

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