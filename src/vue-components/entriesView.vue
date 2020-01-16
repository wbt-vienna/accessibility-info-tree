<template>
    <div>
        <h2 style="display: inline-block">Einträge</h2>
        <router-link v-if="canEdit" to="/entry/edit/" style="float: right; margin-top: 1em; margin-right: 3em;"><i
                class="fas fa-plus"></i> Neuer Eintrag
        </router-link>
        <h3>Filter</h3>
        <div>
            <label for="inputChkOr" style="padding: 0">Verknüpfungsmodus</label>
            <select id="inputChkOr" v-model="joinMode" @change="filterChanged">
                <option value="OR">ODER</option>
                <option value="AND">UND</option>
            </select>
        </div>
        <div v-if="tags">
            <tag-selector :start-tag-id="constants.TAG_ACCESSIBILITY_ID" :tags="tags" v-model="searchTags"
                          @change="filterChanged"></tag-selector>
        </div>
        <h3 style="display: inline-block; margin-top: 2em">Ergebnisliste</h3>
        <span>({{filteredEntries.length}} Ergebnisse)</span>
        <div>
            <ul>
                <li v-for="entry in filteredEntries">
                    <button v-if="canEdit" class="actionBtn" @click="$router.push('/entry/edit/' + entry.id)"
                            title="Eintrag bearbeiten"><i class="fas fa-pencil-alt"/></button>
                    <button v-if="canEdit" class="actionBtn" @click="remove(entry)" title="Eintrag löschen"><i
                            class="fas fa-trash-alt"/></button>
                    <a class="entryHeader" v-if="entry.link" :href="entry.link" target="_blank">{{entry.header}}</a>
                    <span class="entryHeader" v-if="!entry.link">{{entry.header}}</span>
                    <p v-if="entry.short">{{entry.short}}</p>
                    <div v-if="entry.tags.length > 0">
                        <button class="tagButton" v-for="tagId in entry.tags" @click="addTag(tagId)">
                            {{tagUtil.getLabel(tagId, tags)}}
                        </button>
                    </div>
                </li>
            </ul>
            <span v-if="filteredEntries.length === 0">keine Einträge.</span>
        </div>
    </div>
</template>

<script>
    import $ from 'jquery'
    import {constants} from "../js/util/constants";
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";
    import TagSelector from "./tagSelector.vue"
    import {Entry} from "../js/model/Entry";

    let thiz = null;
    export default {
        components: {TagSelector},
        data() {
            return {
                tags: null,
                entries: null,
                filteredEntries: [],
                canEdit: databaseService.isLoggedInReadWrite(),
                searchTags: [],
                joinMode: "OR",
                tagUtil: tagUtil,
                constants: constants
            }
        },
        methods: {
            init() {
                dataService.getTags().then(result => {
                    thiz.tags = JSON.parse(JSON.stringify(result)).tags;
                    dataService.getEntries().then(entries => {
                        thiz.entries = thiz.filteredEntries = JSON.parse(JSON.stringify(entries));
                        thiz.filterChanged();
                    });
                });
            },
            updateHandler(event, changedDoc) {
                if (changedDoc._id.indexOf(Entry.getModelName()) === 0 || changedDoc.id === constants.TAGS_DOCUMENT_ID) {
                    thiz.init();
                }
            },
            addTag(id) {
                thiz.searchTags.push(id);
                thiz.searchTags = [...new Set(thiz.searchTags)];
                thiz.filterChanged();
            },
            remove(entry) {
                let header = entry.header.length < 15 ? entry.header : entry.header.substring(0, 12) + '...';
                if (!confirm(`Den Eintrag "${header}" wirklich löschen?`)) {
                    return;
                }
                thiz.entries = thiz.entries.filter(e => e.id !== entry.id);
                dataService.remove(entry.id);
                thiz.filterChanged();
            },
            filterChanged() {
                if (thiz.searchTags.length === 0) {
                    thiz.filteredEntries = thiz.entries;
                } else {
                    let totalSearchTags = thiz.searchTags.reduce((total, currentId) => {
                        return [...new Set(total.concat(tagUtil.getAllChildIds(currentId, thiz.tags)))];
                    }, thiz.searchTags);
                    thiz.filteredEntries = thiz.entries.filter(entry => {
                        if (thiz.joinMode === 'OR') {
                            return totalSearchTags.reduce((total, currentId) => {
                                return total || entry.tags.indexOf(currentId) !== -1;
                            }, false);
                        } else {
                            return thiz.searchTags.reduce((total, currentId) => {
                                let possibleTags = tagUtil.getAllChildIds(currentId, thiz.tags).concat([currentId]);
                                let hasAny = possibleTags.reduce((totalAny, possibleTag) => {
                                    return totalAny || entry.tags.indexOf(possibleTag) !== -1;
                                }, false);
                                return total && hasAny;
                            }, true);
                        }
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
    }
</script>

<style scoped>
    .actionBtn {
        padding: 0;
        margin: 0 2px;
    }

    .entryHeader {
        font-size: 1.5em;
    }

    ul {
        list-style-type: none;
        padding-left: 0;
        margin-left: 0;
    }

    li {
        margin-bottom: 0.5em;
    }

    p {
        margin: 0;
    }

    .tagButton {
        padding: 0 5px 0 5px;
        margin: 2px;
    }
</style>