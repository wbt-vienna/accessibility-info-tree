import {ObjectModel} from "objectmodel"
import {ArrayModel} from "objectmodel";

let Tag = ObjectModel({
    id: [String],
    modelName: [String],
    label: [Object],
    color: [String],
    parents: ArrayModel(String),
    children: ArrayModel(String),
}).defaultTo({
    id: "",
    modelName: getModelName(),
    label: {},
    parents: [],
    children: []
});

function getModelName() {
    return "Tag";
}

Tag.getModelName = getModelName;

export {Tag};