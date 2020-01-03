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