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
    threshold = threshold || 0.5;
    threshold = threshold > 0 && threshold <= 1 ? threshold : 0.5;
    let similarEntries = [];
    entries.forEach(entry => {
        if (entry.link && checkEntry.link) {
            try {
                let hostnameExisting = new URL(entry.link).hostname;
                let hostnameNew = new URL(checkEntry.link).hostname;
                if (hostnameExisting === hostnameNew) {
                    similarEntries.push(entry);
                }
            } catch (e) {
            }
        }
    });
    let ratios = [];
    let matcher = new difflib.SequenceMatcher();
    let currentHeader = checkEntry.header;
    entries.forEach(entry => {
        if (entry.header && currentHeader && currentHeader.length > 2) {
            if(entry.header.toLocaleLowerCase().indexOf(checkEntry.header.toLowerCase()) !== -1) {
                ratios.push({
                    entry: entry,
                    ratio: 1
                });
            } else {
                matcher.set_seqs(entry.header, checkEntry.header);
                let ratio = matcher.ratio();
                ratios.push({
                    entry: entry,
                    ratio: ratio
                });
            }
        }
    });
    ratios = ratios.filter(ratio => ratio.ratio > threshold);
    ratios.sort((a,b) => {
        return b.ratio - a.ratio;
    });
    let ratioEntries = ratios.map(ratioEntry => ratioEntry.entry);
    similarEntries = similarEntries.concat(ratioEntries).slice(0, maxCount);
    return similarEntries;
};

export {entryUtil};