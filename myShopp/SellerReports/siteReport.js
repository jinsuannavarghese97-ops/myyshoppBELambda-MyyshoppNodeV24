var mysql = require('mysql');
var methods = {};

methods.siteReport = function (jsonObj, callback) {
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
        var subQuery2 = "";
        let subQuery2Params = [];
        var sellerId = jsonObj.sellerId
        var siteComboStatus = jsonObj.siteComboStatus
        var siteOffset = jsonObj.siteOffset
        var siteMax = jsonObj.siteMax
        var saleDateFrom = jsonObj.saleDateFrom
        var saleDateTo = jsonObj.saleDateTo
        var sellerDetails = []
        var siteDetails = []
        var result = []

        if ((saleDateFrom != "" && saleDateFrom != null) && (saleDateTo == "" || saleDateTo == null)) {
            subQuery1 = subQuery1 + " and DATE(sal.sale_date) >= ? ";
            subQuery1Params.push(saleDateFrom);
        }
        else if ((saleDateFrom != "" && saleDateFrom != null) && (saleDateTo != "" && saleDateTo != null)) {
            subQuery1 = subQuery1 + " and DATE(sal.sale_date) between ? and  ?";
            subQuery1Params.push(saleDateFrom, saleDateTo);
        }
        else if ((saleDateFrom == "" || saleDateFrom == null) && (saleDateTo != "" && saleDateTo != null)) {
            subQuery1 = subQuery1 + " and DATE(sal.sale_date) <= ? ";
            subQuery1Params.push(saleDateTo);
        }

        if (siteComboStatus == "Delivered") {
            subQuery2 = subQuery2 + " and sale_order.order_status_id = 4 "
        }
        else if (siteComboStatus == "Cancelled") {
            subQuery2 = subQuery2 + " and sale_order.order_status_id = 5 "
        }
        else if (siteComboStatus == "0" || siteComboStatus == "All") {
            subQuery2 = ""
        }

        var queryString = " select distinct site.seller_id, " +
            " if(site.seller_id=0,'MyyShopp',seller.retail_group_name) as sellerName " +
            " from site " +
            " left join seller on site.seller_id = seller.id ; " +

            " select distinct sale_order.order_status_id,sale_order.store_id,sel.id as sellerid,sel.retail_group_name as sellerName,sit.id as siteId,sit.site_url as siteName,DATE_FORMAT(sal.sale_date, '%b-%Y') AS sale_month, " +
            " sum(IF(sal.is_mobile_app = false, 1, 0)+IF((sal.is_mobile_app = true and sal.device like 'IOS%'), 1, 0)+IF((sal.is_mobile_app = true and sal.device like 'Android%'), 1, 0)) as totCount, " +
            " round(sum(sal.gross_amount),2) as totAmount, " +
            " count(IF(sal.is_mobile_app = false, 1, null)) as webCount, " +
            " round(sum(if(sal.is_mobile_app = false, sal.gross_amount, null)),2) as webAmount, " +
            " count(IF((sal.is_mobile_app = true and sal.device like 'IOS%'), 1, null)) as iosCount, " +
            " cast(sum(if((sal.is_mobile_app = true and sal.device like 'IOS%'), sal.gross_amount, null)) as decimal(18,2)) as iosAmount, " +
            " count(IF((sal.is_mobile_app = true and sal.device like 'Android%'), 1, null)) as andrCount, " +
            " cast(sum(if((sal.is_mobile_app = true and sal.device like 'Android%'), sal.gross_amount, null)) as decimal(18,2)) as andrAmount, " +
            " sal.is_mobile_app,sal.device " +
            " FROM sale sal " +
            " inner join sale_order on sale_order.sale_id = sal.id " +
            " inner JOIN site sit  ON sal.site_id = sit.id " +
            " left join seller sel on sit.seller_id = sel.id " +
            " where sel.id= ? " + subQuery1 + subQuery2 +
            " group by DATE_FORMAT(sal.sale_date, '%Y-%m'),sit.site_url  " +
            " order by sel.retail_group_name,DATE_FORMAT(sal.sale_date, '%Y-%m') desc ; " +

            " select distinct sale_order.order_status_id,sale_order.store_id,sel.id as sellerid,sel.retail_group_name as sellerName,sit.id as siteId,sit.site_url as siteName,DATE_FORMAT(sal.sale_date, '%b-%Y') AS sale_month, " +
            " sum(IF(sal.is_mobile_app = false, 1, 0)+IF((sal.is_mobile_app = true and sal.device like 'IOS%'), 1, 0)+IF((sal.is_mobile_app = true and sal.device like 'Android%'), 1, 0)) as totCount, " +
            " round(sum(sal.gross_amount),2) as totAmount, " +
            " count(IF(sal.is_mobile_app = false, 1, null)) as webCount, " +
            " round(sum(if(sal.is_mobile_app = false, sal.gross_amount, null)),2) as webAmount, " +
            " count(IF((sal.is_mobile_app = true and sal.device like 'IOS%'), 1, null)) as iosCount, " +
            " cast(sum(if((sal.is_mobile_app = true and sal.device like 'IOS%'), sal.gross_amount, null)) as decimal(18,2)) as iosAmount, " +
            " count(IF((sal.is_mobile_app = true and sal.device like 'Android%'), 1, null)) as andrCount, " +
            " cast(sum(if((sal.is_mobile_app = true and sal.device like 'Android%'), sal.gross_amount, null)) as decimal(18,2)) as andrAmount, " +
            " sal.is_mobile_app,sal.device " +
            " FROM sale sal " +
            " inner join sale_order on sale_order.sale_id = sal.id " +
            " inner JOIN site sit  ON sal.site_id = sit.id " +
            " left join seller sel on sit.seller_id = sel.id " +
            " where sel.id= ? " + subQuery1 + subQuery2 +
            " group by DATE_FORMAT(sal.sale_date, '%Y-%m'),sit.site_url  " +
            " order by sel.retail_group_name,DATE_FORMAT(sal.sale_date, '%Y-%m') desc " +
            " limit ?,?; ";
        const queryParams = [sellerId, ...subQuery1Params, ...sellerId, ...subQuery1Params, parseInt(siteOffset), parseInt(siteMax)];

        connection.query(queryString, queryParams, function (error, queryStringResult, fields) {

            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting site details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {

                for (var i = 0; i < queryStringResult[0].length; i++) {
                    sellerDetails[i] = {
                        sellerId: queryStringResult[0][i].seller_id == null ? '' : queryStringResult[0][i].seller_id,
                        sellerName: queryStringResult[0][i].sellerName == null ? '' : queryStringResult[0][i].sellerName
                    }
                }
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    siteDetails[j] = {
                        orderStatusId: queryStringResult[2][j].order_status_id == null ? '' : queryStringResult[2][j].order_status_id,
                        storeId: queryStringResult[2][j].store_id == null ? '' : queryStringResult[2][j].store_id,
                        sellerId: queryStringResult[2][j].sellerid == null ? '' : queryStringResult[2][j].sellerid,
                        sellerName: queryStringResult[2][j].sellerName == null ? '' : queryStringResult[2][j].sellerName,
                        siteId: queryStringResult[2][j].siteId == null ? '' : queryStringResult[2][j].siteId,
                        siteName: queryStringResult[2][j].siteName == null ? '' : queryStringResult[2][j].siteName,
                        saleMonth: queryStringResult[2][j].sale_month == null ? '' : queryStringResult[2][j].sale_month,
                        totalCount: queryStringResult[2][j].totCount == null ? '' : queryStringResult[2][j].totCount,
                        totalAmount: queryStringResult[2][j].totAmount == null ? '' : queryStringResult[2][j].totAmount,
                        webCount: queryStringResult[2][j].webCount == null ? '' : queryStringResult[2][j].webCount,
                        iosCount: queryStringResult[2][j].iosCount == null ? '' : queryStringResult[2][j].iosCount,
                        iosAmount: queryStringResult[2][j].iosAmount == null ? '' : queryStringResult[2][j].iosAmount,
                        androidCount: queryStringResult[2][j].andrCount == null ? '' : queryStringResult[2][j].andrCount,
                        androidAmount: queryStringResult[2][j].andrAmount == null ? '' : queryStringResult[2][j].andrAmount,
                        isMobileApp: queryStringResult[2][j].is_mobile_app == null ? '' : queryStringResult[2][j].is_mobile_app,
                        device: queryStringResult[2][j].device == null ? '' : queryStringResult[2][j].device
                    }
                }
                var totalCount = queryStringResult[1].length
                result = {
                    sellerDetails: sellerDetails,
                    totalCount: totalCount,
                    siteDetails: siteDetails
                }
                console.log(queryString)
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