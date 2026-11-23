let mysql = require('mysql');
let methods = {};
methods.saveOrderReview = function (client, jsonObj, orderReviewResults, queryExecution, event, callback) {

    let reviewStatus = '';
    let itemId = '';
    let updateQuery = "";
    let updateQueryParams = [];
    for (let i = 0; i < orderReviewResults.length; i++) {
        reviewStatus = orderReviewResults[i].reviewStatus;
        itemId = orderReviewResults[i].itemId;
        updateQuery = updateQuery + "UPDATE sale_order_item SET review_status = ? WHERE id = ?;";
        updateQueryParams.push(reviewStatus, itemId);
    }
    queryExecution.queryExecution(client, jsonObj, event, updateQuery, updateQueryParams, function (response) {
        response.success = response.success == '1' ? "updated succesfully" : ""
        callback(response);

    });
};
module.exports = methods;
