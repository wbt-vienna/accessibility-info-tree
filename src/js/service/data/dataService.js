import {databaseService} from "./databaseService";
import {Tags} from "../../model/Tags";

let dataService = {};
let lastTags = null;

//TODO auto-sync

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

export {dataService};