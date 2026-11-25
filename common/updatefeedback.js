const queryExecution = require('../queryExecution');
const methods = {};

// Saves the buyer's rating / comments for a delivered order. Called as functionName "common/updatefeedback".
// Same insert and response as the original /myshopp Lambda function: created_on is the SERVER time (NOW()),
// the browser's createdOn / modifedBy fields are ignored.
methods.updatefeedback = function (client, event, callback) {
    const updateFeedbackQuery =
        " insert into feedback (version,buyer_id,comments,created_by,created_on,delivery_courtsey,   " +
        " item_freshness,item_weight,overall_rating,punctuality,sale_order_id,store_id,is_user_comments_entered,is_active,modified_by)" +
        " values(0,?,?,?,NOW(),?,?,?,?,?,?,?,true,true,0) ";

    const queryParams = [
        event.buyerId,
        event.comments,
        event.createdBy,
        event.deliveryCourtsey,
        event.itemFreshness,
        event.itemWeight,
        event.overallRating,
        event.punctuality,
        event.saleOrderId,
        event.storeId
    ];

    queryExecution.queryExecution(client, "", event, updateFeedbackQuery, queryParams, function (dbResponse) {
        if (dbResponse.success == "0") {
            return callback({
                success: "0",
                successMessage: "",
                errorMessage: "Something went wrong"
            });
        }
        return callback({
            success: "1",
            errorMessage: "",
            successMessage: "Saved Successfully"
        });
    });
};
module.exports = methods;
