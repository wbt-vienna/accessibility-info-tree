import {ObjectModel} from "objectmodel"
import {ArrayModel} from "objectmodel";
import {modelUtil} from "../util/modelUtil";

class Entry extends ObjectModel({
    id: [String],
    modelName: [String],
    lang: [String],
    location: [String],
    header: [String],
    link: [String],
    short: [String],
    full: [String],
    types: [ArrayModel(String)],
    tags: [ArrayModel(String)]
}) {
    constructor(properties) {
        let defaults = {
            id: "",
            modelName: Entry.getModelName(),
            types: [],
            tags: []
        };
        properties = properties || {};
        super(Object.assign(defaults, properties));
        this.id = this.id || modelUtil.generateId(Entry.getModelName());
    }

    static getModelName() {
        return "Entry";
    }
}

Entry.defaultTo({
    id: "",
    modelName: Entry.getModelName(),
    types: [],
    tags: []
});

export {Entry};