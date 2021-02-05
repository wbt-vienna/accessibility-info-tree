<template>
    <div class="container">
        <h2>Begriffe-Übersicht</h2>
        <span v-if="tags">{{tags.length}} Begriffe</span>
        <tag-tree v-if="tags" v-model="selectedTag" :tags="tags"></tag-tree>
    </div>
</template>

<script>
    import $ from 'jquery'
    import {constants} from "../js/util/constants";
    import TagTree from "./tagTree.vue"
    import {dataService} from "../js/service/data/dataService";

    let thiz = null;
    export default {
        components: {TagTree},
        data() {
            return {
                tags: null,
                filteredTags: null,
                selectedTag: null,
                search: '',
                timeoutHandler: null,
                console: console
            }
        },
        methods: {
            searchTags() {
                if (thiz.timeoutHandler) clearTimeout(thiz.timeoutHandler);
                thiz.timeoutHandler = setTimeout(() => {
                    thiz.filteredTags = thiz.tags.filter(tag => tag.id.toLowerCase().includes(thiz.search.toLowerCase()));
                }, 200);

            },
            selectTag(id) {
                thiz.selectedTag = thiz.tags.filter(tag => tag.id === id)[0];
            },
            init() {
                dataService.getTags().then(result => {
                    let tags = JSON.parse(JSON.stringify(result)).tags;
                    thiz.filteredTags = tags;
                    thiz.selectedTag = tags[0];
                    thiz.tags = tags;
                });
            },
            updateHandler(event, changedDoc) {
                if (changedDoc.id === constants.TAGS_DOCUMENT_ID) {
                    thiz.init();
                }
            }
        },
        mounted() {
            thiz = this;
            thiz.init();
            $(document).on(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
        },
        beforeDestroy() {
            $(document).off(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
        },
    }
</script>

<style scoped>
</style>