<template>
    <div v-if="item" style=";">
        <div v-for="childId in item.children" style="display: flex; align-items: center; border: 1px solid gray;">
            <div class="treeText" :style="getStyle(childId)">
                <button v-for="action in actions" style="padding: 0; margin: 0 2px;" @click="action.fn(childId, item.id)" :title="action.title" v-show="action.show ? action.show(childId) : true"><i :class="action.icon"/></button>
                <a v-if="getTag(childId).children.length > 0" href="javascript:;" @click="selectTagFn(childId)">{{getLabel(childId)}}</a>
                <span v-else>{{getLabel(childId)}}</span>
            </div>
            <tree-item v-if="getTag(childId).children.length > 0" style="flex: 1 1 auto;" :item="getTag(childId)" :depth="currentDepth" :select-tag-fn="selectTagFn" :tags="tags" :actions="actions" :max-depth="maxDepth"></tree-item>
        </div>
    </div>
</template>

<script>
    import {tagUtil} from "../js/util/tagUtil";

    export default {
        name: 'tree-item',
        props: {
            'item': Object,
            'depth': Number,
            'selectTagFn': Function,
            'tags': Array,
            actions: Array,
            maxDepth: Number
        },
        data: function () {
            return {
                currentDepth: this.depth ? this.depth + 1 : 1,
                hasChildren: this.item.children.length > 0
            }
        },
        methods: {
            getTag(id) {
                return this.tags.filter(tag => tag.id === id)[0];
            },
            getLabel(id) {
                return tagUtil.getLabel(id, this.tags);
            },
            getStyle(tagId) {
                return this.getTag(tagId).children.length > 0 ? `width: ${90/this.maxDepth}vw;` : 'width: 100%;';
            },
        },
        mounted() {
        },
    }
</script>

<style scoped>
    .treeText {
        text-overflow: clip;
        overflow: hidden;
        padding-left: 5px;
        font-size: 1em;
    }

    @media (max-width: 1000px) {
        .treeText {
            font-size: 1.5vw !important;
        }
    }
</style>