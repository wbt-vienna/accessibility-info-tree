<template>
    <div v-if="selectedTag" class="container">
        <h2>Tag bearbeiten ({{selectedTag.id}})</h2>

        <div class="row">
            <label class="col-md-3" for="idSpan">ID</label>
            <span class="col-md-6" id="idSpan">{{selectedTag.id}}</span>
        </div>
        <div class="row">
            <label class="col-md-3" for="labelInput" style="align-items: center;">Label</label>
            <input type="text" class="col-md-6" id="labelInput" v-model="selectedTag.label.de"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="listParents">Eltern</label>
            <div class="col-md-6" id="listParents">
                <div v-if="selectedTag.parents.length === 0">(keine)</div>
                <div v-for="parent in selectedTag.parents"><button title="Löschen" :disabled="selectedTag.parents.length === 1" style="padding: 0 0.5em; margin: 0 0 0.3em 0">X</button> <a href="javascript:;" @click="toEditTag(parent)">{{parent}}</a></div>
                <div class="row">
                    <input class="col-md-8" list="possibleNewList" placeholder="Eltern-Tag hinzufügen"/>
                    <button class="col-md-3">Hinzufügen</button>
                </div>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="listChildren">Kinder</label>
            <div class="col-md-6" id="listChildren">
                <div v-if="selectedTag.children.length === 0">(keine)</div>
                <div v-for="child in selectedTag.children"><button title="Löschen" style="padding: 0 0.5em; margin: 0 0 0.3em 0">X</button> <a href="javascript:;" @click="toEditTag(child)">{{child}}</a></div>
                <div class="row">
                    <input class="col-md-8" list="possibleNewList" placeholder="Kind-Tag hinzufügen"/>
                    <button class="col-md-3">Hinzufügen</button>
                </div>
            </div>
        </div>
        <datalist id="possibleNewList">
            <option v-for="tag in possibleNew">{{tag.id}}</option>
        </datalist>
    </div>
</template>

<script>
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";

    let thiz = null;
    export default {
        data() {
            return {
                tags: null,
                selectedTag: null,
                possibleNew: null
            }
        },
        methods: {
            toEditTag(id) {
                thiz.$router.push('/tag/edit/' + id);
            },
            init() {
                if (!databaseService.isLoggedInReadWrite()) {
                    //return thiz.$router.push('/login');
                }
                dataService.getTags().then(result => {
                    let tags = JSON.parse(JSON.stringify(result)).tags;
                    thiz.selectedTag = tagUtil.getTag(thiz.$route.params.tagid, tags) || tags[0];
                    thiz.possibleNew = tagUtil.getPossibleNewRelatives(thiz.selectedTag, tags);
                    log.warn(thiz.possibleNew.map(el => el.id));
                    thiz.tags = tags;
                });
            }
        },
        mounted() {
            thiz = this;
            thiz.init();
        },
        beforeRouteUpdate (to, from, next) {
            thiz.init();
            next();
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
</style>