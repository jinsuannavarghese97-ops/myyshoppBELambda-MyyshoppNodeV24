let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.cmReOrder = function (client, jsonObj, event, callback) {
    let orderId = jsonObj.orderId
    let reOrderData = [];
    let sizeArray = [];
    let isCart = false;
    let reOrderQuery = " SELECT s.id as saleId,so.id as saleOrderId,st.id as storeId,s.net_amount as saleNetAmount,s.gross_amount as salegrossAmount, " +
        " '' as sisId,fsoi.item_name as itemName,b.name as brandName,fsoi.cm_item_id as itemId,fsoi.cm_item_master_id as itemMasterId, " +
        " fsoi.quantity as quantity,fsoi.mrp as mrp,fsoi.net_amount as netAmount,so.delivery_charge as deliveryCharge " +
        " ,so.consumer_number as conNumber,so.delivery_slot as slot,fi.title as itemTitle,cis.id as cmItemSizeId, " +
        " fi.available_quantity as stockUnit,fi.net_amount as stockNetAmount, cs.name as size_name, cs.id as size_id, " +
        " CONCAT((select config_value from configuration where config_key = 's3Address'),'/',  " +
        " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/',  " +
        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/',IFNULL(fii.image,'no_image_common_item.jpg')) as imageName, " +
        " (select group_concat(cs.name separator ', ') as size_name " +
        " from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = fi.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size," +
        " (select group_concat(cs.id separator ', ') as size_name " +
        " from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = fi.id and cis.is_active = true and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_id," +
        " (select group_concat(cis.available_quantity separator ', ') as size_name " +
        " from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        "  inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = fi.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_quantity, " +
        " (select group_concat(cis.id separator ', ') as size_name " +
        " from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        "  inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = fi.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as cm_itemids " +
        " FROM cm_sale_order_item as fsoi " +
        " INNER JOIN sale_order as so ON fsoi.sale_order_id = so.id " +
        " inner join sale as s on s.id = so.sale_id  " +
        " INNER JOIN store as st ON st.id = so.store_id " +
        " inner join cm_item as fi on fi.id=fsoi.cm_item_id " +
        " inner join cm_item_master as fim on fim.id=fi.cm_item_master_id and fim.is_active=true " +
        " LEFT  join cm_item_images as fii on fii.cm_item_id=fi.id and fii.is_default=1 " +
        " inner join cm_type_main_category as ctmc on fim.cm_type_id = ctmc.cm_type_id " +
        " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
        " LEFT  OUTER JOIN brand as b ON b.id=fim.cm_brand_id and b.is_active=true " +
        " left join cm_item_size as cis on cis.id = fsoi.cm_item_size_id " +
        " left join cm_size as cs on cs.id = cis.cm_size_id " +
        " WHERE fi.is_active=1 and so.id = ?";
    queryExecution.queryExecution(client, jsonObj, event, reOrderQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let reOrderResults = response.result;
        for (let i = 0; i < reOrderResults.length; i++) {
            let reOrderDetails = [];
            let sizeObj = {
                sizeName: reOrderResults[i].item_size,
                sizeId: reOrderResults[i].item_size_id,
                sizeQuantity: reOrderResults[i].item_size_quantity,
                cmItemSizeId: reOrderResults[i].cm_itemids
            }
            sizeArray.push(sizeObj)
            reOrderDetails = {
                itemName: reOrderResults[i].itemName,
                imageName: reOrderResults[i].imageName,
                MRP: reOrderResults[i].mrp,
                unitPrice: reOrderResults[i].netAmount,
                itemId: reOrderResults[i].itemId,
                sisId: reOrderResults[i].sisId,
                itemTitle: reOrderResults[i].itemTitle,
                stockQuantity: reOrderResults[i].stockUnit,
                purchasedQty: reOrderResults[i].quantity,
                brandName: reOrderResults[i].brandName,
                itemMasterId: reOrderResults[i].itemMasterId,
                storeId: reOrderResults[i].storeId,
                sizeName: reOrderResults[i].size_name,
                sizeId: reOrderResults[i].size_id,
                cmItemSizeId: reOrderResults[i].cmItemSizeId,
                sizeResult: sizeArray,
                isCart: true,
                itemNo: reOrderResults[i].itemId + '-' + reOrderResults[i].cmItemSizeId,
            }
            reOrderData.push(reOrderDetails)
        }
        const data = {
            success: "1",
            result: {
                "cmReOrder": reOrderData,
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(data)
    });
}
module.exports = methods;
