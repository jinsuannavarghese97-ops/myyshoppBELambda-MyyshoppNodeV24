var mysql = require('mysql');
var methods = {};
methods.sellerCreatedOrder = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    })
    pool.getConnection(function (err, connection) {
        var subQuery = "";
        let subQueryParams = [];
        var storeId = jsonObj.storeId
        var sellerId = jsonObj.sellerId
        var sellerCreatedOrderFromDate = jsonObj.sellerCreatedOrderFromDate
        var sellerCreatedOrderToDate = jsonObj.sellerCreatedOrderToDate
        var sellerCreatedOrderOffset = jsonObj.sellerCreatedOrderOffset
        var sellerCreatedOrderMax = jsonObj.sellerCreatedOrderMax
        var orderDetails = []
        var result = []
        var orderGrossAmountSum = 0
        var orderCountSum = 0

        if (storeId != "" && storeId != null && storeId != "0") {
            subQuery = subQuery + " and so.store_id= ?";
            subQueryParams.push(storeId);
        }
        else {
            subQuery = subQuery + " and order_status_id = 1  ";
        }
        if (sellerCreatedOrderFromDate != "" && sellerCreatedOrderFromDate != null && sellerCreatedOrderToDate != "" && sellerCreatedOrderToDate != null) {
            subQuery = subQuery + " and DATE(s.sale_date) between ? and  ?";
            subQueryParams.push(sellerCreatedOrderFromDate, sellerCreatedOrderToDate);
        }
        else if ((sellerCreatedOrderFromDate != "" && sellerCreatedOrderFromDate != null) && (sellerCreatedOrderToDate == "" || sellerCreatedOrderToDate == null)) {
            subQuery = subQuery + " and DATE(s.sale_date) >= ? ";
            subQueryParams.push(sellerCreatedOrderFromDate);
        }
        var queryString = "SELECT DATE_FORMAT(s.sale_date,'%d-%b-%Y') AS saleDate, so.order_status_id, " +
            "	COUNT(*) AS order_count,CAST(SUM(so.gross_amount) AS DECIMAL(18, 2)) AS " +
            "	order_total, sr.id AS sec_role_id, sr.authority, sr.description " +
            "	FROM sale_order so " +
            "	INNER JOIN sale s " +
            "	ON s.id = so.sale_id " +
            "	INNER JOIN " +
            "	(SELECT sos.sale_order_id, sos.created_by " +
            "	FROM sale_order_status sos " +
            "	INNER JOIN (SELECT sale_order_id AS sale_order_id, MIN(created_on) " +
            "	AS created_on " +
            "	FROM sale_order_status " +
            "	GROUP BY sale_order_id) test " +
            "	ON sos.sale_order_id = test.sale_order_id " +
            "	AND sos.created_on = test.created_on) " +
            "	temp_table " +
            "	ON temp_table.sale_order_id = so.id " +
            "   INNER JOIN store str " +
            "   ON str.id = so.store_id " +
            "   INNER JOIN seller slr " +
            "   ON slr.id = str.seller_id " +
            "	INNER JOIN sec_user_sec_role susr " +
            "	ON susr.sec_user_id = temp_table.created_by INNER JOIN sec_role sr " +
            "	ON sr.id = susr.sec_role_id AND sr.id IN (1,3,4) AND s.is_active=1 " +
            "   WHERE slr.id = ? and s.is_draft <>true " + subQuery +
            "	GROUP BY DATE_FORMAT(s.sale_date,'%d-%b-%Y'), sr.id, " +
            "	sr.authority,sr.description " +
            "	ORDER BY " +
            "	s.sale_date DESC ; " +

            " SELECT DATE_FORMAT(s.sale_date,'%d-%b-%Y') AS saleDate, so.order_status_id, " +
            "	COUNT(*) AS order_count,CAST(SUM(so.gross_amount) AS DECIMAL(18, 2)) AS " +
            "	order_total, sr.id AS sec_role_id, sr.authority, sr.description " +
            "	FROM sale_order so " +
            "	INNER JOIN sale s " +
            "	ON s.id = so.sale_id " +
            "	INNER JOIN " +
            "	(SELECT sos.sale_order_id, sos.created_by " +
            "	FROM sale_order_status sos " +
            "	INNER JOIN (SELECT sale_order_id AS sale_order_id, MIN(created_on) " +
            "	AS created_on " +
            "	FROM sale_order_status " +
            "	GROUP BY sale_order_id) test " +
            "	ON sos.sale_order_id = test.sale_order_id " +
            "	AND sos.created_on = test.created_on) " +
            "	temp_table " +
            "	ON temp_table.sale_order_id = so.id " +
            "   INNER JOIN store str " +
            "   ON str.id = so.store_id " +
            "   INNER JOIN seller slr " +
            "   ON slr.id = str.seller_id " +
            "	INNER JOIN sec_user_sec_role susr " +
            "	ON susr.sec_user_id = temp_table.created_by INNER JOIN sec_role sr " +
            "	ON sr.id = susr.sec_role_id AND sr.id IN (1,3,4) AND s.is_active=1 " +
            "   WHERE slr.id = ? and s.is_draft <>true " + subQuery +
            "	GROUP BY DATE_FORMAT(s.sale_date,'%d-%b-%Y'), sr.id, " +
            "	sr.authority,sr.description " +
            "	ORDER BY " +
            "	s.sale_date DESC " +
            "   limit ?,? ; "
        const queryParams = [
            sellerId,
            ...subQueryParams,
            sellerId,
            ...subQueryParams,
            parseInt(sellerCreatedOrderOffset),
            parseInt(sellerCreatedOrderMax)
        ];

        connection.query(queryString, queryParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting seller created order"
                };
                return callback(response);
            }
            else if (queryStringResult[0].length > 0) {

                for (var i = 0; i < queryStringResult[1].length; i++) {
                    orderDetails[i] = {
                        saleDate: queryStringResult[1][i].saleDate == null ? '' : queryStringResult[1][i].saleDate,
                        orderStatusId: queryStringResult[1][i].order_status_id == null ? '' : queryStringResult[1][i].order_status_id,
                        orderCount: queryStringResult[1][i].order_count == null ? '' : queryStringResult[1][i].order_count,
                        orderGrossAmount: queryStringResult[1][i].order_total == null ? '' : queryStringResult[1][i].order_total,
                        secRoleId: queryStringResult[1][i].sec_role_id == null ? '' : queryStringResult[1][i].sec_role_id,
                        authority: queryStringResult[1][i].authority == null ? '' : queryStringResult[1][i].authority,
                        description: queryStringResult[1][i].description == null ? '' : queryStringResult[1][i].description
                    }
                }
                for (var k = 0; k < queryStringResult[0].length; k++) {
                    orderGrossAmountSum = orderGrossAmountSum + queryStringResult[0][k].order_total
                    orderCountSum = orderCountSum + queryStringResult[0][k].order_count
                }
                var totalCount = queryStringResult[0].length
                result = {
                    orderDetails: orderDetails,
                    totalCount: totalCount,
                    orderGrossAmountSum: orderGrossAmountSum,
                    orderCountSum: orderCountSum
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

    });
}
module.exports = methods;