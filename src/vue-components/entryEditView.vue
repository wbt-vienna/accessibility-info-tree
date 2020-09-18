<template>
    <div v-if="editEntry" @keydown.esc="$router.push('/entries')" @keydown.ctrl.enter="save()" @keydown.ctrl.right="next()" @keydown.ctrl.left="previous()">
        <div class="row">
            <h2>Eintrag {{isNew ? 'hinzufügen' : 'bearbeiten'}}</h2>
            <div v-if="!isNew" style="display: flex; align-items: center; margin-left: 1em">
                <i v-if="valid" title="aktueller Eintrag enthält alle Pflichtfelder" class="fas fa-check" style="color: green"/>
                <i v-if="!valid" title="aktueller Eintrag enthält nicht alle Pflichtfelder" class="fas fa-times" style="color: red"/>
            </div>
            <div v-if="!isNew && (previousEntry || nextEntry)" style="display: flex; justify-content: flex-end; flex-grow: 1">
                <button :disabled="!previousEntry" @click="previous()"><i class="fas fa-arrow-left"></i></button>
                <button :disabled="!nextEntry" @click="next()"><i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
        <div class="row">
            <label class="col-md-3" for="inputHeader">Überschrift*</label>
            <input type="text" class="col-md-6" id="inputHeader" v-model="editEntry.header" v-focus autocomplete="off" maxlength="80" @input="recomputeSimilar()"/>
        </div>
        <div class="row">
            <label class="col-md-3" for="linkInput">Link</label>
            <input type="text" class="col-md-6" id="linkInput" v-model="editEntry.link" autocomplete="off" @input="recomputeSimilar()"/>
            <span class="col-md-2" v-if="editEntry.link && editEntry.link.indexOf('http') !== 0" style="display:flex; align-items: center; color: red">muss mit http oder https beginnen!</span>
        </div>
        <div class="row" v-if="existingSimilar.length > 0">
            <label class="col-md-3" for="existingEntries" style="font-weight: normal; font-style: italic">Bereits existierende Einträge</label>
            <ul id="existingEntries" style="list-style-type: none; padding-left: 0" class="col-md-8">
                <li v-for="entry in existingSimilar">
                    <a :href="entry.link" target="_blank">{{entry.header}}</a>
                    <button class="tagButton" @click="addTag(tagId)" v-for="tagId in entry.tags" :style="tagUtil.getColorStyle(tagId, tags)" v-html="tagUtil.getLabel(tagId, tags)">
                    </button>
                </li>
            </ul>
        </div>
        <div class="row">
            <label class="col-md-3" for="shortInput">Kurzbeschreibung*</label>
            <textarea class="col-md-6" id="shortInput" v-model="editEntry.short" maxlength="500"/>
        </div>
        <div class="row" v-for="(startTag, index) in mandatoryTags">
            <label class="col-md-3" :for="'inputTags' + index" style="align-items: initial;">{{tagUtil.getLabel(startTag, tags)}}*</label>
            <div class="col-md-8" :id="'inputTags' + index">
                <tag-selector :start-tag-ids="startTag" :tags="tags" v-model="editEntry.tags" :respect-assignable="true" :show-search-bar="startTag.id === 'ACCESSIBILITY'" :ref="'tagSelector' + index" @change="recompute()"></tag-selector>
            </div>
        </div>
        <div class="row" v-show="optionalTags.length > 0">
            <label class="col-md-3" for="optionalTags" style="align-items: initial;">Optionale Tags</label>
            <div class="col-md-8" id="optionalTags">
                <tag-selector :start-tag-ids="optionalTags" :tags="tags" v-model="editEntry.tags" :respect-assignable="true" ref="tagSelectorOptional" @change="recompute()"></tag-selector>
            </div>
        </div>
        <div class="row" style="margin-top: 1.5em">
            <label class="col-md-3" for="updatedBy">{{isNew ? 'Erstellt von*' : 'Aktualisiert von*'}}</label>
            <input type="text" class="col-md-3" id="updatedBy" v-model="editEntry.updatedBy" autocomplete="off" maxlength="15" placeholder="z.B. Vorname / Namenskürzel"/>
            <span class="col-md-3" v-if="lastUpdatedBy && lastUpdatedBy !== editEntry.updatedBy">(zuvor: {{lastUpdatedBy}})</span>
        </div>
        <div class="row">
            <span class="col-md-3 offset-md-3">Pflichtfelder sind mit * gekennzeichnet.</span>
        </div>
        <div class="row" style="margin-top: 2em">
            <button class="col-md-8 offset-md-3" @click="$router.push('/entries/')"><i class="fas fa-times"></i> Abbrechen [ESC]</button>
        </div>
        <div class="row">
            <button class="col-md-8 offset-md-3" :disabled="!valid" @click="save()"><i class="fas fa-check"></i> Eintrag speichern und zur Liste [Strg + ENTER]</button>
        </div>
        <div class="row" v-if="!isNew && (previousEntry || nextEntry)">
            <button class="col-md-4 offset-md-3" :disabled="!previousEntry" @click="previous()"><i class="fas fa-arrow-left"></i> voriger Eintrag [Strg + Links]</button>
            <button class="col-md-4" :disabled="!nextEntry" @click="next()">nächster Eintrag [Strg + Rechts] <i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
</template>

<script>
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";
    import {Entry} from "../js/model/Entry";
    import TagSelector from "./tagSelector.vue"
    import {constants} from "../js/util/constants";
    import {localStorageService} from "../js/service/data/localStorageService";
    import {util} from "../js/util/util";
    import {entryUtil} from "../js/util/entryUtil";

    let thiz = null;
    export default {
        components: {TagSelector},
        data() {
            return {
                tags: null,
                mandatoryTags: [],
                optionalTags: [],
                entries: null,
                editEntry: null,
                originalEditEntryJSON: null,
                lastUpdatedBy: "",
                isNew: false,
                recomputeProperty: 0,
                existingSimilar: [],
                lastSearchResults: localStorageService.getSearchResults(),
                tagUtil: tagUtil,
                constants: constants
            }
        },
        computed: {
            valid: function () {
                thiz.recomputeProperty--;
                return entryUtil.isValid(this.editEntry, this.tags);
            },
            nextEntry: function() {
                if (!this.lastSearchResults) {
                    return null;
                }
                return this.lastSearchResults.reduce((total, current, index) => {
                    let candidate = current.id === thiz.editEntry.id ? this.lastSearchResults[index + 1] : null;
                    return total ? total : candidate;
                }, null);
            },
            previousEntry: function() {
                if (!this.lastSearchResults) {
                    return null;
                }
                return this.lastSearchResults.reduce((total, current, index) => {
                    let candidate = current.id === thiz.editEntry.id ? this.lastSearchResults[index - 1] : null;
                    return total ? total : candidate;
                }, null);
            }
        },
        methods: {
            init() {
                thiz.existingSimilar = [];
                if (!databaseService.isLoggedInReadWrite()) {
                    return thiz.$router.push('/login');
                }
                return dataService.getEntries().then(entries => {
                    thiz.entries = entries;
                    return dataService.getTags().then(result => {
                        let tags = JSON.parse(JSON.stringify(result)).tags;
                        thiz.mandatoryTags = tagUtil.getTagsWithProperty('mandatory', tags);
                        thiz.optionalTags = tagUtil.getTagsWithProperty('optional', tags);
                        thiz.tags = tags;
                        dataService.getEntry(thiz.$route.params.editid).then(result => {
                            thiz.isNew = !result;
                            thiz.editEntry = result ? JSON.parse(JSON.stringify(result)) : new Entry();
                            thiz.lastUpdatedBy = thiz.editEntry.updatedBy;
                            thiz.editEntry.updatedBy = localStorageService.getUser() || "";
                            thiz.originalEditEntryJSON = JSON.stringify(thiz.editEntry);
                            thiz.recomputeSimilar(0);
                            thiz.$nextTick(() => {
                                thiz.recompute();
                            });
                        });
                        return Promise.resolve();
                    });
                });
            },
            save() {
                if (!thiz.valid) {
                    return;
                }
                thiz.saveInternal().then(() => {
                    thiz.$router.push('/entries/');
                });
            },
            next() {
                thiz.navigateToEntry(thiz.nextEntry);
            },
            previous() {
                thiz.navigateToEntry(thiz.previousEntry);
            },
            navigateToEntry(entry) {
                if (!entry) {
                    return;
                }
                if (!thiz.valid) {
                    return navigateTo(entry.id);
                }
                thiz.saveInternal().then(() => {
                    navigateTo(entry.id);
                });
                function navigateTo(id) {
                    thiz.$router.push('/entry/edit/' + id);
                    thiz.init();
                }
            },
            saveInternal() {
                if (!thiz.valid) {
                    return Promise.resolve();
                }
                thiz.editEntry = entryUtil.sortTags(thiz.editEntry, thiz.tags);
                if (thiz.originalEditEntryJSON === JSON.stringify(thiz.editEntry)) {
                    return Promise.resolve();
                }
                if (!thiz.isNew) {
                    thiz.editEntry.updated = new Date().getTime();
                }
                if (!thiz.editEntry.link) {
                    thiz.editEntry.link = 'https://www.google.com/search?q=' + thiz.editEntry.header;
                }
                localStorageService.saveUser(thiz.editEntry.updatedBy);
                return dataService.saveEntry(thiz.editEntry);
            },
            recomputeSimilar(timeout) {
                util.debounce(() => {
                    thiz.existingSimilar = entryUtil.getSimilar(thiz.editEntry, thiz.entries);
                }, timeout ? timeout : 500, "recompute");
            },
            addTag(tagId) {
                thiz.$refs['tagSelectorOptional'].addTag(tagId, true);
                thiz.mandatoryTags.forEach((mandatoryTag, index) => {
                    thiz.$refs['tagSelector' + index][0].addTag(tagId, true);
                });
            },
            recompute() {
                thiz.recomputeProperty++;
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
        align-items: center;
    }

    .row span {
        display: flex;
        align-items: center;
    }

    .row {
        margin-top: 0.5em;
    }

    button {
        padding-top: 0.5em;
        padding-bottom: 0.5em;
    }

    .input-error {
        display: flex;
        align-items: center;
        color: red;
    }

    .tagButton {
        font-size: 0.6em;
        padding: 0 2px 0 2px;
        margin: 0 2px;
    }
</style>