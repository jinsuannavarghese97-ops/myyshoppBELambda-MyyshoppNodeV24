var mysql = require('mysql');
var methods = {};
methods.reviewOrderedItems = function (jsonObj, callback) {
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
        var reviewOrderItemCmbStatus = jsonObj.reviewOrderItemCmbStatus;
        var reviewOrderItemFromDate = jsonObj.reviewOrderItemFromDate;
        var reviewOrderItemToDate = jsonObj.reviewOrderItemToDate;
        var sellerId = jsonObj.sellerId;
        var reviewOrderItemOffset = jsonObj.reviewOrderItemOffset;
        var reviewOrderItemMax = jsonObj.reviewOrderItemMax;
        var orderedItems = [];
        var result = [];

        if (reviewOrderItemCmbStatus != "" && reviewOrderItemCmbStatus != "0") {
            subQuery = subQuery + " and soi.review_status = ? ";
            subQueryParams.push(reviewOrderItemCmbStatus);
        }
        if (reviewOrderItemFromDate != "" && reviewOrderItemFromDate != null && reviewOrderItemToDate != "" && reviewOrderItemToDate != null) {
            subQuery = subQuery + " and DATE(s.sale_date) between ? and  ?";
            subQueryParams.push(reviewOrderItemFromDate, reviewOrderItemToDate);
        }
        else if ((reviewOrderItemFromDate != "" && reviewOrderItemFromDate != null) && (reviewOrderItemToDate == "" || reviewOrderItemToDate == null)) {
            subQuery = subQuery + " and DATE(s.sale_date) >= ? ";
            subQueryParams.push(reviewOrderItemFromDate);
        }
        else if ((reviewOrderItemFromDate == "" || reviewOrderItemFromDate == null) && (reviewOrderItemToDate != "" && reviewOrderItemToDate != null)) {
            subQuery = subQuery + " and DATE(s.sale_date) <= ? ";
            subQueryParams.push(reviewOrderItemToDate);
        }
        var queryString = "SELECT s.sale_date AS sdate, soi.item_code AS itemCode,CONCAT(IFNULL(b.name,''),' ', i.name,' ',p.name) AS itemName,SUM(soi.quantity) AS quantity, CAST(SUM(soi.net_amount *soi.quantity) AS DECIMAL(18, 2)) AS price,soi.review_status AS status " +
            "  FROM sale_order_item soi " +
            " INNER JOIN sale_order so " +
            " ON soi.sale_order_id=so.id " +
            " INNER JOIN sale s " +
            " ON s.id = so.sale_id " +
            " INNER JOIN store str " +
            " ON str.id = so.store_id " +
            " INNER JOIN seller slr " +
            " ON slr.id = str.seller_id " +
            " INNER JOIN item i " +
            " ON i.id = soi.item_id " +
            " INNER JOIN pack p " +
            " ON p.id = i.pack_id " +
            " LEFT OUTER JOIN brand AS b " +
            " ON i.brand_id=b.id " +
            " WHERE soi.review_status!='available' AND soi.review_status!='null' and slr.id = ? " + subQuery +
            " GROUP BY soi.item_id, soi.review_status ORDER BY price DESC ; " +

            " SELECT s.sale_date AS sdate, soi.item_code AS itemCode,CONCAT(IFNULL(b.name,''),' ', i.name,' ',p.name) AS itemName,SUM(soi.quantity) AS quantity, CAST(SUM(soi.net_amount *soi.quantity) AS DECIMAL(18, 2)) AS price,soi.review_status AS status " +
            "  FROM sale_order_item soi " +
            " INNER JOIN sale_order so " +
            " ON soi.sale_order_id=so.id " +
            " INNER JOIN sale s " +
            " ON s.id = so.sale_id " +
            " INNER JOIN store str " +
            " ON str.id = so.store_id " +
            " INNER JOIN seller slr " +
            " ON slr.id = str.seller_id " +
            " INNER JOIN item i " +
            " ON i.id = soi.item_id " +
            " INNER JOIN pack p " +
            " ON p.id = i.pack_id " +
            " LEFT OUTER JOIN brand AS b " +
            " ON i.brand_id=b.id " +
            " WHERE soi.review_status!='available' AND soi.review_status!='null' and slr.id = ? " + subQuery +
            " GROUP BY soi.item_id, soi.review_status ORDER BY price DESC " +
            " limit ?, ? ;";
            const queryParams = [sellerId, ...subQueryParams, sellerId, ...subQueryParams, parseInt(reviewOrderItemOffset), parseInt(reviewOrderItemMax)];

        connection.query(queryString, queryParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting review ordered items details"
                };
                return callback(response);
            }
            else if (queryStringResult[0].length > 0) {
                for (var i = 0; i < queryStringResult[1].length; i++) {
                    orderedItems[i] = {
                        saleDate: queryStringResult[1][i].sdate == null ? '' : queryStringResult[1][i].sdate,
                        itemCode: queryStringResult[1][i].itemCode == null ? '' : queryStringResult[1][i].itemCode,
                        itemName: queryStringResult[1][i].itemName == null ? '' : queryStringResult[1][i].itemName,
                        itemQuantity: queryStringResult[1][i].quantity == null ? '' : queryStringResult[1][i].quantity,
                        itemPrice: queryStringResult[1][i].price == null ? '' : queryStringResult[1][i].price,
                        reviewStatus: queryStringResult[1][i].status == null ? '' : queryStringResult[1][i].status
                    }
                }
                var totalCount = queryStringResult[0].length
                result = {
                    orderedItems: orderedItems,
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