'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('raw.json');
let items = JSON.parse(rawdata);
let result = {};
let resultItems = [];
let finalResult = [];

items.forEach(item => {
    resultItems = resultItems.concat(getItems(item));
});
resultItems.forEach((item, index) => {
    let duplicates = [];
    resultItems.forEach((item2, index2) => {
        if (index2 > index && item.id === item2.id) {
            duplicates.push(item2);
        }
    });
    if(duplicates.length === 1) {
        finalResult.push({
            id: item.id,
            parents: item.parents.concat(duplicates[0].parents),
            children: item.children.concat(duplicates[0].children)
        })
    } else if(duplicates.length ===0 ) {
        finalResult.push(item);
    } else {
        console.log('ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    }
});

console.log(finalResult);

let data = JSON.stringify(finalResult);
fs.writeFileSync('output.json', data);


function getItems(item, parent) {
    let resultItem = createResultItem(item, parent);
    let result = resultItem ? [resultItem] : [];
    if(item.items) {
        item.items.forEach(item2 => {
            result = result.concat(getItems(item2, item));
        });
    }
    return result;
}

function createResultItem(originalItem, parent) {
    let childrenIds = [];
    let parentIds = parent ? [parent.text] : [];
    if(originalItem.items) {
        originalItem.items.forEach(child => {
            childrenIds.push(child.text);
        })
    }
    return {
        id: originalItem.text,
        parents: parentIds,
        children: childrenIds
    }
}