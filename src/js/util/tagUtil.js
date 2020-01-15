let tagUtil = {};

/**
 * retrieves a tag object
 * @param tagIdOrTag the ID of the tag object or the tag object
 * @param tags array of all tag objects
 * @return {null|{id}|*} tagIdOrTag if it already is a tag object, otherwise the object with the given ID from the tags array parameter
 */
tagUtil.getTag = function (tagIdOrTag, tags) {
    if (tagIdOrTag && tagIdOrTag.id) {
        return tagIdOrTag;
    }
    if (tags && typeof tagIdOrTag === 'string' || tagIdOrTag instanceof String) {
        return tags.filter(tag => tag.id === tagIdOrTag)[0];
    }
    return null
};

tagUtil.getAllChildren = function (tagIdOrTag, tags) {
    return getAll(tagIdOrTag, tags, true);
};

tagUtil.getAllParents = function (tagIdOrTag, tags) {
    return getAll(tagIdOrTag, tags, false);
};

tagUtil.getAllChildIds = function (tagIdOrTag, tags) {
    return tagUtil.getAllChildren(tagIdOrTag, tags).map(child => child.id);
};

tagUtil.getAllParentIds = function (tagIdOrTag, tags) {
    return tagUtil.getAllParents(tagIdOrTag, tags).map(parent => parent.id);
};

/**
 * returns all possible new relatives (children or parents) for a given tag
 * @param tagIdOrTag the ID of the tag object or the tag object
 * @param tags array of all tag objects
 * @return {*}
 */
tagUtil.getPossibleNewRelatives = function(tagIdOrTag, tags) {
    let childrenIds = tagUtil.getAllChildIds(tagIdOrTag, tags);
    let parentIds = tagUtil.getAllParentIds(tagIdOrTag, tags);
    return tags.filter(tag => childrenIds.indexOf(tag.id) === -1 && parentIds.indexOf(tag.id) === -1);
};

tagUtil.getLabel = function (tagIdOrTag, tags) {
    let tag = tagUtil.getTag(tagIdOrTag, tags);
    return tag.label.de ? tag.label.de : tag.id;
};

tagUtil.sortTags = function (tagIdsOrTags, tags, returnIds) {
    let tagObjects = tagIdsOrTags.map(idOrTag => tagUtil.getTag(idOrTag, tags));
    tagObjects.sort((a,b) => (a.label.de || a.id).localeCompare(b.label.de));
    return returnIds ? tagObjects.map(e => e.id) : tagObjects;
};

/**
 * returns the number of times the given tag is a child of any other element
 * @param tagIdOrTag
 * @param tags
 * @return {number}
 */
tagUtil.getUsageCount = function (tagIdOrTag, tags) {
    let searchTag = tagUtil.getTag(tagIdOrTag, tags);
    let count = 0;
    tags.forEach(tag => {
        if (tag.children.indexOf(searchTag.id) !== -1) {
            count++;
        }
    });
    return count;
};

/**
 * deletes a given Tag from the list of all tags
 * @param tagIdOrTag
 * @param parentTagIdOrTag the parentTag to definre the location where to remove the given tag
 * @param tags
 * @return {number}
 */
tagUtil.deleteTag = function (tagIdOrTag, parentTagIdOrTag, tags) {
    let deleteTag = tagUtil.getTag(tagIdOrTag, tags);
    let initialUsageCount = tagUtil.getUsageCount(deleteTag, tags);
    if (initialUsageCount === 1 && deleteTag.children.length > 0) {
        log.warn('cannot completely remove tags with children, aborting...');
        return tags;
    }
    let parentTag = tagUtil.getTag(parentTagIdOrTag, tags);
    parentTag.children = parentTag.children.filter(childId => childId !== deleteTag.id);
    deleteTag.parents = deleteTag.parents.filter(parentId => parentId !== parentTag.id);
    if (initialUsageCount === 1) {
        tags = tags.filter(tag => tag.id !== deleteTag.id);
    }
    return tags;
};

function getAll(tagIdOrTag, tags, getChildren) {
    let tag = tagUtil.getTag(tagIdOrTag, tags);
    if (!tag) {
        return [];
    }
    let allRelatives = [];
    let type = getChildren ? 'children' : 'parents';
    tag[type].forEach(relativeId => {
        let relative = tagUtil.getTag(relativeId, tags);
        allRelatives.push(relative);
        allRelatives = allRelatives.concat(getAll(relative, tags, getChildren));
    });
    return [...new Set(allRelatives)];
}

export {tagUtil};