<template>
    <div>
        <h2 style="display: inline-block">Einträge</h2>
        <router-link v-if="canEdit" to="/entry/edit/" style="float: right; margin-top: 1em; margin-right: 3em;"><i
                class="fas fa-plus"></i> Neuer Eintrag
        </router-link>
        <h3>Filter</h3>
        <div>
            <label for="inputChkOr" style="padding: 0">Verknüpfungsmodus</label>
            <select id="inputChkOr" v-model="joinMode" @change="filterChanged()">
                <option value="OR">ODER</option>
                <option value="AND">UND</option>
            </select>
        </div>
        <div v-if="tags">
            <tag-selector :start-tag-id="constants.TAG_ACCESSIBILITY_ID" :tags="tags" v-model="searchTags"
                          @change="filterChanged()"></tag-selector>
        </div>
        <div class="row" v-if="tags">
            <input class="col-md-4" type="text" v-model="searchText" @input="filterChanged(400)" placeholder="Textsuche" style="margin-top: 1em" v-focus/>
        </div>
        <h3 style="display: inline-block; margin-top: 2em">Ergebnisliste</h3>
        <span>({{filteredEntries.length}} Ergebnisse)</span>
        <div>
            <i v-if="loading" class="fa fa-3x fa-spin fa-spinner"/>
            <ul v-if="!loading">
                <li v-for="entry in filteredEntries">
                    <router-link v-if="canEdit" class="button actionBtn" :to="'/entry/edit/' + entry.id" title="Eintrag bearbeiten"><i class="fas fa-pencil-alt"/></router-link>
                    <button v-if="canEdit" class="actionBtn" @click="remove(entry)" title="Eintrag löschen"><i
                            class="fas fa-trash-alt"/></button>

                    <a class="entryHeader" v-if="entry.link" :href="entry.link" target="_blank" v-html="highlightInHTML(entry.header)"></a>
                    <span class="entryHeader" v-if="!entry.link">{{highlightInHTML(entry.header)}}</span>
                    <p v-if="entry.short" v-html="filteredEntries.length > 10 && entry.short.length > 150 ? highlightInHTML(entry.short.substring(0, 147)) + '...' : highlightInHTML(entry.short)"></p>
                    <div v-if="entry.tags.length > 0 || entry.metaTags.length > 0">
                        <button class="tagButton" v-for="tagId in entry.tags" @click="addTag(tagId)" :style="tagUtil.getColorStyle(tagId, tags)" v-html="highlightInHTML(tagUtil.getLabel(tagId, tags))">
                        </button>
                        <button class="tagButton" v-for="tagId in entry.metaTags" @click="addTag(tagId)" :style="tagUtil.getColorStyle(tagId, tags)" v-html="highlightInHTML(tagUtil.getLabel(tagId, tags))">
                        </button>
                    </div>
                </li>
            </ul>
            <span v-if="!loading && filteredEntries.length === 0">keine Einträge.</span>
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
    import {util} from "../js/util/util";

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
                searchText: this.$route.params.searchtext || "",
                joinMode: "OR",
                tagUtil: tagUtil,
                constants: constants,
                loading: true
            }
        },
        methods: {
            init() {
                return dataService.getTags().then(result => {
                    thiz.tags = JSON.parse(JSON.stringify(result)).tags;
                    let tagParams = thiz.$route.params.searchtags ? thiz.$route.params.searchtags.split(';') : [];
                    tagParams.forEach(tagParam => {
                        let tag = tagUtil.getTag(tagParam, thiz.tags);
                        if (tag) {
                            thiz.searchTags.push(tag.id);
                        }
                    });

                    return dataService.getEntries().then(entries => {
                        thiz.entries = JSON.parse(JSON.stringify(entries));
                        thiz.filterChanged();
                        return Promise.resolve();
                    });
                });
            },
            updateHandler(event, changedDoc) {
                if (!thiz.entries) {
                    return;
                }
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
            highlightInHTML(text) {
                if (thiz.searchText.length < 3) {
                    return text;
                }
                let matches = [...text.matchAll(new RegExp(thiz.searchText, 'gi'))];
                matches.forEach(match => {
                    text = text.replace(match[0], `<b>${match[0]}</b>`);
                });
                return text;
            },
            filterChanged(debounceTime) {
                if (!thiz.entries) {
                    return;
                }
                util.debounce(() => {
                    thiz.loading = true;
                    thiz.filteredEntries = thiz.entries;
                    history.pushState(null, null, '#/entries/');
                    if (thiz.searchText) {
                        history.pushState(null, null, '#/entries/search/' + thiz.searchText);
                        thiz.filteredEntries = thiz.filteredEntries.filter(entry => {
                            let inHeader = entry.header.toLocaleLowerCase().indexOf(thiz.searchText.toLocaleLowerCase()) !== -1;
                            let inLink = entry.link.toLocaleLowerCase().indexOf(thiz.searchText.toLocaleLowerCase()) !== -1;
                            let inShort = entry.short ? entry.short.toLocaleLowerCase().indexOf(thiz.searchText.toLocaleLowerCase()) !== -1 : false;
                            let allTags = entry.tags.concat(entry.metaTags);
                            let inTags = allTags.reduce((total, currentTagId) => {
                                let tagLabel = tagUtil.getLabel(currentTagId, thiz.tags);
                                return total || tagLabel.toLocaleLowerCase().indexOf(thiz.searchText.toLocaleLowerCase()) !== -1;
                            }, false);
                            return inHeader || inTags || inLink || inShort;
                        });
                    }
                    if (thiz.searchTags.length > 0) {
                        history.pushState(null, null, '#/entries/search/tag/' + thiz.searchTags.reduce((total, current) => total + current + ';', ''));
                        let totalSearchTags = thiz.searchTags.reduce((total, currentId) => {
                            return [...new Set(total.concat(tagUtil.getAllChildIds(currentId, thiz.tags)))];
                        }, thiz.searchTags);
                        thiz.filteredEntries = thiz.filteredEntries.filter(entry => {
                            let allEntryTags = entry.tags.concat(entry.metaTags);
                            if (thiz.joinMode === 'OR') {
                                return totalSearchTags.reduce((total, currentId) => {
                                    return total || allEntryTags.indexOf(currentId) !== -1;
                                }, false);
                            } else {
                                return thiz.searchTags.reduce((total, currentId) => {
                                    let possibleTags = tagUtil.getAllChildIds(currentId, thiz.tags).concat([currentId]);
                                    let hasAny = possibleTags.reduce((totalAny, possibleTag) => {
                                        return totalAny || allEntryTags.indexOf(possibleTag) !== -1;
                                    }, false);
                                    return total && hasAny;
                                }, true);
                            }
                        });
                    }
                    thiz.filteredEntries.sort((a, b) => {
                        return b.updated - a.updated;
                    });
                    thiz.loading = false;
                }, debounceTime ? debounceTime : 0);
            }
        },
        mounted() {
            thiz = this;
            thiz.init().then(() => {
                $(document).on(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
            });
        },
        beforeDestroy() {
            $(document).off(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
        },
    }
</script>

<style scoped>
    .actionBtn {
        padding: 0 3px;
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