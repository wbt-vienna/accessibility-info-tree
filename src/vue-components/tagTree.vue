<template>
    <div id="tree" v-if="tags">
        <div>
            <a href="javascript:;" @click="selectTag('EVERYTHING')">Zeige ganzen Baum</a>
        </div>
        <div>
            <span>Unterbaum nach: </span>
            <span v-if="value.parents.length > 1">(</span>
            <span v-for="(parent, index) in value.parents">
            <span v-if="index > 0">, </span>
            <a href="javascript:;" @click="selectTag(parent)">{{parent}}</a>
        </span>
            <span v-if="value.parents.length > 1">)</span>
            <span v-if="value.parents.length > 0"> -> </span>
            <span>{{value.id}}</span>
        </div>
        <tree-item v-if="value" :tags="tags" :item="value" :select-tag-fn="selectTag"/>
    </div>
</template>

<script>
    import TreeItem from "./treeItem.vue"

    let thiz = null;
    export default {
        props: {
            value: Object,
            tags: Array
        },
        components: {TreeItem},
        data() {
            return {
            }
        },
        methods: {
            selectTag(id) {
                let value = thiz.tags.filter(tag => tag.id === id)[0];
                this.$emit('input', value);
                this.$emit('change', value);
            }
        },
        mounted() {
            thiz = this;
        }
    }
</script>

<style scoped>
</style>