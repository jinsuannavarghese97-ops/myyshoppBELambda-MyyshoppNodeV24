const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let wishListId = event.wishListId
    let deletewishList = " DELETE FROM rt_user_wish_list WHERE id= ? ";
    queryExecution.queryExecution(client, jsonObj, event, deletewishList, [wishListId], function (response) {
        callback(response);
    });
}
module.exports = methods;
