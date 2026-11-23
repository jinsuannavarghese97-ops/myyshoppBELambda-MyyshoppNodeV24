const queryExecution = require('../queryExecution')
let methods = {};

methods.index = function (client, jsonObj, event, callback) {

    //context.callbackWaitsForEmptyEventLoop = false;
    let orderEditData = [];

    let orderEditQuery
    let orderUpdateQuery
    let orderId = event.orderId


    orderEditQuery = "select so.`store_id` AS storeId,so.id as saleOrderId, so.id AS orderId,cmSaleOrderItem.cm_item_id AS itemId,cmSaleOrderItem.net_amount AS price," +
        " cmSaleOrderItem.quantity AS quantity,cmSaleOrderItem.item_name AS itemName,cmSaleOrderItem.item_price AS itemMrp," +
        " cmSaleOrderItem.cm_item_size_id as cmItemSizeId,cmSaleOrderItem.cm_item_master_id as cmItemMasterId, " +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/', (select config_value from configuration where config_key  = 'bucketSubFolder'),'/', " +
        "  (select config_value from configuration where config_key = 's3PathCommonItem'),'/',ifnull(cmImage.image,'ResNoImage'))   AS imagename  " +
        " ,cmit.title as itemTitle,brand.name as brand,size.id as sizeId,size.name as sizeName " +
        " FROM sale_order AS so " +
        "  inner join cm_sale_order_item as cmSaleOrderItem on  cmSaleOrderItem.sale_order_id=so.id " +
        " inner join cm_item as cmit on cmit.id=cmSaleOrderItem.cm_item_id  " +
        "  left join cm_item_master as cmMaster on cmMaster.id = cmSaleOrderItem.cm_item_master_id " +
        "  left join cm_brand as brand on brand.id = cmMaster.cm_brand_id " +
        " left join cm_item_size as cmSize on cmSize.cm_item_id = cmSaleOrderItem.cm_item_id  " +
        "  left join cm_size as size on size.id = cmSize.cm_size_id " +
        "   left join cm_item_images as cmImage on  cmImage.cm_item_id= cmSaleOrderItem.cm_item_id " +

        " WHERE so.id = ? group by cmSaleOrderItem.cm_item_master_id "

    queryExecution.queryExecution(client, jsonObj, event, orderEditQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderEditResults = response.result
        //connection.query(orderEditQuery, function (error, orderEditResults, fields) {


        for (let i = 0; i < orderEditResults.length; i++) {
            let orderCommonEditDetails = [];
            orderCommonEditDetails = {
                storeId: orderEditResults[i].storeId,
                itemId: orderEditResults[i].itemId,
                quantity: orderEditResults[i].quantity,
                price: orderEditResults[i].price,
                itemMrp: orderEditResults[i].itemMrp,
                itemName: orderEditResults[i].itemName,
                imagename: orderEditResults[i].imagename,
                cmItemMasterId: orderEditResults[i].cmItemMasterId,
                itemSize: orderEditResults[i].itemSize,
                saleOrderId: orderEditResults[i].saleOrderId,
                cmItemSizeId: orderEditResults[i].cmItemSizeId,
                itemTitle: orderEditResults[i].itemTitle,
                brand: orderEditResults[i].brand,
                sizeId: orderEditResults[i].sizeId,
                sizeName: orderEditResults[i].sizeName

            }
            orderEditData.push(orderCommonEditDetails)
        }

        orderUpdateQuery = " update  sale_order_status as sa " +
            " inner join sale_order as so on so.id=sa.sale_order_id " +
            " set sa.is_current_status = false " +
            " where so.id = ? "
        //console.log("orderUpdateQuery..."+orderUpdateQuery)
        //connection.query(orderUpdateQuery, function (error, orderUpdateResults, fields) { 
        queryExecution.queryExecution(client, jsonObj, event, orderUpdateQuery, [orderId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            const responseData = {
                success: "1",
                result: {
                    "orderCommonEditDetails": orderEditData,

                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(responseData);
        })



    })
}
module.exports = methods;