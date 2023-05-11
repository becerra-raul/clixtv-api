const types = Object.freeze({
    OTHER: {
        label: 'other',
        key: 1
    },
    MALE: {
        label: 'male',
        key: 2
    },
    FEMALE: {
        label: 'female',
        key: 3
    }
});

module.exports = {
    types: types,
    getKeyByLabel: (label) => {
        let key = Object.keys(types).filter((gender) => {
            return types[gender].label === label;
        })[0];
        if (!key || !types[key]) {
            return undefined;
        }
        return types[key].key;
    },
    getLabelByKey: (key) => {
        let label = Object.keys(types).filter((gender) => {
            return types[gender].key === parseInt(key);
        })[0];
        if (!label || !types[label]) {
            return undefined;
        }
        return types[label].label;
    }
};