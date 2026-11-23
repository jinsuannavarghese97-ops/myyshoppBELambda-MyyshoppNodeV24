let methods = {};
let queryExecution = require('../queryExecution');
methods.reOrderRating = function (client, jsonObj, event, callback) {
    let orderId = jsonObj.orderId
    let orderRatingData = [];
    let orderRatingQuery = " select b.name as brandName,soi.item_name as itemName,if(i.is_loose_item = false,p.name,concat(soi.unit,' ',soi.unit_type)) as packName,  if(i.is_loose_item = false,sis.mrp,(sis.mrp/(sis.unit/soi.unit))) as mrp, if(i.is_loose_item = false,sis.net_amount,(sis.net_amount/(sis.unit/soi.unit))) AS unitPrice,soi.net_amount as netAmount, " +
        " sis.stock_quantity as quantity,i.id as itemId,p.id as packId,sis.id as sisId,sis.store_id as storeId,i.is_loose_item as looseItem, " +
        " sis.unit as stockUnit,sis.net_amount as stockNetAmount,sis.unit_type as stockUnitType, " +
        " CONCAT((select config_value from configuration where config_key = 's3Address'),'/', " +
        " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 'itemImagesFolder'),'/',i.logo_path) as imageName " +
        " from sale_order_item as soi  inner join sale_order as so on so.id = soi.sale_order_id " +
        " inner join sale as s on s.id = so.sale_id  INNER JOIN item as i ON i.id = soi.item_id " +
        " LEFT OUTER JOIN pack p ON p.id = i.pack_id LEFT OUTER JOIN brand b on i.brand_id=b.id AND b.is_active = true  AND b.is_approved = true " +
        " INNER JOIN store_item_stock sis ON soi.store_item_stock_id= sis.id " +
        " where so.id = ? " +
        " AND sis.is_active = true  AND i.is_active = true  AND i.is_approved = true " +
        " AND p.is_active = true  AND p.is_approved = true "
    queryExecution.queryExecution(client, jsonObj, event, orderRatingQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderResults = response.result;
        for (let i = 0; i < orderResults.length; i++) {
            let orderDetails = [];
            orderDetails = {
                brandName: orderResults[i].brandName,
                imageName: orderResults[i].imageName,
                itemName: orderResults[i].itemName,
                packName: orderResults[i].packName,
                mrp: orderResults[i].mrp,
                unitprice: orderResults[i].unitprice,
            }
            orderRatingData.push(orderDetails)
        }
        const data = {
            success: "1",
            result: {
                "reOrderRating": orderRatingData,
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(data);
    })
}
module.exports = methods;
