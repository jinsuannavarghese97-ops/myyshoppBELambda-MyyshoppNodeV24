const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let buyerId = event.buyerId
    let comments = event.comments
    let createdBy = event.createdBy
    let createdOn = event.createdOn
    let deliveryCourtsey = event.deliveryCourtsey
    let itemFreshness = event.itemFreshness
    let itemWeight = event.itemWeight
    let overallRating = event.overallRating
    let punctuality = event.punctuality
    let saleOrderId = event.saleOrderId
    let storeId = event.storeId
    let updateFeedbackData = [];
    let updateFeedbackQuery = `
        INSERT INTO feedback 
        (
            version, 
            buyer_id, 
            comments, 
            created_by, 
            created_on, 
            delivery_courtsey, 
            item_freshness, 
            item_weight, 
            overall_rating, 
            punctuality, 
            sale_order_id, 
            store_id, 
            is_user_comments_entered, 
            is_active, 
            modified_by
        ) 
        VALUES 
        (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, true, 0)
    `;

    let updateFeedbackParams = [
        buyerId,
        comments,
        createdBy,
        createdOn,
        deliveryCourtsey,
        itemFreshness,
        itemWeight,
        overallRating,
        punctuality,
        saleOrderId,
        storeId
    ];

    queryExecution.queryExecution(client, jsonObj, event, updateFeedbackQuery, updateFeedbackParams, function (response) {
        callback(response);

    });
}
module.exports = methods;
