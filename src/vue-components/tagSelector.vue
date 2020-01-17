<template>
    <div class="row">
        <div class="col-md-4">
            Gewählte Tags <a href="javascript:;" @click="removeAll">alle löschen</a>
            <div>
                <button class="tagButton" @click="removeTag(tagId)" v-for="tagId in elementTags" :style="tagUtil.getColorStyle(tagId, tags)"><i class="fas fa-times"></i> {{tagUtil.getLabel(tagId, tags)}}</button>
                <span v-if="elementTags.length === 0">(keine)</span>
            </div>
        </div>
        <div class="col-md-8">
            Tags wählen <a href="javascript:;" @click="selectTags = startTags">alle anzeigen</a>
            <div>
                <button class="tagButton" @click="addTag(tag.id)" v-for="tag in selectTags" :style="tagUtil.getColorStyle(tag.id, tags)"><i class="fas fa-plus"></i> {{tag.label.de}}</button>
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
            startTagId: String
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
                    this.startTags = this.selectTags = tagUtil.getAllChildren(this.startTagId, val, 1);
                },
                deep: true
            },
        },
        data() {
            return {
                elementTags: this.value,
                startTags: null,
                selectTags: null,
                tagUtil: tagUtil
            }
        },
        methods: {
            addTag(tagId) {
                let parentIds = tagUtil.getAllParentIds(tagId, this.tags, 1);
                let childIds = tagUtil.getAllChildIds(tagId, this.tags);
                let hasAlreadyChild = childIds.reduce((total, currentId) => {
                    return total || this.elementTags.indexOf(currentId) !== -1;
                }, false);
                if (!hasAlreadyChild) {
                    this.elementTags.push(tagId);
                }
                this.elementTags = this.elementTags.filter(existingId => parentIds.indexOf(existingId) === -1);
                this.selectTags = tagUtil.getAllChildren(tagId, this.tags, 1);
                if (this.selectTags.length === 0) {
                    this.selectTags = this.startTags;
                }
                this.elementTags = [...new Set(this.elementTags)];
                this.emitChange();
            },
            removeTag(tagId) {
                this.elementTags = this.elementTags.filter(existingId => tagId !== existingId);
                if (this.elementTags.length === 0) {
                    this.selectTags = this.startTags;
                }
                this.emitChange();
            },
            removeAll() {
                this.selectTags = this.startTags;
                this.elementTags = [];
                this.emitChange();
            },
            emitChange() {
                this.$emit('input', this.elementTags);
                this.$emit('change', this.elementTags);
            }
        },
        mounted() {
            this.startTags = this.selectTags = tagUtil.getAllChildren(this.startTagId, this.tags, 1);
        }
    }
</script>

<style scoped>
    .tagButton {
        padding: 0 5px 0 5px;
        margin: 2px;
    }
</style>