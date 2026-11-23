const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let wishListCountQuery
    let storeId = event.storeId
    let itemId = event.itemId
    let currentUserId = event.currentUserId
    let wishListQuery
    let wishListId = event.wishListId
    let deletewishListQuery
    wishListCountQuery = " select COUNT(*) AS Count from rt_user_wish_list where item_id= ? and sec_user_id= ? and store_id= ? ";
    queryExecution.queryExecution(client, jsonObj, event, wishListCountQuery, [itemId, currentUserId, storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let wishListCountResults = response.result;
        if (wishListCountResults[0].Count > 0) {
            deletewishListQuery = " DELETE FROM rt_user_wish_list  where item_id= ? and sec_user_id= ? and store_id= ?";
            queryExecution.queryExecution(client, jsonObj, event, deletewishListQuery, [itemId, currentUserId, storeId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let deletewishListResult = response.result;
                const responseData = {
                    success: "1",
                    result: {
                        "deletewishListResult": []
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            })
        }
        else {
            wishListQuery = "insert into rt_user_wish_list(item_id,sec_user_id,store_id,created_on)" +
                " values(?,?,?,CURDATE())"
            queryExecution.queryExecution(client, jsonObj, event, wishListQuery, [itemId, currentUserId, storeId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let wishListResults = response.result;
                const responseData = {
                    success: "1",
                    result: {
                        "wishListResults": wishListResults
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            })
        }
    });
}
module.exports = methods;
