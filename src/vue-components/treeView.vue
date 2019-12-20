<template>
    <div>
        <div id="tree" style="margin-top: 2em" v-if="tags">
            <div>
                <a href="javascript:;" @click="selectTag('EVERYTHING')">Zeige ganzen Baum</a>
            </div>
            <div>
                <span>Unterbaum nach: </span>
                <span v-if="selectedTag.parents.length > 1">(</span>
                <span v-for="(parent, index) in selectedTag.parents">
                <span v-if="index > 0">, </span>
                <a href="javascript:;" @click="selectTag(parent)">{{parent}}</a>
            </span>
                <span v-if="selectedTag.parents.length > 1">)</span>
                <span v-if="selectedTag.parents.length > 0"> -> </span>
                <span>{{selectedTag.id}}</span>
            </div>
            <tree-item v-if="selectedTag" :tags="tags" :item="selectedTag" :select-tag-fn="selectTag"/>
        </div>

        <h2>Tag-Suche</h2>
        <input type="text" v-model="search" @input="searchTags"/>
        <div>
            <span v-for="tag in filteredTags"><a href="javascript:;" @click="selectTag(tag.id)">{{tag.id}} </a></span>
        </div>
    </div>
</template>

<script>
    import TreeItem from "./treeItem.vue"
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";

    let thiz = null;
    export default {
        components: {TreeItem},
        data() {
            return {
                tags: null,
                filteredTags: null,
                selectedTag: null,
                selectedTagChildren: null,
                search: '',
                timeoutHandler: null
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


                function getChildren(item) {
                    if (!item) return;

                }
            },
            getTag(tagId) {
                return thiz.tags.filter(tag => tag.id === tagId)[0];
            }
        },
        mounted() {
            thiz = this;
            if (!databaseService.isLoggedIn()) {
                return thiz.$router.push('/login');
            }
            dataService.getTags().then(result => {
                let tags = JSON.parse(JSON.stringify(result)).tags;
                thiz.filteredTags = tags;
                thiz.selectedTag = tags[0];
                thiz.tags = tags;
                console.log(tags);
            })
        }
    }
</script>

<style scoped>
</style>