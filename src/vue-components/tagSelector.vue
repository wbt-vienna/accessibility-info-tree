<template>
    <div class="row">
        <div class="col-md-4">
            Gewählte Tags <a href="javascript:;" @click="removeAll">alle löschen</a>
            <div>
                <button class="tagButton" @click="removeTag(tagId)" v-for="tagId in relevantTags" :style="tagUtil.getColorStyle(tagId, tags)"><i class="fas fa-times"></i> {{tagUtil.getLabel(tagId, tags)}}</button>
                <span v-if="relevantTags.length === 0">(keine)</span>
            </div>
        </div>
        <div class="col-md-8">
            Tags wählen <input v-if="showSearchBar" v-model="searchText" @input="searchChanged()" type="search" placeholder="Tag suchen" style="height: 1.5em;"/> <a href="javascript:;" @click="showAll()">alle anzeigen</a>
            <div>
                <button class="tagButton" @click="addTag(tag.id)" v-for="tag in selectTags" :style="tagUtil.getColorStyle(tag.id, tags)">
                    <i class="fas fa-plus"></i> {{tag.label.de}}
                </button>
            </div>
            <div v-if="additionalTags.length > 0">
                Kinder:
                <button class="tagButton" @click="addTag(tag.id)" v-for="tag in additionalTags" :style="tagUtil.getColorStyle(tag.id, tags, selectTags.map(t => t.id))"><i class="fas fa-plus"></i> {{tag.label.de}}</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {tagUtil} from "../js/util/tagUtil";

    export default {
        props: {
            value: Array,
            tags: Array,
            startTagIds: Array | String,
            respectAssignable: Boolean,
            showSearchBar: Boolean
        },
        watch: {
            value: {
                handler(val){
                    this.elementTags = val;
                },
                deep: true
            },
            tags: {
                handler(val){
                    this.startTags = this.selectTags = tagUtil.getAllChildren(this.startTagIds, val, 1);
                    this.allChildren = tagUtil.getAllChildIds(this.startTagIds, val);
                },
                deep: true
            },
        },
        computed: {
            relevantTags: function () {
                return this.elementTags.filter(tag => this.allChildren.indexOf(tag) !== -1);
            }
        },
        data() {
            return {
                elementTags: this.value,
                startTags: null,
                selectTags: null,
                additionalTags: [],
                allChildren: [],
                searchText: '',
                tagUtil: tagUtil
            }
        },
        methods: {
            addTag(tagId, fromExternal) {
                this.searchText = '';
                this.additionalTags = [];
                if (this.allChildren.indexOf(tagId) === -1) {
                    return;
                }
                let parentIds = tagUtil.getAllParentIds(tagId, this.tags);
                let childIds = tagUtil.getAllChildIds(tagId, this.tags);
                let hasAlreadyChild = childIds.reduce((total, currentId) => {
                    return total || this.elementTags.indexOf(currentId) !== -1;
                }, false);
                if (!hasAlreadyChild && (!this.respectAssignable || !tagUtil.getTag(tagId, this.tags).notAssignable)) {
                    this.elementTags.push(tagId);
                }
                this.elementTags = this.elementTags.filter(existingId => parentIds.indexOf(existingId) === -1);
                this.additionalTags = tagUtil.getAllChildren(tagId, this.tags, 1);
                this.selectTags = this.additionalTags.length > 0 ? [tagUtil.getTag(tagId, this.tags)] : [];
                if (fromExternal || this.selectTags.length === 0) {
                    this.resetSelectTags();
                }
                this.elementTags = [...new Set(this.elementTags)];
                this.elementTags.sort();
                this.emitChange();
            },
            removeTag(tagId) {
                this.elementTags = this.elementTags.filter(existingId => tagId !== existingId);
                if (this.relevantTags.length === 0) {
                    this.resetSelectTags();
                }
                this.emitChange();
            },
            removeAll() {
                this.resetSelectTags();
                this.elementTags = this.elementTags.filter(tagId => this.relevantTags.indexOf(tagId) === -1);
                this.emitChange();
            },
            resetSelectTags() {
                this.selectTags = this.startTags;
                this.additionalTags = [];
            },
            searchChanged() {
                if (this.searchText.length < 3) {
                    this.resetSelectTags();
                    return;
                }
                let allTags = tagUtil.getAllChildren(this.startTags, this.tags, null, true).concat(this.startTags);
                this.selectTags = allTags.filter(tag => {
                    let label = tagUtil.getLabel(tag, this.tags).toLowerCase();
                    return label.indexOf(this.searchText.toLowerCase()) !== -1;
                });
                this.selectTags.sort((a, b) => {
                    if (!a.depth) {
                        return -1;
                    }
                    return a.depth - b.depth;
                });
                this.selectTags = [...new Set(this.selectTags)];
                this.additionalTags = [];
                if (this.selectTags.length < 4) {
                    this.additionalTags = tagUtil.getAllChildren(this.selectTags, this.tags, 1);
                }
                this.selectTags = this.selectTags.filter(t => this.additionalTags.indexOf(t) === -1);
            },
            showAll() {
                this.resetSelectTags();
                this.searchText = '';
            },
            emitChange() {
                this.$emit('input', this.elementTags);
                this.$emit('change', this.elementTags);
            }
        },
        mounted() {
            this.startTags = this.selectTags = tagUtil.getAllChildren(this.startTagIds, this.tags, 1);
            this.allChildren = tagUtil.getAllChildIds(this.startTagIds, this.tags);
            this.elementTags.sort();
        }
    }
</script>

<style scoped>
    .tagButton {
        padding: 0 5px 0 5px;
        margin: 2px;
    }

    .row {
        margin-top: 0 !important;
        margin-bottom: 0.5em;
    }
</style>