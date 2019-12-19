<template>
    <div>
        <div v-if="selectedTag" class="container">
            <div class="row">
                <label class="col-md-2" for="currentParents">Eltern</label>
                <span class="col-md-10" id="currentParents">
                <a v-for="tag in selectedTag.parents" href="javascript:;" @click="selectTag(tag)">{{tag}}</a>
                <span v-if="selectedTag.parents.length === 0">(keine)</span>
            </span>
            </div>
            <div class="row">
                <label class="col-md-2" for="currenTag">aktuelle Auswahl</label>
                <span class="col-md-10" id="currenTag">{{selectedTag.id}}</span>
            </div>
            <div class="row">
                <label class="col-md-2" for="currentChildren">Kinder</label>
                <span class="col-md-10" id="currentChildren">
                <a v-for="tag in selectedTag.children" href="javascript:;" @click="selectTag(tag)">{{tag}} </a>
            </span>
            </div>
        </div>

        <div id="tree" style="margin-top: 2em">
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
            <tree-item v-if="selectedTag" :item="selectedTag" :select-tag-fn="selectTag"/>
        </div>


        <input type="text" v-model="search" @input="searchTags"/>
        <div>
            <span v-for="tag in filteredTags"><a href="javascript:;" @click="selectTag(tag.id)">{{tag.id}}</a>&nbsp;</span>
        </div>
    </div>
</template>

<script>
    import TreeItem from "./treeItem.vue"

    let thiz = null;
    export default {
        components: {TreeItem},
        data() {
            return {
                tags: window.TAGS,
                filteredTags: window.TAGS,
                selectedTag: window.TAGS[2],
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
            console.log(this.selectedTag);
            thiz = this;
        }
    }
</script>

<style scoped>
</style>