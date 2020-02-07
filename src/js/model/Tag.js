import {ObjectModel} from "objectmodel"
import {ArrayModel} from "objectmodel";

let Tag = ObjectModel({
    id: [String],
    modelName: [String],
    label: [Object],
    color: [String],
    searchRoot: [Boolean], //if true children are shown in tag search
    notAssignable: [Boolean], //if true this tag is not directly assignable to an entry, only children
    mandatory: [Boolean], //mandatory that a child of this tag is tagged
    optional: [Boolean], //optional that a child of this tag is tagged (set to true in order to add this tag to "optional" section in create entry view)
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