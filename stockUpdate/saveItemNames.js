const queryExecution = require('../queryExecution');
const methods = {};
methods.saveItemNames = function (client, jsonObj, event, callback) {
    let generalQuery = `
        UPDATE item_names 
        SET 
            name = ?, 
            modified_by = ?, 
            modified_on = NOW() 
        WHERE 
            id = ?;
    `;

    let generalQueryParams = [
        event.searchItemName,
        event.userId,
        event.itemNamesId
    ];

    queryExecution.queryExecution(client, jsonObj, event, generalQuery, generalQueryParams, function (response) {
        response.result = []
        callback(response);
    });
}
module.exports = methods;