import {databaseService} from "./databaseService";
import {Tags} from "../../model/Tags";
import $ from "jquery";
import {constants} from "../../util/constants";
import {Entry} from "../../model/Entry";

let dataService = {};
let lastTags = null;

dataService.getTags = function () {
    if (lastTags) {
        return Promise.resolve(lastTags);
    }
    return databaseService.getSingleObject(Tags).then(result => {
        lastTags = result ? new Tags(result) : null;
        return Promise.resolve(lastTags);
    });
};

dataService.saveTags = function (tagData) {
    lastTags = null;
    let promise = databaseService.saveObject(Tags, tagData);
    promise.then(() => {
        lastTags = new Tags(tagData);
    });
    return promise;
};

dataService.getEntries = function() {
    return databaseService.getObject(Entry).then(result => {
        return Promise.resolve(result ? (result instanceof Array ? result : [result]) : [])
    });
};

dataService.getEntry = function (id) {
    if (!id) {
        return Promise.resolve(null);
    }
    return databaseService.getObject(Entry, id);
};

dataService.saveEntry = function (entry) {
    return databaseService.saveObject(Entry, entry);
};

dataService.remove = function(id) {
    return databaseService.removeObject(id);
};

$(document).on(constants.EVENT_DB_PULL_UPDATED, (event, changedDoc) => {
    if (changedDoc.id === constants.TAGS_DOCUMENT_ID) {
        lastTags = changedDoc;
    }
});

$(document).on(constants.EVENT_DB_UNAUTHORIZED, () => {
    lastTags = null;
});

export {dataService};