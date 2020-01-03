<template>
    <div>
        <h2>Tags bearbeiten</h2>
        <tag-tree v-if="tags" v-model="selectedTag" :tags="tags" :actions="actions"></tag-tree>
    </div>
</template>

<script>
    import $ from 'jquery'
    import {constants} from "../js/util/constants";
    import TagTree from "./tagTree.vue"
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";

    let thiz = null;
    export default {
        components: {TagTree},
        data() {
            return {
                tags: null,
                selectedTag: null,
                actions: [
                    {
                        icon: 'fas fa-pencil-alt',
                        fn: function(id) {
                            thiz.toEditTag(id)
                        }
                    }
                ]
            }
        },
        methods: {
            toEditTag(id) {
                id = id || thiz.selectedTag.id;
                thiz.$router.push('/tag/edit/' + id);
            },
            init() {
                if (!databaseService.isLoggedInReadWrite()) {
                    return thiz.$router.push('/login');
                }
                dataService.getTags().then(result => {
                    let tags = JSON.parse(JSON.stringify(result)).tags;
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