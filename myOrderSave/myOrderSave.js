const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let orderEditData = [];

    let orderEditQuery
    let orderUpdateQuery
    let orderId = event.orderId

    orderEditQuery = "select so.`store_id` AS storeId,rtsoi.`rt_store_item_id` AS itemId, rtsoi.`net_amount` AS price," +
        " rtsoi.`quantity` AS quantity, so.id AS orderId,rtsoi.item_name as itemName, rtsoi.item_price as itemMrp,rtsoi.rt_store_item_size_id as storeItemSizeId," +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/', (select config_value from configuration where config_key  = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 's3PathRestaurant'),'/',if(b.image_name is null,'ResNoImage.jpg',b.image_name))   AS imagename,d. name  as itemSize,so.id as saleOrderId  " +
        " FROM sale_order AS so " +
        " INNER JOIN `rt_sale_order_items` AS rtsoi ON rtsoi.`sale_order_id` = so.id " +
        " left join rt_sale_order_item_sublevel as rtsois on rtsois.rt_sale_order_items_id=rtsoi.id " +
        " inner join rt_store_item_size as rtsis on rtsis.rt_store_item_id=rtsoi.`rt_store_item_id` and rtsis.is_active = true " +
        " inner join rt_store_item as a on a.id=rtsis.rt_store_item_id  " +
        " inner join   rt_store_item_image b ON a.id =b.rt_store_item_id " +
        " INNER JOIN   rt_item_size d ON rtsis.rt_item_size_id = d.id " +
        " WHERE so.id = ? group by rtsoi.`rt_store_item_id` "
    console.log("orderEditQuery.....", orderEditQuery)
    //connection.query(orderEditQuery, function (error, orderEditResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, orderEditQuery, [orderId], function (response) {
        console.log("response.....", response)
        if (response.success == '0') {
            callback(response);
        }
        let orderEditResults = response.result;
        if (orderEditResults.length > 0) {
            for (let i = 0; i < orderEditResults.length; i++) {
                let orderEditDetails = [];
                orderEditDetails = {
                    storeId: orderEditResults[i].storeId,
                    itemId: orderEditResults[i].itemId,
                    quantity: orderEditResults[i].quantity,
                    price: orderEditResults[i].price,
                    itemName: orderEditResults[i].itemName,
                    imagename: orderEditResults[i].imagename,
                    storeItemSizeId: orderEditResults[i].storeItemSizeId,
                    itemSize: orderEditResults[i].itemSize,
                    saleOrderId: orderEditResults[i].saleOrderId

                }
                orderEditData.push(orderEditDetails)
            }

            orderUpdateQuery = " update  sale_order_status as sa " +
                " inner join sale_order as so on so.id=sa.sale_order_id " +
                " set sa.is_current_status = false " +
                " where so.id= ? ";
            console.log("orderUpdateQuery.....", orderUpdateQuery)
            //connection.query(orderUpdateQuery, function (error, orderUpdateResults, fields) { 
            queryExecution.queryExecution(client, jsonObj, event, orderUpdateQuery, [orderId], function (response) {
                console.log("response.....", response)
                callback(response);
            })

            const response = {
                success: "1",
                result: {
                    "orderEditDetails": orderEditData,

                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(response);
        } else {
            const response = {
                success: "0",
                result: {
                    "orderEditDetails": orderEditData,

                },
                errorMessage: "No Data Found",
                successMessage: ""
            };
            callback(response);

        }
    });
}
module.exports = methods;