let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.groceryItemWiseSaleReport = function (client, jsonObj, event, callback) {
    let storeSubQuery = "";
    let storeSubQueryParams = [];
    let sellerSubQuery = "";
    let sellerSubQueryParams = [];
    let limitQuery = "";
    let limitQueryParams = [];
    let whereQuery = "";
    let whereQueryParams = [];
    let orderQry = "";
    if (event.offset && event.max) {
        limitQuery = limitQuery + " limit ?,?";
        limitQueryParams = [parseInt(event.offset), parseInt(event.max)];
    }
    if (!event.offset && event.max) {
        limitQuery = limitQuery + " limit ?";
        limitQueryParams = [parseInt(event.max)];
    }
    if (event.storeId) {
        storeSubQuery = " and st.id = ? ";
        storeSubQueryParams = [event.storeId];
    }

    if (event.sellerId) {
        sellerSubQuery = "and st.seller_id = ?";
        sellerSubQueryParams = [event.sellerId];
    }
    if (event.itemName) {
        whereQuery = " and soi.item_name LIKE  ?";
        whereQueryParams.push("%" + event.itemName.trim() + "%");
    }
    if (event.cmbOrder == 'least') {
        orderQry = "order by count(*) asc"
    } else {
        orderQry = "order by count(*) desc"
    }
    if (event.fromDate != "" && event.fromDate != null && event.toDate != "" && event.toDate != null) {

        whereQuery = whereQuery + " and date(s.created_on) >= ? and date(s.created_on) <= ? ";
        whereQueryParams.push(event.fromDate, event.toDate);
    }
    else if ((event.fromDate != "" && event.fromDate != null) && (event.toDate == "" || event.toDate == null)) {
        whereQuery = whereQuery + " and date(s.created_on) >= ? ";
        whereQueryParams.push(event.fromDate);
    }
    else if ((event.fromDate == "" || event.fromDate == null) && (event.toDate != "" && event.toDate != null)) {
        whereQuery = whereQuery + " and date(s.created_on) <= ? ";
        whereQueryParams.push(event.toDate);
    }
    let itemWiseSaleQuery = "SELECT sos.id as itemId,count(*) as orderCount,soi.item_name as itemName,concat(soi.unit,' ',soi.unit_type)as itemSize," +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  " +
        " FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration " +
        " WHERE config_key = 'itemImagesFolder'),'/',it.logo_path_thumb) as itemImg,sum(soi.net_amount) as totalAmount,soi.item_price as itemPrice, DATE_FORMAT(s.created_on,'%d, %b %Y') as saleDate " +
        " FROM sale as s " +
        " INNER JOIN sale_order as so ON s.id = so.sale_id " +
        " INNER JOIN store as st ON st.id = so.store_id  " + storeSubQuery + sellerSubQuery +
        " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id " +
        " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
        " INNER JOIN item it ON it.id = soi.item_id   " +
        " where s.id != '' " + whereQuery +
        " group by sos.id " + orderQry + " " + limitQuery + ";"

    let itemWiseSaleCountQuery = " SELECT count(*) AS totCount FROM(SELECT count(*) " +
        " FROM sale as s " +
        " INNER JOIN sale_order as so ON s.id = so.sale_id " +
        " INNER JOIN store as st ON st.id = so.store_id  " + storeSubQuery + sellerSubQuery +
        " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id " +
        " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
        " INNER JOIN item it ON it.id = soi.item_id   " +
        " where s.id != '' " + whereQuery +
        " group by sos.id) AS totalCount ;"

    itemWiseSaleQuery = itemWiseSaleQuery + itemWiseSaleCountQuery;
    const queryParams = [
        ...storeSubQueryParams, ...sellerSubQueryParams, ...whereQueryParams, ...limitQueryParams,
        ...storeSubQueryParams, ...sellerSubQueryParams, ...whereQueryParams
    ];
    console.log("---------------grocery--------------", itemWiseSaleQuery)
    queryExecution.queryExecution(client, jsonObj, event, itemWiseSaleQuery, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let finalResult = response.result;
        if (finalResult[0].length > 0) {
            for (let i = 0; i < finalResult[0].length; i++) {
                let totAmount = finalResult[0][i].totalAmount.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                })
                finalResult[0][i].totalAmount = totAmount
                //console.log("---",totAmount)
            }
        }
        const responses = {
            success: "1",
            result: finalResult[0],
            totalCount: finalResult[1][0].totCount,
            successMessage: "Success",
            errorMessage: ""
        };
        callback(responses);
    });


}
module.exports = methods;
