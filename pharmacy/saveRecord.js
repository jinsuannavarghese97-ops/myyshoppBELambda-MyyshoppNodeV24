const methods = {};
const queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let query = "";
    let queryParams = [];
    if (event.id) {
        query = "UPDATE ph_buyer_attachments SET is_active = false WHERE id = ? ; ";
        queryParams = [event.id];
    }
    else {
        query = `
            INSERT INTO ph_buyer_attachments 
            (version, attachment_name, buyer_id, created_by, created_on, is_active, site_id, store_id) 
            VALUES (?, ?, ?, ?, NOW(), TRUE, ?, ?)
        `;
        queryParams = ['0', event.attachment, event.buyerId, event.buyerId, event.siteId, event.storeId];
    }

    queryExecution.queryExecution(client, jsonObj, event, query, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        response.result = {
            id: event.id ? event.id : response.result.insertId
        }
        callback(response);
    });
}
module.exports = methods;