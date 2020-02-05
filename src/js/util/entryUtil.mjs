let entryUtil = {};

/**
 * returns a list of similar entries
 * @param checkEntry the entry to find similar entries for
 * @param entries list of all entries
 * @param maxCount (optional) maximum number of similar entries to return (default: 5)
 * @param threshold (optional) similarity index [0..1] that determines how similar two entries have to be in order to be
 *                             considered as similar
 * @return {*[]}
 */
entryUtil.getSimilar = function (checkEntry, entries, maxCount, threshold) {
    maxCount = maxCount || 5;
    threshold = threshold === undefined ? 0.5 : threshold;
    threshold = threshold >= 0 && threshold <= 1 ? threshold : 0.5;
    entries = entries.filter(entry => entry.id !== checkEntry.id);
    let similarEntries = [];
    let ratios = [];
    entries.forEach(entry => {
        if (entry.link && checkEntry.link) {
            try {
                let hostnameExisting = new URL(entry.link).hostname;
                let hostnameNew = new URL(checkEntry.link).hostname;
                if (hostnameExisting === hostnameNew) {
                    ratios.push({
                        entry: entry,
                        ratio: 1
                    });
                }
            } catch (e) {
            }
        }
    });
    let matcher = new difflib.SequenceMatcher();
    let currentHeader = checkEntry.header;
    entries.forEach(entry => {
        if (entry.header && currentHeader && currentHeader.length > 2) {
            if(entry.header.toLocaleLowerCase().indexOf(checkEntry.header.toLowerCase()) !== -1) {
                ratios.push({
                    entry: entry,
                    ratio: 1
                });
            } else if(threshold > 0 && threshold !== 1) {
                matcher.set_seqs(entry.header, checkEntry.header);
                let ratio = matcher.ratio();
                ratios.push({
                    entry: entry,
                    ratio: ratio
                });
            }
        }
    });
    ratios = ratios.filter(ratio => ratio.ratio >= threshold);
    ratios.sort((a,b) => {
        return b.ratio - a.ratio;
    });
    let ratioEntries = ratios.map(ratioEntry => ratioEntry.entry);
    similarEntries = similarEntries.concat(ratioEntries).slice(0, maxCount);
    return similarEntries;
};

entryUtil.getPossibleDuplicates = function (entries, threshold) {
    threshold = threshold || 1;
    entries = JSON.parse(JSON.stringify(entries));
    let possibleDuplicates = [];
    let color = 'lightgray';
    entries.forEach(entry => {
        if (possibleDuplicates.indexOf(entry) === -1) {
            let duplicates = entryUtil.getSimilar(entry, entries, 5, threshold);
            if (duplicates.length > 0) {
                color = color === 'lightgray' ? 'lightblue' : 'lightgray';
                setColor(entry, color);
                setColor(duplicates, color);
                possibleDuplicates.push(entry);
                possibleDuplicates = possibleDuplicates.concat(duplicates);
                let duplicateIds = duplicates.map(d => d.id);
                entries = entries.filter(e => duplicateIds.indexOf(e.id) === -1 && e.id !== entry.id);
            }
        }
    });
    return possibleDuplicates;
};

function setColor(entryOrEntries, color) {
    entryOrEntries = entryOrEntries instanceof Array ? entryOrEntries : [entryOrEntries];
    entryOrEntries.forEach(entry => {
        entry.color = color;
    });
}

export {entryUtil};