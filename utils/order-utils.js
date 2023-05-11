function Utils() { }

Utils.prototype.getEpisodeOrderInCategory = function (episode, categoryId) {
    /* episode.order should be an array of string, each string should be on the following format;
        CATEGORYID-ORDER
    */
    const orderString = episode.order_category
        ? episode.order_category.find((value) => value.includes(categoryId))
        : undefined

    if (orderString) {
        const orderTuple = orderString.split('-')
        /* orderTuple should be [CATEGORYID, ORDER] */
        if (orderTuple.length === 2) {
            const order = parseInt(orderTuple[1])
            if (order === 0 || !!order) {
                return order
            }
        }
    }
    return 999
};

module.exports = new Utils();