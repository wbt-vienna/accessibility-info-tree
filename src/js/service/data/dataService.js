import {databaseService} from "./databaseService";
import {Tags} from "../../model/Tags";
import $ from "jquery";
import {constants} from "../../util/constants";
import {Entry} from "../../model/Entry";

let dataService = {};
let lastTags = null;
let lastEntries = null;

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
    if (lastEntries) {
        return Promise.resolve(lastEntries);
    }
    return databaseService.getObject(Entry).then(result => {
        let list = result ? (result instanceof Array ? result : [result]) : [];
        lastEntries = JSON.parse(JSON.stringify(list));
        return Promise.resolve(list)
    });
};

dataService.getEntry = function (id) {
    if (!id) {
        return Promise.resolve(null);
    }
    return databaseService.getObject(Entry, id);
};

dataService.saveEntry = function (entry) {
    if (lastEntries) {
        lastEntries = lastEntries.filter(e => e.id !== entry.id);
        lastEntries.push(entry);
    }
    return databaseService.saveObject(Entry, entry);
};

dataService.remove = function(id) {
    lastEntries = null;
    return databaseService.removeObject(id);
};

$(document).on(constants.EVENT_DB_PULL_UPDATED, (event, changedDoc) => {
    if (changedDoc.id === constants.TAGS_DOCUMENT_ID) {
        lastTags = changedDoc;
    }
    lastEntries = null;
});

$(document).on(constants.EVENT_DB_UNAUTHORIZED, () => {
    lastTags = null;
    lastEntries = null;
});

export {dataService};