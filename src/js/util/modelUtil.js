let modelUtil = {};
let idCounter = 100;

modelUtil.generateId = function (prefix) {
    prefix = prefix || "id";
    return prefix + "-" + new Date().getTime() + "-" + (idCounter++);
};

export {modelUtil};