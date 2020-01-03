<template>
    <div v-if="selectedTag" class="container">
        <h2>Tag bearbeiten ({{selectedTag.id}})</h2>
        <div class="row">
            <label class="col-md-3" for="idSpan">ID</label>
            <span class="col-md-6" id="idSpan">{{selectedTag.id}}</span>
        </div>
        <div class="row">
            <label class="col-md-3" for="labelInput" style="align-items: center;">Label</label>
            <input type="text" class="col-md-6" id="labelInput" v-model="selectedTag.label.de" @input="save()"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="listParents">Eltern</label>
            <div class="col-md-6" id="listParents">
                <div v-if="selectedTag.parents.length === 0">(keine)</div>
                <div v-for="parent in selectedTag.parents">
                    <a href="javascript:;" @click="toEditTag(parent)">{{tagUtil.getLabel(parent, tags)}}</a>
                </div>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="listChildren">Kinder</label>
            <div class="col-md-6" id="listChildren">
                <div v-if="selectedTag.children.length === 0">(keine)</div>
                <div v-for="child in selectedTag.children">
                    <a href="javascript:;" @click="toEditTag(child)">{{tagUtil.getLabel(child, tags)}}</a>
                </div>
            </div>
        </div>
        <div class="row" style="margin-top: 2em">
            <button class="col-md-6 col-md-offset-3" :disabled="!dirty" @click="revert"><i class="fas fa-undo"></i> Änderungen zurücksetzen</button>
        </div>
        <div class="row">
            <button class="col-md-6 col-md-offset-3" @click="$router.push('/tree/edit')"><i class="fas fa-tree"></i> Zurück zum Baum</button>
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
                    return Promise.resolve();
                });
            },
            revert() {
                thiz.tags = JSON.parse(thiz.originalTagsJSON);
                thiz.selectedTag = tagUtil.getTag(thiz.$route.params.tagid, thiz.tags) || thiz.tags[0];
                thiz.save(true);
            },
            save(instant) {
                if (instant) {
                    util.clearDebounce();
                    return dataService.saveTags(new Tags({tags: thiz.tags}));
                } else {
                    util.debounce(() => {
                        dataService.saveTags(new Tags({tags: thiz.tags}));
                    }, 1000);
                }
                return Promise.resolve();
            },
            updateHandler(event, changedDoc) {
                if (changedDoc.id === constants.TAGS_DOCUMENT_ID) {
                    let originalJSON = thiz.originalTagsJSON;
                    thiz.init().then(() => {
                        thiz.originalTagsJSON = originalJSON;
                    });
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
            let promises = [];
            if (databaseService.isLoggedInReadWrite() && thiz.tags && thiz.dirty) {
                promises.push(thiz.save(true));
            }
            Promise.all(promises).then(() => {
                if (to.path.indexOf('/tag/edit') === 0) {
                    thiz.init();
                    next();
                } else {
                    next();
                }
            });
        },
        beforeRouteLeave(to, from, next) {
            if (databaseService.isLoggedInReadWrite() && thiz.tags && thiz.dirty) {
                thiz.save(true).then(() => {
                    next();
                });
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
</style>