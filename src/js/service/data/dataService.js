import {databaseService} from "./databaseService";
import {Tags} from "../../model/Tags";
import $ from "jquery";
import {constants} from "../../util/constants";

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

$(document).on(constants.EVENT_DB_PULL_UPDATED, (event, changedDoc) => {
    if (changedDoc.id === constants.TAGS_DOCUMENT_ID) {
        lastTags = changedDoc;
    }
});

export {dataService};