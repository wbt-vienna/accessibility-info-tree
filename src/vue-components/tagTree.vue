<template>
    <div id="tree" v-if="tags">
        <div>
            <a href="javascript:;" @click="selectTag('EVERYTHING')">Zeige ganze Übersicht</a>
        </div>
        <div style="margin-bottom: 1em">
            <span>Unterbaum nach: </span>
            <span v-if="value.parents.length > 1">(</span>
            <span v-for="(parent, index) in value.parents">
                <span v-if="index > 0">, </span>
                <a href="javascript:;" @click="selectTag(parent)">{{getLabel(parent)}}</a>
            </span>
            <span v-if="value.parents.length > 1">)</span>
            <span v-if="value.parents.length > 0"> -> </span>
            <span>{{getLabel(value.id)}}</span>
        </div>
        <tree-item v-if="value" :tags="tags" :item="value" :select-tag-fn="selectTag" :actions="actions" :max-depth="maxDepth"/>
    </div>
</template>

<script>
    import TreeItem from "./treeItem.vue"
    import {tagUtil} from "../js/util/tagUtil";

    let thiz = null;
    export default {
        props: {
            value: Object,
            tags: Array,
            actions: Array
        },
        components: {TreeItem},
        data() {
            return {
                maxDepth: null
            }
        },
        methods: {
            selectTag(id) {
                let value = thiz.tags.filter(tag => tag.id === id)[0];
                this.$emit('input', value);
                this.$emit('change', value);
            },
            getLabel(id) {
                return tagUtil.getLabel(id, thiz.tags);
            }
        },
        beforeCreate() {
            thiz = this;
        },
        mounted() {
            thiz.maxDepth = tagUtil.getTagsDepth(thiz.tags);
        }
    }
</script>

<style scoped>
</style>