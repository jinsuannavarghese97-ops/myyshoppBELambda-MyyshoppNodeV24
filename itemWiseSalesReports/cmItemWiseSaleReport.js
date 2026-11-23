let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.cmItemWiseSaleReport = function (client, jsonObj, event, callback) {


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
        storeSubQuery = " and st.id = ?";
        storeSubQueryParams = [event.storeId];
    }

    if (event.sellerId) {
        sellerSubQuery = "and st.seller_id = ?";
        sellerSubQueryParams = [event.sellerId];
    }
    if (event.cmbOrder == 'least') {
        orderQry = "order by count(*) asc"
    } else {
        orderQry = "order by count(*) desc"
    }
    if (event.itemName) {
        whereQuery = whereQuery + " and cim.name like ?"
        whereQueryParams.push("%" + event.itemName + "%");
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

    // console.log("whereQlimitQueryuery....", limitQuery);
    let itemWiseSaleQuery = "SELECT ci.id as itemId,count(*) as orderCount, cim.name  as itemName,cs.name as size_name  ,  " +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/', " +
        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 's3PathCommonItem'),'/','clothing/',cii.image)as itemImg ,sum(csoi.net_amount)as totalAmount,csoi.item_price as itemPrice, DATE_FORMAT(s.created_on,'%d, %b %Y') as saleDate " +
        " FROM sale as s  " +
        " INNER JOIN sale_order as so ON s.id = so.sale_id  " +
        " INNER JOIN store as st ON st.id = so.store_id  " + storeSubQuery + sellerSubQuery +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id`  " +
        " INNER JOIN cm_sale_order_item as csoi ON csoi.sale_order_id = so.id  " +
        " inner join cm_item as ci on ci.id=csoi.cm_item_id  " +
        " inner join cm_item_master as cim on cim.id=ci.cm_item_master_id  " +
        " left join cm_item_images as cii on cii.cm_item_id=ci.id and cii.is_default=1  " +
        " LEFT OUTER JOIN cm_brand as cb ON cb.id=cim.cm_brand_id  " +
        " left join cm_item_size as cis on cis.id = csoi.cm_item_size_id  " +
        " left join cm_size as cs on cs.id = cis.cm_size_id  " +
        " where s.id != '' " + whereQuery +
        " group by ci.id,cis.id " + orderQry + " " + limitQuery + " ;"

    let itemWiseSaleCountQuery = "SELECT count(*) as totCount FROM(SELECT count(*) " +
        " FROM sale as s  " +
        " INNER JOIN sale_order as so ON s.id = so.sale_id  " +
        " INNER JOIN store as st ON st.id = so.store_id  " + storeSubQuery + sellerSubQuery +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id`  " +
        " INNER JOIN cm_sale_order_item as csoi ON csoi.sale_order_id = so.id  " +
        " inner join cm_item as ci on ci.id=csoi.cm_item_id  " +
        " inner join cm_item_master as cim on cim.id=ci.cm_item_master_id  " +
        " left join cm_item_images as cii on cii.cm_item_id=ci.id and cii.is_default=1  " +
        " LEFT OUTER JOIN cm_brand as cb ON cb.id=cim.cm_brand_id  " +
        " left join cm_item_size as cis on cis.id = csoi.cm_item_size_id  " +
        " left join cm_size as cs on cs.id = cis.cm_size_id  " +
        " where s.id != '' " + whereQuery +
        " group by ci.id,cis.id) AS totalCount  "

    itemWiseSaleQuery = itemWiseSaleQuery + itemWiseSaleCountQuery;
    const queryParams = [
        ...storeSubQueryParams, ...sellerSubQueryParams, ...whereQueryParams, ...limitQueryParams,
        ...storeSubQueryParams, ...sellerSubQueryParams, ...whereQueryParams
    ];
    console.log("itemWiseSaleQuery..common...", itemWiseSaleQuery);
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
        console.log("responses...", responses)

    });



}
module.exports = methods;
