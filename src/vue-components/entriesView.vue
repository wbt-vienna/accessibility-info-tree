<template>
    <div class="container">
        <div style="display: flex">
            <h2>Einträge</h2>
            <div style="display: flex; flex-grow: 1; justify-content: flex-end">
                <router-link v-if="canEdit" to="/entry/edit/" >
                    <i class="fas fa-plus"></i>
                    <span>Neuer Eintrag</span>
                </router-link>
            </div>
        </div>
        <h3>Filter</h3>
        <div class="row" v-if="tags">
            <div class="col-md-12">
                <input class="form-control mb-2" type="text" v-model="filterOptions.searchText" @input="filterChanged(400)" placeholder="Textsuche" v-focus/>
            </div>
        </div>
        <div v-if="tags">
            <tag-selector :start-tag-ids="searchBaseTags" :tags="tags" v-model="filterOptions.searchTags"
                          @change="filterChanged()" :show-search-bar="true"></tag-selector>
        </div>
        <div class="row" v-if="tags">
            <accordion acc-label="Erweiterte Sucheinstellungen" class="col-md-12" style="margin-top: 1em">
                <div class="form-group">
                    <label class="col-form-label" for="inputChkOr">Verknüpfungsmodus</label>
                    <select class="form-control" id="inputChkOr" v-model="filterOptions.joinMode" @change="filterChanged()">
                        <option value="OR">ODER</option>
                        <option value="AND">UND</option>
                        <option value="NOT">NICHT</option>
                    </select>
                </div>
                <div v-if="canEdit" class="form-group">
                    <label class="col-form-label" for="inputCreatedBy">Zuletzt aktualisiert von</label>
                    <select class="form-control" id="inputCreatedBy" v-model="filterOptions.updatedBy" @change="filterChanged()">
                        <option value="">alle</option>
                        <option v-for="user in updatedByList" :value="user">{{user}}</option>
                    </select>
                </div>
                <div class="form-group" v-if="canEdit">
                    <input id="possibleDuplicates" type="checkbox" v-model="filterOptions.onlyPossibleDuplicates" @change="filterChanged()">
                    <label for="possibleDuplicates">Nur potentielle Duplikate anzeigen</label>
                </div>
                <div class="form-group" v-if="canEdit">
                    <input id="incomplete" type="checkbox" v-model="filterOptions.onlyIncomplete" @change="filterChanged()">
                    <label for="incomplete">Nur unvollständige Einträge anzeigen</label>
                </div>
            </accordion>
        </div>
        <h3 style="display: inline-block; margin-top: 1em">Ergebnisliste</h3>
        <span v-if="filteredEntries">({{filteredEntries.length}} Ergebnisse)</span>
        <div>
            <i v-if="loading" class="fa fa-3x fa-spin fa-spinner"/>
            <ul v-if="!loading">
                <li v-for="entry in filteredEntries.slice(0, filterOptions.limitResults)" :style="'background-color:' + entry.color">
                    <router-link v-if="canEdit" class="actionBtn form-control" :to="'/entry/edit/' + entry.id" title="Eintrag bearbeiten"><i class="fas fa-pencil-alt"/></router-link>
                    <button v-if="canEdit" class="actionBtn form-control" @click="remove(entry)" title="Eintrag löschen"><i class="fas fa-trash-alt"/></button>
                    <a class="entryHeader" v-if="entry.link" :href="entry.link" target="_blank" v-html="highlightInHTML(entry.header) + getLinkForHeader(entry)"></a>
                    <span class="entryHeader" v-if="!entry.link">{{highlightInHTML(entry.header)}}</span>
                    <p v-if="entry.short" v-html="filteredEntries.length > 10 && entry.short.length > 150 ? highlightInHTML(entry.short.substring(0, 147)) + '...' : highlightInHTML(entry.short)"></p>
                    <div>
                        <button class="tagButton" v-for="tagId in entry.tags" @click="addTag(tagId)" :style="tagUtil.getColorStyle(tagId, tags)" v-html="highlightInHTML(tagUtil.getLabel(tagId, tags))">
                        </button>
                    </div>
                </li>
            </ul>
            <a href="javascript:;" @click="filterOptions.limitResults+=50" v-if="filteredEntries.length > filterOptions.limitResults && !loading">weitere 50 Einträge anzeigen</a>
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
    import Accordion from "./accordion.vue";
    import {entryUtil} from "../js/util/entryUtil";
    import {localStorageService} from "../js/service/data/localStorageService";

    let thiz = null;
    export default {
        components: {Accordion, TagSelector},
        data() {
            return {
                tags: null,
                entries: null,
                filteredEntries: [],
                filterOptions: {
                    joinMode: 'AND',
                    updatedBy: "",
                    limitResults: 50,
                    searchText: this.$route.params.searchtext || "",
                    searchTags: [],
                    onlyPossibleDuplicates: false,
                    onlyIncomplete: false
                },
                canEdit: databaseService.isLoggedInReadWrite(),
                searchBaseTags: [],
                tagUtil: tagUtil,
                constants: constants,
                loading: true,
                updatedByList: []
            }
        },
        watch: {
            filterOptions: {
                handler(val) {
                    localStorageService.saveFilterOptions(val);
                },
                deep: true
            },
        },
        methods: {
            init() {
                return dataService.getTags().then(result => {
                    thiz.tags = JSON.parse(JSON.stringify(result)).tags;
                    thiz.searchBaseTags = tagUtil.getTagsWithProperty('searchRoot', thiz.tags);
                    let savedFilterOptions = localStorageService.getFilterOptions();
                    if (savedFilterOptions) {
                        thiz.filterOptions = savedFilterOptions;
                    } else {
                        let tagParams = thiz.$route.params.searchtags ? thiz.$route.params.searchtags.split(';') : [];
                        tagParams.forEach(tagParam => {
                            let tag = tagUtil.getTag(tagParam, thiz.tags);
                            if (tag) {
                                thiz.filterOptions.searchTags.push(tag.id);
                            }
                        });
                    }

                    return dataService.getEntries().then(entries => {
                        thiz.entries = JSON.parse(JSON.stringify(entries));
                        thiz.updatedByList = thiz.entries.reduce((total, current) => {
                            if (current.updatedBy && total.indexOf(current.updatedBy) === -1) {
                                total.push(current.updatedBy);
                            }
                            return total;
                        }, []);

                        let printSQL = false;
                        if (printSQL) {
                            let sql = "DELETE FROM label_label; DELETE FROM label; ";
                            thiz.tags.forEach(tag => {
                                let color = tag.color ? `'${tag.color}'` : "NULL";
                                sql += `INSERT INTO label VALUES ('${tag.id}', '${tag.label.de}', NULL, ${color}); `;
                            });
                            thiz.tags.forEach(tag => {
                                tag.parents.forEach(parent => {
                                    sql += `INSERT INTO label_label VALUES (NULL, '${tag.id}', '${parent}', NULL); `;
                                });
                                tag.children.forEach(child => {
                                    sql += `INSERT INTO label_label VALUES (NULL, '${tag.id}', NULL, '${child}'); `;
                                });
                            });
                            log.warn('tags SQL:');
                            log.warn(sql);
                            sql = "DELETE FROM entry; ";
                            thiz.entries.forEach(entry => {
                                let short = entry.short ? `'${entry.short}'` : "NULL";
                                sql += `INSERT INTO entry VALUES (NULL, '${entry.header}', '${entry.link}', ${short}, NULL, from_unixtime(${Math.round(entry.created / 1000)}), from_unixtime(${Math.round(entry.updated / 1000)})); `
                            });
                            log.warn('entries SQL:');
                            log.warn(sql);
                        }

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
                thiz.filterOptions.searchTags.push(id);
                thiz.filterOptions.searchTags = [...new Set(thiz.filterOptions.searchTags)];
                thiz.filterChanged();
            },
            remove(entry) {
                let header = entry.header.length < 15 ? entry.header : entry.header.substring(0, 12) + '...';
                if (!confirm(`Den Eintrag "${header}" wirklich löschen?`)) {
                    return;
                }
                thiz.entries = thiz.entries.filter(e => e.id !== entry.id);
                thiz.filteredEntries = thiz.filteredEntries.filter(e => e.id !== entry.id);
                dataService.remove(entry.id);
            },
            highlightInHTML(text) {
                if (thiz.filterOptions.searchText.length < 3) {
                    return text;
                }
                let matches = [...text.matchAll(new RegExp(thiz.filterOptions.searchText, 'gi'))];
                matches.forEach(match => {
                    text = text.replace(match[0], `<b>${match[0]}</b>`);
                });
                return text;
            },
            getLinkForHeader(entry) {
                if (!thiz.filterOptions.onlyPossibleDuplicates) {
                    return '';
                }
                return `<span style="font-size: 0.6em"> (${entry.link})</span>`
            },
            filterChanged(debounceTime) {
                thiz.loading = true;
                thiz.doFilter(debounceTime).then(() => {
                    thiz.loading = false;
                    thiz.filteredEntries.sort((a, b) => {
                        return b.updated - a.updated;
                    });
                    localStorageService.saveSearchResults(thiz.filteredEntries);
                });
            },
            doFilter(debounceTime) {
                return new Promise(resolve => {
                    if (!thiz.entries) {
                        return resolve();
                    }
                    util.debounce(() => {
                        thiz.filterOptions.limitResults = 50;
                        thiz.filteredEntries = thiz.entries;
                        if (thiz.filterOptions.onlyPossibleDuplicates) {
                            thiz.filteredEntries = entryUtil.getPossibleDuplicates(thiz.entries);
                            return resolve();
                        }
                        if (thiz.filterOptions.onlyIncomplete) {
                            thiz.filteredEntries = thiz.entries.filter(entry => !entryUtil.isValid(entry, thiz.tags));
                            return resolve();
                        }
                        history.pushState(null, null, '#/entries/');
                        if (thiz.filterOptions.updatedBy) {
                            thiz.filteredEntries = thiz.filteredEntries.filter(entry => entry.updatedBy === thiz.filterOptions.updatedBy);
                        }
                        if (thiz.filterOptions.searchText) {
                            history.pushState(null, null, '#/entries/search/' + thiz.filterOptions.searchText);
                            thiz.filteredEntries = entryUtil.filterByText(thiz.filteredEntries, thiz.filterOptions.searchText, thiz.tags);
                        }
                        if (thiz.filterOptions.searchTags.length > 0) {
                            history.pushState(null, null, '#/entries/search/tag/' + thiz.filterOptions.searchTags.reduce((total, current) => total + current + ';', ''));
                            thiz.filteredEntries = entryUtil.filterByTags(thiz.filteredEntries, thiz.filterOptions.searchTags, thiz.filterOptions.joinMode, thiz.tags);
                        }
                        return resolve();
                    }, debounceTime ? debounceTime : 0);
                });
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
        padding: 3px 3px;
        margin: 0 2px;
        width: unset;
        display: inline-block;
        height: 2em;
    }

    .actionBtn:hover {
        color: #495057;
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