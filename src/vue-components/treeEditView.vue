<template>
    <div>
        <h2>Tag-Baum bearbeiten</h2>
        <tag-tree v-if="tags" v-model="selectedTag" :tags="tags" :actions="actions"></tag-tree>
    </div>
</template>

<script>
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
            }
        },
        mounted() {
            thiz = this;
            if (!databaseService.isLoggedInReadWrite()) {
                return thiz.$router.push('/login');
            }
            dataService.getTags().then(result => {
                let tags = JSON.parse(JSON.stringify(result)).tags;
                thiz.selectedTag = tags[0];
                thiz.tags = tags;
            });
        }
    }
</script>

<style scoped>
</style>