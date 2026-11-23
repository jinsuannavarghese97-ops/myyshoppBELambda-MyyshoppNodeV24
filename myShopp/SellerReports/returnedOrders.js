var mysql = require('mysql');
var methods = {};
methods.returnedOrders = function (jsonObj, callback) {
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
        var subQuery1 = "";
        let subQuery1Params = [];
        var subQuery2 = "";
        let subQuery2Params = [];
        var returnedOrderSelectCombo = jsonObj.returnedOrderSelectCombo;
        var returnedOrderSearchText = jsonObj.returnedOrderSearchText;
        var storeId = jsonObj.storeId;
        var returnedOrderFromDate = jsonObj.returnedOrderFromDate;
        var returnedOrderToDate = jsonObj.returnedOrderToDate;
        var sellerId = jsonObj.sellerId;
        var returnedOrderMax = jsonObj.returnedOrderMax;
        var returnedOrderOffset = jsonObj.returnedOrderOffset;
        var result = [];
        var storeResult = [];
        var orderResult = [];

        if (returnedOrderSelectCombo == '') {
            subQuery1 = " "
        }
        if (returnedOrderSelectCombo == "orderNumber") {
            subQuery1 = "  AND so.id = ? ";
            subQuery1Params.push(returnedOrderSearchText);
        }
        if (returnedOrderSelectCombo == "storeName") {
            subQuery1 = " AND s.name LIKE ? ";
            subQuery1Params.push(returnedOrderSearchText + "%");
        }
        if (returnedOrderSelectCombo == "customerName") {
            subQuery1 = subQuery1 + " and concat(IFNULL(b.first_name, ''), ' ', IFNULL(b.last_name, '')) like ? ";
            subQuery1Params.push(returnedOrderSearchText + "%");
        }
        if (storeId != "" && storeId != "0") {
            subQuery2 = " AND  s.id = ?";
            subQuery2Params.push(storeId);
        }
        if (returnedOrderFromDate != "" && returnedOrderToDate != "" && returnedOrderFromDate != null && returnedOrderToDate != null) {
            subQuery1 = subQuery1 + " AND sos.status_date BETWEEN CAST(? AS DATE) AND DATE_ADD(?,INTERVAL 1439 MINUTE) ";
            subQuery1Params.push(returnedOrderFromDate, returnedOrderToDate);
        }
        else if ((returnedOrderFromDate != "" && returnedOrderFromDate != null) && (returnedOrderToDate == "" || returnedOrderToDate == null)) {
            subQuery1 = subQuery1 + " and DATE(sos.status_date) >= ? ";
            subQuery1Params.push(returnedOrderFromDate);
        }
        var queryString = " SELECT s.name AS store_name,s.id as sId, CONCAT(IFNULL(b.first_name, ''), ' ', IFNULL(b.last_name, '')) AS customer_name, so.id AS order_number, DATE_FORMAT(sal.sale_date, '%d-%b-%Y') 	AS order_date,  DATE_FORMAT(sos.status_date, '%d-%b-%Y') AS returned_date, pt.name AS mode_of_payment, so.gross_amount, sos.comments AS reason " +
            " FROM sale_order so " +
            " INNER JOIN sale_order_status sos  ON sos.sale_order_id = so.id " +
            " INNER JOIN order_status os ON os.id = sos.order_status_id and so.order_status_id=os.id " +
            " INNER JOIN store s ON s.id = so.store_id " +
            " INNER JOIN seller selr ON selr.id = s.seller_id " +
            " INNER JOIN sale sal ON sal.id = so.sale_id " +
            " INNER JOIN buyer b ON b.id = sal.buyer_id " +
            " INNER JOIN payment_type pt ON pt.id = sal.payment_type_id " +
            " WHERE so.order_status_id = 6 AND sal.is_active = 1 AND selr.id = ? " + subQuery1 + subQuery2 +
            " order by sos.status_date desc " +
            " limit ?,?;" +

            " SELECT count(*) as totalCount FROM sale_order so " +
            "INNER JOIN sale_order_status sos  ON sos.sale_order_id = so.id " +
            "INNER JOIN order_status os ON os.id = sos.order_status_id and so.order_status_id=os.id " +
            "INNER JOIN store s ON s.id = so.store_id " +
            "INNER JOIN seller selr ON selr.id = s.seller_id " +
            "INNER JOIN sale sal ON sal.id = so.sale_id " +
            "INNER JOIN buyer b ON b.id = sal.buyer_id " +
            "INNER JOIN payment_type pt ON pt.id = sal.payment_type_id " +
            "WHERE so.order_status_id = 6 AND sal.is_active = 1 AND selr.id = ? " + subQuery1 + subQuery2 + ";" +

            " select s.id as storeId,s.name as storeName from store s " +
            " inner join seller as selr on selr.id = s.seller_id " +
            " where selr.id = ? ;";

        const queryStringParams = [
            sellerId,
            ...subQuery1Params,
            ...subQuery2Params,
            parseInt(returnedOrderOffset),
            parseInt(returnedOrderMax),
            sellerId,
            ...subQuery1Params,
            ...subQuery2Params,
        ];

        connection.query(queryString, queryStringParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting returned order details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {
                for (var i = 0; i < queryStringResult[0].length; i++) {
                    orderResult[i] = {
                        storeName: queryStringResult[0][i].store_name == null ? '' : queryStringResult[0][i].store_name,
                        customerName: queryStringResult[0][i].customer_name == null ? '' : queryStringResult[0][i].customer_name,
                        orderNumber: queryStringResult[0][i].order_number == null ? '' : queryStringResult[0][i].order_number,
                        orderDate: queryStringResult[0][i].order_date == null ? '' : queryStringResult[0][i].order_date,
                        returnedDate: queryStringResult[0][i].returned_date == null ? '' : queryStringResult[0][i].returned_date,
                        modeOfPayment: queryStringResult[0][i].mode_of_payment == null ? '' : queryStringResult[0][i].mode_of_payment,
                        grossAmount: queryStringResult[0][i].gross_amount == null ? '' : queryStringResult[0][i].gross_amount,
                        reason: queryStringResult[0][i].reason == null ? '' : queryStringResult[0][i].reason,
                        storeId: queryStringResult[0][i].sId == null ? '' : queryStringResult[0][i].sId
                    }
                }
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    storeResult[j] = {
                        storeId: queryStringResult[2][j].storeId == null ? '' : queryStringResult[2][j].storeId,
                        storeName: queryStringResult[2][j].storeName == null ? '' : queryStringResult[2][j].storeName
                    }
                }
                var totalCount = queryStringResult[1][0].totalCount
                result = {
                    orderResult: orderResult,
                    storeResult: storeResult,
                    totalCount: totalCount
                }
                console.log(result)
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