import {databaseService} from "./databaseService";
import {Tags} from "../../model/Tags";

let dataService = {};

dataService.getTags = function () {
    return databaseService.getSingleObject(Tags).then(result => {
        return Promise.resolve(result ? new Tags(result) : null);
    });
};

dataService.saveTags = function (tagData) {
    return databaseService.saveObject(Tags, tagData);
};

export {dataService};