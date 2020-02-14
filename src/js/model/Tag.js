import {ArrayModel, ObjectModel} from "objectmodel"

class Tag extends ObjectModel({
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
}) {
    constructor(properties) {
        let defaults = {
            id: "",
            modelName: Tag.getModelName(),
            label: {},
            parents: [],
            children: []
        };
        properties = properties || {};
        super(Object.assign(defaults, properties));
    }

    static getModelName() {
        return "Tag";
    }
}

export {Tag};