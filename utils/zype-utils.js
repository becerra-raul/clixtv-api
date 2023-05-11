function Utils() {}

Utils.prototype.getMapFromZObjects = function(zobjects = []) {
    return zobjects.reduce(
        (list, item) => ({
            ...list,
            [item._id]: item
        }),
        {}
    );
};

/**
 * Returns the parsed, sorted list of IDs assuming they follow the format `ID-SORT`
 *
 * @example
 *  ```
 *  [ '5dd4d5ac2715635e2ffbba72-0', '5c5a1eed5d3c194809000d75-1']
 *  ```
 *
 * @param {String[]} ids IDs to sort
 * @return {String[]} Sorted, parsed IDs (without sort parameter)
 */
Utils.prototype.getSortedIdsList = function(ids = []) {
    return [ ...ids ]
        .sort((a, b) => {
            const orderA = parseInt(a.split('-')[1] || 0);
            const orderB = parseInt(b.split('-')[1] || 0);
            return orderA < orderB;
        })
        .map(id => id.split('-')[0]);
};

module.exports = new Utils();