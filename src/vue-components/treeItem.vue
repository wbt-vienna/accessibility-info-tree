<template>
    <div v-if="item" style=";">
        <div v-for="childId in item.children" style="display: flex; align-items: center; border: 1px solid gray;">
            <div class="treeText" :style="getTextStyle(childId)">
                <a v-if="getTag(childId).children.length > 0" href="javascript:;" @click="selectTagFn(childId)">{{childId}}</a>
                <span v-else>{{childId}}</span>
            </div>
            <tree-item v-if="getTag(childId).children.length > 0" style="flex: 1 1 auto;" :item="getTag(childId)" :depth="currentDepth" :select-tag-fn="selectTagFn" :tags="tags"></tree-item>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'tree-item',
        props: {
            'item': Object,
            'depth': Number,
            'selectTagFn': Function,
            'tags': Array
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
            getTextStyle(tagId) {
                return this.getTag(tagId).children.length > 0 ? 'width: 30%;' : 'width: 100%;';
            }
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