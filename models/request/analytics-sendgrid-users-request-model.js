function AnalyticsSendGridUsersRequestModel(data) {
    this.conditions = [];
    if (data.created) {
        if (data.created.indexOf('-') !== -1) {
            let range = data.created.split('-');
            this.conditions.push({
                field: 'created_at',
                value: range[0],
                operator: 'gt',
                and_or: 'and'
            });
            this.conditions.push({
                field: 'created_at',
                value: range[1],
                operator: 'lt'
            })
        } else {
            this.conditions.push({
                field: 'created_at',
                value: data.created,
                operator: 'eq'
            })
        }
    }
}

module.exports = AnalyticsSendGridUsersRequestModel;