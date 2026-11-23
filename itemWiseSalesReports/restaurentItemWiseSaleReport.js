let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.restauarantItemWiseSaleReport = function (client, jsonObj, event, callback) {

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
        sellerSubQuery = "and st.seller_id = ? ";
        sellerSubQueryParams = [event.sellerId];
    }
    if (event.cmbOrder == 'least') {
        orderQry = "order by count(*) asc"
    } else {
        orderQry = "order by count(*) desc"
    }
    if (event.itemName) {
        whereQuery = " and soi.item_name  LIKE  ?";
        whereQueryParams.push("%" + event.itemName.trim() + "%");
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
        whereQuery = whereQuery + " and date(s.created_on) <= ? "
        whereQueryParams.push(event.toDate);
    }
    let itemWiseSaleQuery = "select i.id as itemId,count(*) as orderCount,soi.item_name as itemName,i.description as itemDescription," +
        " isz.name as itemsize,isz.id as itemId,CONCAT((SELECT  config_value FROM configuration WHERE " +
        " config_key = 'cdnImagePath'),'/', (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT  config_value FROM configuration WHERE config_key = 's3PathRestaurant'),'/',rtImage.image_name)as restitemImg ,sum(soi.net_amount) as totalAmount,soi.item_price as itemPrice,DATE_FORMAT(s.created_on,'%d, %b %Y') as saleDate " +
        " from rt_sale_order_items as soi " +
        " inner join sale_order as so on so.id = soi.sale_order_id " +
        " inner join sale as s on s.id = so.sale_id " +
        " inner join rt_store_item as i on i.id= soi.rt_store_item_id  " +
        " left join rt_store_item_image as rtImage on rtImage.rt_store_item_id =i.id and rtImage.is_default=1 " +
        " inner join rt_store_item_size sis on sis.rt_store_item_id=soi.rt_store_item_id " +
        " inner join rt_item_size isz on isz.id= sis.rt_item_size_id and sis.id= soi.rt_store_item_size_id  " +
        " inner join store as st on st.id = so.store_id " + storeSubQuery + sellerSubQuery +
        " where soi.id != '' " + whereQuery +
        " group by i.id,isz.id  " + orderQry + " " + limitQuery + ";"

    let itemWiseSaleCountQuery = "select  count(*) as orderCount FROM(SELECT count(*) ," +
        " sum(soi.net_amount) as totalAmount" +
        " from rt_sale_order_items as soi " +
        " inner join sale_order as so on so.id = soi.sale_order_id " +
        " inner join sale as s on s.id = so.sale_id " +
        " inner join rt_store_item as i on i.id= soi.rt_store_item_id  " +
        " left join rt_store_item_image as rtImage on rtImage.rt_store_item_id =i.id and rtImage.is_default=1 " +
        " inner join rt_store_item_size sis on sis.rt_store_item_id=soi.rt_store_item_id " +
        " inner join rt_item_size isz on isz.id= sis.rt_item_size_id and sis.id= soi.rt_store_item_size_id  " +
        " inner join store as st on st.id = so.store_id " + storeSubQuery + sellerSubQuery +
        " where soi.id != '' " + whereQuery +
        " group by i.id,isz.id ) AS totalCount  "

    itemWiseSaleQuery = itemWiseSaleQuery + itemWiseSaleCountQuery;
    const queryParams = [
        ...storeSubQueryParams, ...sellerSubQueryParams, ...whereQueryParams, ...limitQueryParams,
        ...storeSubQueryParams, ...sellerSubQueryParams, ...whereQueryParams
    ];
    // console.log("itemWiseSaleQuery.....", itemWiseSaleQuery);
    queryExecution.queryExecution(client, jsonObj, event, itemWiseSaleQuery, queryParams, function (response) {
        // console.log("response.....", response);
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
            totalCount: finalResult[1][0].orderCount,
            successMessage: "Success",
            errorMessage: ""
        };
        callback(responses);
        // console.log("response....", response);

    });






}
module.exports = methods;
