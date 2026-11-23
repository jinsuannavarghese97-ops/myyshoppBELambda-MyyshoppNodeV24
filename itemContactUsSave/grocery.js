let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.grocery = function (client, jsonObj, event, callback) {

    let storeId = jsonObj.storeId;
    let sellerId = jsonObj.sellerId;
    let userId = jsonObj.userId;
    let itemId = jsonObj.itemId;
    let emailId = jsonObj.emailId;
    let name = jsonObj.name;
    let phone = jsonObj.phone;
    let comments = jsonObj.comments;
    let createdOn = new Date();
    if (event.moduleType == "common") {
        let sisTableSelectQuery = " SELECT s.title as title, cim.name as name " +
            " from cm_item as s " +
            " inner join cm_item_master as cim on cim.id = s.cm_item_master_id "
        " where s.id = ?; "
        //connection.query(sisTableSelectQuery, function (error, sisTableSelectResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, sisTableSelectQuery, [itemId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let sisTableSelectResults = response.result;
            let ItemName = sisTableSelectResults[0].title ? sisTableSelectResults[0].itemName + " " + sisTableSelectResults[0].title : sisTableSelectResults[0].itemName;
            if (sisTableSelectResults.length > 0) {
                const itemContactUsQuery = `
                    INSERT INTO common_seller_item_contact 
                    (version, store_id, seller_id, user_id, cm_item_id, created_on, comments, email_id, name, phone) 
                    VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)
                `;

                const itemContactUsQueryParams = [
                    0, storeId, sellerId, userId, itemId, comments, emailId, name, phone
                ];
                //console.log("itemContactUsQuery ",itemContactUsQuery)
                queryExecution.queryExecution(client, jsonObj, event, itemContactUsQuery, itemContactUsQueryParams, function (response) {
                    callback(response);
                })
            }
        });
    }
    else {
        let sisTableSelectQuery = "SELECT s.item_name as itemName,s.seller_item_id as sellerItemId from store_item_stock as s where s.id = ? ";
        //connection.query(sisTableSelectQuery, function (error, sisTableSelectResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, sisTableSelectQuery, [itemId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let sisTableSelectResults = response.result;
            let sellerItemId = sisTableSelectResults[0].sellerItemId;
            let ItemName = sisTableSelectResults[0].itemName;
            if (sisTableSelectResults.length > 0) {
                const itemContactUsQuery = `
                    INSERT INTO seller_item_contact 
                    (varsion, store_id, seller_id, user_id, seller_item_id, created_on, comments, email_id, name, phone) 
                    VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)
                `;

                const itemContactUsQueryParams = [
                    0, storeId, sellerId, userId, sellerItemId, comments, emailId, name, phone
                ];

                queryExecution.queryExecution(client, jsonObj, event, itemContactUsQuery, itemContactUsQueryParams, function (response) {
                    callback(response);
                })
            }
        });
    }
}
module.exports = methods;