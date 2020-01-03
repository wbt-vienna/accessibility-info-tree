<template>
    <div>
        <h2>Tags bearbeiten</h2>
        <tag-tree v-if="tags" v-model="selectedTag" :tags="tags" :actions="actions"></tag-tree>
        <notification-bar ref="notificationBar"></notification-bar>
    </div>
</template>

<script>
    import $ from 'jquery'
    import {constants} from "../js/util/constants";
    import TagTree from "./tagTree.vue"
    import NotificationBar from "./notificationBar.vue"
    import {dataService} from "../js/service/data/dataService";
    import {databaseService} from "../js/service/data/databaseService";
    import {tagUtil} from "../js/util/tagUtil";

    let thiz = null;
    export default {
        components: {TagTree, NotificationBar},
        data() {
            return {
                tags: null,
                selectedTag: null,
                moveMode: false,
                moveId: null,
                moveParent: null,
                moveTargetIdsChild: null,
                moveTargetIdsSibling: null,
                actions: [
                    {
                        icon: 'fas fa-pencil-alt',
                        title: 'Tag Bearbeiten',
                        fn: function(id) {
                            thiz.toEditTag(id)
                        },
                        show: () => !thiz.moveMode
                    },
                    {
                        icon: 'fas fa-arrows-alt',
                        title: 'Tag verschieben',
                        fn: function(id, parentId) {
                            thiz.moveMode = true;
                            thiz.moveId = id;
                            thiz.moveParent = parentId;
                            let invalidMoveTargetIds = tagUtil.getAllChildIds(thiz.moveId, thiz.tags);
                            thiz.moveTargetIdsChild = thiz.tags.filter(tag => invalidMoveTargetIds.indexOf(tag.id) === -1 && tag.id !== thiz.moveParent).map(tag => tag.id);
                            thiz.moveTargetIdsSibling = thiz.tags.filter(tag => invalidMoveTargetIds.indexOf(tag.id) === -1).map(tag => tag.id);
                            thiz.$refs.notificationBar.setTooltip(`Verschiebe Tag '${tagUtil.getLabel(thiz.moveId, thiz.tags)}'. Ziel wählen oder Abbruch mit [ESC].`);
                        },
                        show: () => !thiz.moveMode
                    },
                    {
                        icon: 'fas fa-arrow-down',
                        title: 'gewählten Tag als Geschwisterknoten dieses Knotens einfügen',
                        fn: function(id, parentId) {
                            if (id === thiz.moveId) {
                                thiz.endMoveMode();
                                return;
                            }
                            let targetTag = tagUtil.getTag(id, thiz.tags);
                            let moveTag = tagUtil.getTag(thiz.moveId, thiz.tags);
                            let moveParentTag = tagUtil.getTag(thiz.moveParent, thiz.tags);
                            moveParentTag.children = moveParentTag.children.filter(childID => childID !== moveTag.id);
                            moveTag.parents = moveTag.parents.filter(parentID => parentID !== moveParentTag.id);

                            let targetParentTag = tagUtil.getTag(parentId, thiz.tags);
                            targetParentTag.children.push(moveTag.id);
                            moveTag.parents.push(parentId);
                            moveTag.parents.sort();
                            targetParentTag.children.sort();
                            thiz.endMoveMode();
                        },
                        show: (id) => thiz.moveMode && thiz.moveTargetIdsSibling.indexOf(id) !== -1
                    },
                    {
                        icon: 'fas fa-arrow-right',
                        title: 'gewählten Tag als Kind dieses Knotens einfügen',
                        fn: function(id) {
                            if (id === thiz.moveId) {
                                thiz.endMoveMode();
                                return;
                            }
                            let targetTag = tagUtil.getTag(id, thiz.tags);
                            let moveTag = tagUtil.getTag(thiz.moveId, thiz.tags);
                            let moveParentTag = tagUtil.getTag(thiz.moveParent, thiz.tags);
                            moveParentTag.children = moveParentTag.children.filter(childID => childID !== moveTag.id);
                            moveTag.parents = moveTag.parents.filter(parentID => parentID !== moveParentTag.id);
                            targetTag.children.push(moveTag.id);
                            moveTag.parents.push(targetTag.id);
                            targetTag.children = tagUtil.sortTags(targetTag.children, thiz.tags, true);
                            moveTag.parents = tagUtil.sortTags(moveTag.parents, thiz.tags, true);
                            thiz.endMoveMode();
                        },
                        show: (id) => thiz.moveMode && thiz.moveTargetIdsChild.indexOf(id) !== -1
                    },
                    {
                        icon: 'fas fa-trash-alt',
                        title: 'Tag Löschen',
                        fn: function(id) {
                            thiz.toEditTag(id)
                        },
                        show: () => !thiz.moveMode
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
            },
            endMoveMode() {
                thiz.moveMode = false;
                thiz.$refs.notificationBar.clearTooltip()
            },
            keyListener(event) {
                let keycode = event.keyCode || event.which;
                if (keycode === 27) { //ESC
                    thiz.endMoveMode();
                }
            }
        },
        mounted() {
            thiz = this;
            thiz.init();
            $(document).on(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
            window.addEventListener('keydown', thiz.keyListener);
        },
        beforeDestroy() {
            $(document).off(constants.EVENT_DB_PULL_UPDATED, thiz.updateHandler);
            window.removeEventListener('keydown', thiz.keyListener);
        },
    }
</script>

<style scoped>
</style>