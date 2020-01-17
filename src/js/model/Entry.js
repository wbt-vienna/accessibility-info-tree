import {ObjectModel} from "objectmodel"
import {ArrayModel} from "objectmodel";
import {modelUtil} from "../util/modelUtil";
import {constants} from "../util/constants";

class Entry extends ObjectModel({
    id: [String],
    modelName: [String],
    header: [String],
    link: [String],
    short: [String],
    full: [String],
    created: [Number],
    updated: [Number],
    tags: [ArrayModel(String)],
    metaTags: [ArrayModel(String)]
}) {
    constructor(properties) {
        let defaults = {
            id: "",
            modelName: Entry.getModelName(),
            types: [],
            tags: [],
            metaTags: [constants.TAG_DE_ID, constants.TAG_AUT_ID, constants.TAG_TYPE_LINK_ID],
            created: new Date().getTime(),
            updated: new Date().getTime()
        };
        properties = properties || {};
        super(Object.assign(defaults, properties));
        this.id = this.id || modelUtil.generateId(Entry.getModelName());
    }

    static getModelName() {
        return "Entry";
    }
}

export {Entry};