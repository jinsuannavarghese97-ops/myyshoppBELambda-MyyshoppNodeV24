var mysql = require('mysql');
let moment = require('moment-timezone')
var methods = {};

methods.offerStatusChange = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    });
    pool.getConnection(function (err, connection) {

        var storeItemStockId = jsonObj.storeItemStockId
        var sellerId = jsonObj.sellerId
        var offerStatus = jsonObj.offerStatus
        var modifiedOn = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        var subQuery = ""
        if (offerStatus == "true") {
            subQuery = " is_offer = false "
        }
        else {
            subQuery = " is_offer = true "
        }
        var queryString = " update store_item_stock set " + subQuery + ",modified_by = ?, modified_on = ? where id = ? ";
        connection.query(queryString, [sellerId, modifiedOn, storeItemStockId], function (error, queryStringResult) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in changing offer status in store_item_stock"
                };
                return callback(response);
            }
            else {
                const response = {
                    success: "1",
                    errorMessage: "",
                    successMessage: "success"
                };
                return callback(response);
            }
        });

    });
}
module.exports = methods;