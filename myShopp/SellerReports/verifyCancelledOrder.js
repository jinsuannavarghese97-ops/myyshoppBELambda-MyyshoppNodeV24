var mysql = require('mysql');
var methods = {};
methods.verifyCancelledOrder = function (jsonObj, callback) {
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
        var subQuery = "";
        let subQueryParams = [];
        var sellerId = jsonObj.sellerId
        var storeId = jsonObj.storeId
        var verifyCancelOrderCmbSelect = jsonObj.verifyCancelOrderCmbSelect
        var verifyCancelOrderSearchText = jsonObj.verifyCancelOrderSearchText
        var orderResult = []
        var storeResult = []
        var result = []
        var verifyCancelOrderMax = jsonObj.verifyCancelOrderMax
        var verifyCancelOrderOffset = jsonObj.verifyCancelOrderOffset

        if (storeId != "" && storeId != "0") {
            subQuery = " and str.id = ? ";
            subQueryParams.push(storeId);
        }
        if (verifyCancelOrderCmbSelect != "" && verifyCancelOrderCmbSelect != "0") {
            if (verifyCancelOrderCmbSelect == "customerName") {
                subQuery = " and su.display_name like ? ";
                subQueryParams.push(verifyCancelOrderSearchText + "%");
            }
            if (verifyCancelOrderCmbSelect == "customerId") {
                subQuery = " and s.buyer_id = ? ";
                subQueryParams.push(verifyCancelOrderSearchText);
            }
            if (verifyCancelOrderCmbSelect == "mobileNumber") {
                subQuery = " and su.mobile_number = ? ";
                subQueryParams.push(verifyCancelOrderSearchText);
            }
            if (verifyCancelOrderCmbSelect == "emailId") {
                subQuery = " and su.email_id  = ? ";
                subQueryParams.push(verifyCancelOrderSearchText);
            }
        }
        var queryString = "SELECT s.buyer_id as custId, su.display_name AS customer_name,slr.id as slrId,su.mobile_number AS mobile_number,su.email_id as emailId, COUNT(*) AS cancelled_orders " +
            " FROM sale_order so" +
            " INNER JOIN sale_order_status sos" +
            " ON sos.sale_order_id = so.id" +
            " INNER JOIN sale s" +
            " ON so.sale_id = s.id" +
            " INNER JOIN store str" +
            " ON so.store_id = str.id" +
            " INNER JOIN seller slr" +
            " ON slr.id = str.seller_id" +
            " INNER JOIN sec_user su" +
            " ON su.id = s.buyer_id" +
            " WHERE sos.order_status_id = 5" +
            " AND sos.is_current_status=TRUE AND str.is_active=true and slr.id = ? " + subQuery +
            " GROUP BY su.display_name, su.mobile_number ORDER BY cancelled_orders desc; " +

            "SELECT s.buyer_id as custId, su.display_name AS customer_name,slr.id as slrId,su.mobile_number AS mobile_number,su.email_id as emailId, COUNT(*) AS cancelled_orders " +
            " FROM sale_order so" +
            " INNER JOIN sale_order_status sos" +
            " ON sos.sale_order_id = so.id" +
            " INNER JOIN sale s" +
            " ON so.sale_id = s.id" +
            " INNER JOIN store str" +
            " ON so.store_id = str.id" +
            " INNER JOIN seller slr" +
            " ON slr.id = str.seller_id" +
            " INNER JOIN sec_user su" +
            " ON su.id = s.buyer_id" +
            " WHERE sos.order_status_id = 5" +
            " AND sos.is_current_status=TRUE AND str.is_active=true and slr.id = ? " + subQuery +
            " GROUP BY su.display_name, su.mobile_number ORDER BY cancelled_orders desc " +
            " limit ?,?;" +

            " select s.id as sId,s.name as strName from store s " +
            " inner join seller as slr on slr.id = s.seller_id " +
            " where slr.id = ? and s.is_active=true  group by s.id ; ";

        const queryParams = [sellerId, ...subQueryParams, sellerId, ...subQueryParams, parseInt(verifyCancelOrderOffset), parseInt(verifyCancelOrderMax), sellerId];

        connection.query(queryString, queryParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting cancelled order details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {
                for (var i = 0; i < queryStringResult[1].length; i++) {
                    orderResult[i] = {
                        customerId: queryStringResult[1][i].custId == null ? '' : queryStringResult[1][i].custId,
                        customerName: queryStringResult[1][i].customer_name == null ? '' : queryStringResult[1][i].customer_name,
                        sellerId: queryStringResult[1][i].slrId == null ? '' : queryStringResult[1][i].slrId,
                        mobileNumber: queryStringResult[1][i].mobile_number == null ? '' : queryStringResult[1][i].mobile_number,
                        emailId: queryStringResult[1][i].emailId == null ? '' : queryStringResult[1][i].emailId,
                        cancelledOrders: queryStringResult[1][i].cancelled_orders == null ? '' : queryStringResult[1][i].cancelled_orders
                    }
                }
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    storeResult[j] = {
                        storeId: queryStringResult[2][j].sId == null ? '' : queryStringResult[2][j].sId,
                        storeName: queryStringResult[2][j].strName == null ? '' : queryStringResult[2][j].strName
                    }
                }
                var totalCount = queryStringResult[0].length

                result = {
                    orderResult: orderResult,
                    storeResult: storeResult,
                    totalCount: totalCount
                }

                const response = {
                    success: "1",
                    result: result,
                    errorMessage: "",
                    successMessage: "success"
                }
                return callback(response);
            }
            else {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "No Data Found"
                };
                return callback(response);
            }
        });
    })
}
module.exports = methods;