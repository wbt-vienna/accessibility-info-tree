import {constants} from "../util/constants";
import {ArrayModel, ObjectModel} from "objectmodel"
import {Tag} from "./Tag"

class Tags extends ObjectModel({
    id: [String],
    modelName: [String],
    tags: ArrayModel(Tag)
}) {
    constructor(properties) {
        let defaults = {
            id: constants.TAGS_DOCUMENT_ID,
            modelName: Tags.getModelName(),
            tags: []
        };
        properties = properties || {};
        super(Object.assign(defaults, properties));
    }

    static getModelName() {
        return "Tags";
    }
}

export {Tags};