var mysql = require('mysql');
var methods = {};
methods.customerOrDatewiseDeliveredOrder = function (jsonObj, callback) {
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
        var subQuery1 = "";
        let subQuery1Params = [];
        var customerDatewiseDeliverOrderCmbTypes = jsonObj.customerDatewiseDeliverOrderCmbTypes;
        var customerDatewiseDeliverOrderTextInput = jsonObj.customerDatewiseDeliverOrderTextInput;
        var customerDatewiseDeliverOrderFromDate = jsonObj.customerDatewiseDeliverOrderFromDate;
        var customerDatewiseDeliverOrderToDate = jsonObj.customerDatewiseDeliverOrderToDate;
        var subQuery2 = "";
        let subQuery2Params = [];
        var storeId = jsonObj.storeId;
        var sellerId = jsonObj.sellerId;
        var customerDatewiseDeliverOrderOffset = jsonObj.customerDatewiseDeliverOrderOffset;
        var customerDatewiseDeliverOrderMax = jsonObj.customerDatewiseDeliverOrderMax;
        var orderDetails = [];
        var storeDetails = [];
        var result = [];

        if (customerDatewiseDeliverOrderCmbTypes != "" && customerDatewiseDeliverOrderCmbTypes != null && customerDatewiseDeliverOrderCmbTypes != "0") {
            if (customerDatewiseDeliverOrderCmbTypes == "orderNumber") {
                subQuery1 = subQuery1 + " and so.id like ? ";
                subQuery1Params.push(customerDatewiseDeliverOrderTextInput + "%");
            }
            if (customerDatewiseDeliverOrderCmbTypes == "buyerName") {
                subQuery1 = subQuery1 + " and  concat(ifnull(b.first_name,''),' ',ifnull(b.last_name,'')) like ? ";
                subQuery1Params.push("%" + customerDatewiseDeliverOrderTextInput + "%");
            }
        }
        if (customerDatewiseDeliverOrderFromDate != "" && customerDatewiseDeliverOrderFromDate != null && customerDatewiseDeliverOrderToDate != '' && customerDatewiseDeliverOrderToDate != null) {
            subQuery1 = subQuery1 + " and DATE(sos.status_date) between ? and  ?";
            subQuery1Params.push(customerDatewiseDeliverOrderFromDate, customerDatewiseDeliverOrderToDate);
        }
        else if ((customerDatewiseDeliverOrderFromDate != "" && customerDatewiseDeliverOrderFromDate != null) && (customerDatewiseDeliverOrderToDate == '' || customerDatewiseDeliverOrderToDate == null)) {
            subQuery1 = subQuery1 + " and DATE(sos.status_date) >= ? ";
            subQuery1Params.push(customerDatewiseDeliverOrderFromDate);
        }
        if (storeId != "" && storeId != null && storeId != "0") {
            subQuery2 = " and str.id = ? ";
            subQuery2Params.push(storeId);
        }
        var queryString = " Select so.store_id as sid,so.gross_amount as grossAmount,so.id as orderId, b.first_name, b.last_name,date_format(s.sale_date ,'%d-%b-%Y %h:%i %p') AS  order_date,  date_format(sos.status_date ,'%d-%b-%Y %h:%i %p') AS delivered_date, os.name as comments  ,  so.delivery_charge  as dlvryChrg,so.net_amount  " +
            " FROM sale_order so inner join sale s on s.id=so.sale_id AND s.is_active = true  AND s.is_draft = false " +
            " INNER JOIN sale_order_status sos ON sos.sale_order_id = so.id  AND sos.is_active = true  and sos.is_current_status= 1 " +
            " INNER JOIN order_status os ON os.id = so.order_status_id " +
            " INNER JOIN store str ON str.id = so.store_id   " +
            " INNER JOIN seller selr ON selr.id = str.seller_id" +
            " INNER JOIN buyer b ON b.id = s.buyer_id   " +
            "  and so.order_status_id= 4  " +
            " where selr.id = ? " + subQuery1 + subQuery2 + " ORDER BY sos.status_date DESC ;" +

            " Select so.store_id as sid,so.gross_amount as grossAmount,so.id as orderId, b.first_name, b.last_name,date_format(s.sale_date ,'%d-%b-%Y %h:%i %p') AS  order_date,  date_format(sos.status_date ,'%d-%b-%Y %h:%i %p') AS delivered_date, os.name as comments  ,  so.delivery_charge  as dlvryChrg,so.net_amount  " +
            " FROM sale_order so inner join sale s on s.id=so.sale_id AND s.is_active = true  AND s.is_draft = false " +
            " INNER JOIN sale_order_status sos ON sos.sale_order_id = so.id  AND sos.is_active = true  and sos.is_current_status= 1 " +
            " INNER JOIN order_status os ON os.id = so.order_status_id " +
            " INNER JOIN store str ON str.id = so.store_id   " +
            " INNER JOIN seller selr ON selr.id = str.seller_id" +
            " INNER JOIN buyer b ON b.id = s.buyer_id   " +
            " and so.order_status_id= 4  " +
            " where selr.id = ? " + subQuery1 + subQuery2 + " ORDER BY sos.status_date DESC " +
            " limit ?,? ; " +

            " select str.id as sId,str.name as storeName from store str " +
            " inner join seller as selr on selr.id = str.seller_id " +
            " where selr.id = ? ; ";
        const params = [
            sellerId,
            ...subQuery1Params,
            ...subQuery2Params,
            sellerId,
            ...subQuery1Params,
            ...subQuery2Params,
            parseInt(customerDatewiseDeliverOrderOffset),
            parseInt(customerDatewiseDeliverOrderMax),
            sellerId
        ];

        connection.query(queryString, params, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting customer/datewise delivered order details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {
                for (var i = 0; i < queryStringResult[1].length; i++) {
                    orderDetails[i] = {
                        storeId: queryStringResult[1][i].sid == null ? '' : queryStringResult[1][i].sid,
                        grossAmount: queryStringResult[1][i].grossAmount == null ? '' : queryStringResult[1][i].grossAmount,
                        orderId: queryStringResult[1][i].orderId == null ? '' : queryStringResult[1][i].orderId,
                        firstName: queryStringResult[1][i].first_name == null ? '' : queryStringResult[1][i].first_name,
                        lastName: queryStringResult[1][i].last_name == null ? '' : queryStringResult[1][i].last_name,
                        orderDate: queryStringResult[1][i].order_date == null ? '' : queryStringResult[1][i].order_date,
                        deliveredDate: queryStringResult[1][i].delivered_date == null ? '' : queryStringResult[1][i].delivered_date,
                        comments: queryStringResult[1][i].comments == null ? '' : queryStringResult[1][i].comments,
                        deliveryCharge: queryStringResult[1][i].dlvryChrg == null ? '' : queryStringResult[1][i].dlvryChrg,
                        netAmount: queryStringResult[1][i].net_amount == null ? '' : queryStringResult[1][i].net_amount
                    }
                }
                var totalCount = queryStringResult[0].length
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    storeDetails[j] = {
                        storeId: queryStringResult[2][j].sId == null ? '' : queryStringResult[2][j].sId,
                        storeName: queryStringResult[2][j].storeName == null ? '' : queryStringResult[2][j].storeName
                    }
                }
                result = {
                    orderDetails: orderDetails,
                    storeDetails: storeDetails,
                    totalCount: totalCount
                }
                //console.log(result)
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