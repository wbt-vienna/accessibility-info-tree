import {constants} from "../util/constants";
import {ObjectModel} from "objectmodel"
import {ArrayModel} from "objectmodel";
import {Tag} from "./Tag"

let Tags = ObjectModel({
    id: [String],
    modelName: [String],
    tags: ArrayModel(Tag)
}).defaultTo({
    id: constants.TAGS_DOCUMENT_ID,
    modelName: getModelName(),
    tags: []
});

function getModelName() {
    return "Tags";
}

Tags.getModelName = getModelName;

export {Tags};