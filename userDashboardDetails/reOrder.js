let methods = {};
let queryExecution = require('../queryExecution');
methods.reOrder = function (client,jsonObj,event, callback) {
    let orderId = jsonObj.orderId
    let reOrderData = [];
    let reOrderQuery = " select soi.quantity as purchasedQty,b.name as brandName,soi.item_name as itemName,if(i.is_loose_item = false,p.name,concat(soi.unit,' ',soi.unit_type)) as packName,  if(i.is_loose_item = false,sis.mrp,(sis.mrp/(sis.unit/soi.unit))) as mrp, if(i.is_loose_item = false,sis.net_amount,(sis.net_amount/(sis.unit/soi.unit))) AS unitPrice,soi.net_amount as netAmount, " +
        " sis.stock_quantity as quantity,i.id as itemId,p.id as packId,sis.id as sisId,sis.store_id as storeId,i.is_loose_item as looseItem, " +
        " sis.unit as stockUnit,sis.net_amount as stockNetAmount,sis.unit_type as stockUnitType, " +
        " CONCAT((select config_value from configuration where config_key = 's3Address'),'/', " +
        " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 'itemImagesFolder'),'/',i.logo_path) as imageName,i.id as itemId, " +
        " p.id as packId ,sis.stock_quantity as stockQuantity " +
        " from sale_order_item as soi  inner join sale_order as so on so.id = soi.sale_order_id " +
        " inner join sale as s on s.id = so.sale_id  INNER JOIN item as i ON i.id = soi.item_id " +
        " LEFT OUTER JOIN pack p ON p.id = i.pack_id LEFT OUTER JOIN brand b on i.brand_id=b.id AND b.is_active = true  AND b.is_approved = true " +
        " INNER JOIN store_item_stock sis ON soi.store_item_stock_id= sis.id " +
        " where so.id = ? " +
        " AND sis.is_active = true  AND i.is_active = true  AND i.is_approved = true " +
        " AND p.is_active = true  AND p.is_approved = true "
    //connection.query(reOrderQuery, function (error, reOrderResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, reOrderQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let reOrderResults = response.result;
        for (let i = 0; i < reOrderResults.length; i++) {
            let reOrderDetails = [];
            reOrderDetails = {
                storeId: reOrderResults[i].storeId,
                itemName: reOrderResults[i].itemName,
                imageName: reOrderResults[i].imageName,
                packName: reOrderResults[i].packName,
                MRP: reOrderResults[i].mrp,
                unitPrice: reOrderResults[i].unitPrice,
                itemId: reOrderResults[i].itemId,
                sisId: reOrderResults[i].sisId,
                packId: reOrderResults[i].packId,
                stockQuantity: reOrderResults[i].stockQuantity,
                purchasedQty: reOrderResults[i].purchasedQty,
                brandName: reOrderResults[i].brandName,
                isOffer: "0",
                itemNo: i
                
            }
            reOrderData.push(reOrderDetails)
        }
        
        //callback(reOrderData);
        const data = {
            success: "1",
            result: {
                "reOrder": reOrderData,
                
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(data);
    })
}
module.exports = methods;
