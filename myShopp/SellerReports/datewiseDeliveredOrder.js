var mysql = require('mysql');
var methods = {};
methods.datewiseDeliveredOrder = function (jsonObj, callback) {
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
        var storeId = jsonObj.storeId;
        var datewiseDeliverOrderFromDate = jsonObj.datewiseDeliverOrderFromDate;
        var datewiseDeliverOrderToDate = jsonObj.datewiseDeliverOrderToDate;
        var sellerId = jsonObj.sellerId;
        var datewiseDeliverOrderOffset = jsonObj.datewiseDeliverOrderOffset;
        var datewiseDeliverOrderMax = jsonObj.datewiseDeliverOrderMax;
        var orderDetails = [];
        var storeDetails = [];
        var result = [];
        var orderAmountSum = 0;
        var orderCountSum = 0;

        if (storeId != "" && storeId != null && storeId != "0") {
            subQuery = " and str.id = ? ";
            subQueryParams.push(storeId);
        }
        if (datewiseDeliverOrderFromDate != "" && datewiseDeliverOrderFromDate != null && datewiseDeliverOrderToDate != "" && datewiseDeliverOrderToDate != null) {
            subQuery = subQuery + " and DATE(sal.sale_date) between ? and ?";
            subQueryParams.push(datewiseDeliverOrderFromDate, datewiseDeliverOrderToDate);
        }
        else if ((datewiseDeliverOrderFromDate != "" && datewiseDeliverOrderFromDate != null) && (datewiseDeliverOrderToDate == "" || datewiseDeliverOrderToDate == null)) {
            subQuery = subQuery + " and DATE(sal.sale_date) >= ?";
            subQueryParams.push(datewiseDeliverOrderFromDate);
        }
        var queryString = "SELECT DATE_FORMAT(sal.sale_date, '%d-%b-%Y') AS saleDate, str.name AS storeName, COUNT(*) AS orderCount, CAST(SUM(so.gross_amount) AS DECIMAL(18, 2)) AS orderAmount " +
            " FROM sale_order so " +
            " INNER JOIN sale sal " +
            " ON sal.id = so.sale_id " +
            " INNER JOIN store str " +
            " ON str.id = so.store_id " +
            " INNER JOIN seller slr " +
            " ON slr.id = str.seller_id " +
            " WHERE so.order_status_id = 4 AND slr.id = ? " + subQuery +
            " GROUP BY DATE_FORMAT(sal.sale_date, '%d-%b-%Y') ,str.name " +
            " ORDER BY sal.sale_date desc ; " +

            " SELECT DATE_FORMAT(sal.sale_date, '%d-%b-%Y') AS saleDate, str.name AS storeName, COUNT(*) AS orderCount, CAST(SUM(so.gross_amount) AS DECIMAL(18, 2)) AS orderAmount " +
            " FROM sale_order so " +
            " INNER JOIN sale sal " +
            " ON sal.id = so.sale_id " +
            " INNER JOIN store str " +
            " ON str.id = so.store_id " +
            " INNER JOIN seller slr " +
            " ON slr.id = str.seller_id " +
            " WHERE so.order_status_id = 4 AND slr.id = ? " + subQuery +
            " GROUP BY DATE_FORMAT(sal.sale_date, '%d-%b-%Y') ,str.name " +
            " ORDER BY sal.sale_date desc " +
            " limit ?,? ; " +

            " select str.id as storeId,str.name as storeName from store str " +
            " inner join seller as selr on selr.id = str.seller_id " +
            " where selr.id = ?; ";

        const queryStringParams = [sellerId, ...subQueryParams, ...sellerId, ...subQueryParams, parseInt(datewiseDeliverOrderOffset), parseInt(datewiseDeliverOrderMax), sellerId];

        connection.query(queryString, queryStringParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting datewise delivered order"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {
                for (var i = 0; i < queryStringResult[1].length; i++) {
                    orderDetails[i] = {
                        saleDate: queryStringResult[1][i].saleDate == null ? '' : queryStringResult[1][i].saleDate,
                        storeName: queryStringResult[1][i].storeName == null ? '' : queryStringResult[1][i].storeName,
                        orderCount: queryStringResult[1][i].orderCount == null ? '' : queryStringResult[1][i].orderCount,
                        orderAmount: queryStringResult[1][i].orderAmount == null ? '' : queryStringResult[1][i].orderAmount
                    }
                }
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    storeDetails[j] = {
                        storeId: queryStringResult[2][j].storeId == null ? '' : queryStringResult[2][j].storeId,
                        storeName: queryStringResult[2][j].storeName == null ? '' : queryStringResult[2][j].storeName
                    }
                }
                for (var k = 0; k < queryStringResult[0].length; k++) {
                    orderAmountSum = orderAmountSum + queryStringResult[0][k].orderAmount
                    orderCountSum = orderCountSum + queryStringResult[0][k].orderCount
                }
                var totalCount = queryStringResult[0].length
                result = {
                    orderDetails: orderDetails,
                    storeDetails: storeDetails,
                    totalCount: totalCount,
                    orderAmountSum: orderAmountSum,
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
    })
}
module.exports = methods;