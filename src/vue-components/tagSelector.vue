<template>
    <div class="row">
        <div class="col-md-4">
            Gewählte Tags <a href="javascript:;" @click="removeAll">alle löschen</a>
            <div>
                <button class="tagButton" @click="removeTag(tagId)" v-for="tagId in elementTags"><i class="fas fa-times"></i> {{tagUtil.getLabel(tagId, tags)}}</button>
                <span v-if="elementTags.length === 0">(keine)</span>
            </div>
        </div>
        <div class="col-md-8">
            Tags wählen <a href="javascript:;" @click="selectTags = startTags">alle anzeigen</a>
            <div>
                <button class="tagButton" @click="addTag(tag.id)" v-for="tag in selectTags"><i class="fas fa-plus"></i> {{tag.label.de}}</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {tagUtil} from "../js/util/tagUtil";

    let thiz = null;
    export default {
        props: {
            value: Array,
            tags: Array,
            startTagId: String
        },
        watch: {
            value: {
                handler(val){
                    thiz.elementTags = val;
                },
                deep: true
            },
            tags: {
                handler(val){
                    thiz.startTags = thiz.selectTags = tagUtil.getAllChildren(thiz.startTagId, val, 1);
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
                let parentIds = tagUtil.getAllParentIds(tagId, thiz.tags, 1);
                let childIds = tagUtil.getAllChildIds(tagId, thiz.tags);
                let hasAlreadyChild = childIds.reduce((total, currentId) => {
                    return thiz.elementTags.indexOf(currentId) !== -1;
                }, false);
                if (!hasAlreadyChild) {
                    thiz.elementTags.push(tagId);
                }
                thiz.elementTags = thiz.elementTags.filter(existingId => parentIds.indexOf(existingId) === -1);
                thiz.selectTags = tagUtil.getAllChildren(tagId, thiz.tags, 1);
                if (thiz.selectTags.length === 0) {
                    thiz.selectTags = thiz.startTags;
                }
                thiz.elementTags = [...new Set(thiz.elementTags)];
                thiz.emitChange();
            },
            removeTag(tagId) {
                thiz.elementTags = thiz.elementTags.filter(existingId => tagId !== existingId);
                thiz.emitChange();
            },
            removeAll() {
                thiz.selectTags = thiz.startTags;
                thiz.elementTags = [];
                thiz.emitChange();
            },
            emitChange() {
                thiz.$emit('input', thiz.elementTags);
                thiz.$emit('change', thiz.elementTags);
            }
        },
        beforeCreate() {
            thiz = this;
        },
        mounted() {
            thiz.startTags = thiz.selectTags = tagUtil.getAllChildren(thiz.startTagId, thiz.tags, 1);
        }
    }
</script>

<style scoped>
    .tagButton {
        padding: 0 5px 0 5px;
        margin: 2px;
    }
</style>