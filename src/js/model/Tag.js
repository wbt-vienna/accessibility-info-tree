import {ObjectModel} from "objectmodel"
import {ArrayModel} from "objectmodel";

let Tag = ObjectModel({
    id: String,
    modelName: [String],
    label: [Object],
    parents: ArrayModel(String),
    children: ArrayModel(String),
}).defaultTo({
    modelName: getModelName(),
    label: {}
});

function getModelName() {
    return "Tag";
}

Tag.getModelName = getModelName;

export {Tag};