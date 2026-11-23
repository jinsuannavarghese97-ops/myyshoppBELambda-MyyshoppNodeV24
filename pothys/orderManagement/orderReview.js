let mysql = require('mysql');
let methods = {};
methods.orderReview = function (client, jsonObj, orderReviewParams, queryExecution, event, callback) {

    let orderId = orderReviewParams.orderId
    let itemResult = []
    let orderQuery = " SELECT `main_category_id` as mainCategoryId FROM `sale_order` WHERE id = ? ";
    //connection.query(orderQuery, function(error, orderResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, orderQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderResults = response.result;
        if (orderResults.length > 0) {
            let orderItemQuery = ""
            if (orderResults[0].mainCategoryId == 5) {
                orderItemQuery = " select (soi.quantity* soi.total_item_amount) as totalPrice,group_concat(rtItemSl1.name,'|',rtItemSl2.name,'|',sosl.net_amount) as subitem ,soi.sale_order_id as orderId,'' as reviewStatus, " +
                    " soi.id,soi.quantity,i.name as itemName,soi.item_price, soi.net_amount, " +
                    " soi.total_item_amount,i.name,rtImage.image_name as imageName,so.message,so.delivery_charge,isz.name as itemsize,i.is_photo_cake,soi.photo_cake_image" +
                    " from rt_sale_order_items as soi " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " inner join rt_store_item as i on i.id= soi.rt_store_item_id " +
                    " left JOIN rt_sale_order_item_sublevel sosl on sosl.rt_sale_order_items_id =soi.id " +
                    " left join rt_item_sub_level1 as rtItemSl1 on rtItemSl1.id = sosl.rt_item_sub_level1_id " +
                    " left join rt_item_sub_level2 as rtItemSl2 on rtItemSl2.id = sosl.rt_item_sub_level2_id " +
                    " left join rt_store_item_image as rtImage on rtImage.rt_store_item_id =i.id and rtImage.is_default=1 " +
                    " inner join rt_store_item_size sis on sis.rt_store_item_id=soi.rt_store_item_id " +
                    " inner join rt_item_size isz  on isz.id= sis.rt_item_size_id and sis.id= soi.rt_store_item_size_id " +
                    " where so.id = ? group by soi.id "
            }
            else if (orderResults[0].mainCategoryId == 8 || orderResults[0].mainCategoryId == 9 || orderResults[0].mainCategoryId == 11 || orderResults[0].mainCategoryId == 18) {
                orderItemQuery = " select soi.id as itemId,cz.name as itemSize,soi.mrp,cs3.folder_name as s3_folder_name," +
                    " soi.cm_item_id,cmb.name as brand, " +
                    " (soi.quantity* soi.item_price) as totalPrice," +
                    " soi.item_name as itemName, " +
                    " soi.net_amount,soi.sale_order_id as orderId, " +
                    " '' as reviewStatus, " +
                    " soi.quantity as quantity, " +
                    " so.delivery_charge, " +
                    " soi.item_price as itemPrice, " +
                    " soi.id,soi.item_price,i.title,soi.net_amount, cz.name as size_name, " +
                    " '' as total_item_amount,so.message,so.delivery_charge, " +
                    " concat((select config_value from configuration where config_key = 's3Address'),'/',  (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/',  (select config_value from configuration where config_key = 'bucketSubFolder'),'/',   (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/',im.image) as imageName " +
                    " from cm_sale_order_item as soi " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " inner join cm_item_master as cim on cim.id = soi.cm_item_master_id " +
                    " left join cm_brand as cmb on cmb.id = cim.cm_brand_id" +
                    " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
                    " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
                    " inner join cm_item as i on i.id= soi.cm_item_id " +
                    " left join cm_item_images as im on i.id= im.cm_item_id and im.is_default = 1 " +
                    " left join cm_item_size as ciz on soi.cm_item_size_id= ciz.id " +
                    " left join cm_size as cz on cz.id= ciz.cm_size_id " +
                    " where so.id = ?";
            }
            else if (orderResults[0].mainCategoryId == 10) {
                orderItemQuery = " select soi.id as itemId,cz.name as itemSize,i.title,cs3.folder_name as s3_folder_name," +
                    " soi.cm_item_id, " +
                    " (soi.quantity* soi.net_amount) as totalPrice,i.mrp," +
                    " soi.item_name as itemName, " +
                    " soi.net_amount,soi.sale_order_id as orderId, " +
                    " '' as reviewStatus, " +
                    " soi.quantity as quantity, " +
                    " so.delivery_charge, " +
                    " soi.net_amount as itemPrice, " +
                    " soi.id,soi.item_price, " +
                    " '' as total_item_amount,so.message,so.delivery_charge, " +
                    " concat((select config_value from configuration where config_key = 's3Address'),'/',  (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/',  (select config_value from configuration where config_key = 'bucketSubFolder'),'/',   (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/',im.image) as imageName " +
                    " from cm_sale_order_item as soi " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " inner join cm_item_master as cim on cim.id = soi.cm_item_master_id " +
                    " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
                    " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
                    " inner join cm_item as i on i.id= soi.cm_item_id " +
                    " left join cm_item_images as im on i.id= im.cm_item_id and im.is_default = 1 " +
                    " left join cm_item_size as ciz on soi.cm_item_size_id= ciz.id " +
                    " left join cm_size as cz on cz.id= ciz.cm_size_id " +
                    " where so.id = ?";
            }
            else if (orderResults[0].mainCategoryId == 6) {
                orderItemQuery = " select fsoi.id as itemId,fsoi.item_name as itemName,fsoi.quantity as quantity,fsoi.review_status as reviewStatus, " +
                    " fsoi.net_amount as itemPrice,so.message,fb.name as brandName, " +
                    " concat((select config_value from configuration where config_key = 's3Address'),'/',  " +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3PathFurniture'),'/',(select config_value from configuration where config_key = 'FurnitureItemImagesPath'),'/',if(fii.image_path is null,'no_image_furniture_item.png',fii.image_path)) as imageName, " +
                    " fsoi.sale_order_id as orderId ,fi.stock_quantity as stockUnit " +
                    " from fur_sale_order_items as fsoi " +
                    " inner join fur_item_master as fim on fim.id=fsoi.fur_item_master_id " +
                    " inner join fur_item as fi on fi.id=fsoi.fur_item_id " +
                    " left join fur_item_images as fii on fii.fur_item_id=fi.id and fii.is_default=true " +
                    " left join fur_brand as fb on fb.id=fim.fur_brand_id " +
                    " inner join sale_order as so on so.id = fsoi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id  " +
                    " where so.id =? " +
                    " group by fsoi.id "
            }
            else if (orderResults[0].mainCategoryId == 21) {
                orderItemQuery = " select soi.id as itemId,soi.item_name as itemName,soi.item_code as itemCode,soi.quantity as quantity,soi.net_amount as itemPrice,so.message,b.name as brandName,p.name as packName," +
                    " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3PharmacyItemFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3PharmacyItemImages'),'/',i.logo_path) as imageName, " +
                    " if(i.is_loose_item is true,'1','0') as looseItem,sos.unit as stockUnit,sos.net_amount as stockNetAmount,sos.unit_type as stockUnitType,soi.review_status as reviewStatus,soi.sale_order_id as orderId " +
                    " from ph_sale_order_item as soi " +
                    " INNER JOIN ph_store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
                    " inner join ph_item as i on i.id= soi.ph_item_id " +
                    " INNER JOIN ph_pack p ON p.id = i.ph_pack_id " +
                    " LEFT OUTER JOIN ph_brand as b ON i.ph_brand_id=b.id " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " where so.id =?";
            }
            else {
                orderItemQuery = " select soi.id as itemId,soi.item_name as itemName,soi.item_code as itemCode,soi.quantity as quantity,soi.net_amount as itemPrice,so.message,b.name as brandName,p.name as packName," +
                    " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 'itemImagesFolder'),'/',i.logo_path) as imageName, " +
                    " if(i.is_loose_item is true,'1','0') as looseItem,sos.unit as stockUnit,sos.net_amount as stockNetAmount,sos.unit_type as stockUnitType,soi.review_status as reviewStatus,soi.sale_order_id as orderId " +
                    " from sale_order_item as soi " +
                    " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
                    " inner join item as i on i.id= soi.item_id " +
                    " INNER JOIN pack p ON p.id = i.pack_id " +
                    " LEFT OUTER JOIN brand as b ON i.brand_id=b.id " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " where so.id = ?";
            }
            //connection.query(orderItemQuery, function(error, orderItemResult, fields) {
            queryExecution.queryExecution(client, jsonObj, event, orderItemQuery, [orderId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let orderItemResult = response.result;

                if (orderItemResult.length > 0) {
                    for (let i = 0; i < orderItemResult.length; i++) {
                        let packName = !orderItemResult[i].packName ? "" : orderItemResult[i].packName
                        let unitNames = ""
                        if ((orderResults[0].mainCategoryId == 1 || orderResults[0].mainCategoryId == 21) && orderItemResult[i].looseItem == true) {
                            unitNames = (parseFloat(orderItemResult[i].stockUnit) / (parseFloat(orderItemResult[i].stockNetAmount) / parseFloat(orderItemResult[i].itemPrice)))
                            if (unitNames == '1000' && orderItemResult[i].stockUnitType.toLowerCase() == 'gm') {
                                packName = '1 Kg'
                            }
                            else if (unitNames == '1000' && orderItemResult[i].stockUnitType.toLowerCase() == 'ml') {
                                packName = '1 Ltr'
                            }
                            else {
                                packName = unitNames + ' ' + orderItemResult[i].stockUnitType
                            }
                        }
                        itemResult[i] = {
                            orderId: orderItemResult[i].orderId,
                            mainCategoryId: orderResults[0].mainCategoryId,
                            itemId: orderItemResult[i].itemId,
                            size_name: orderItemResult[i].size_name,
                            itemName: !orderItemResult[i].itemName ? "" : orderItemResult[i].itemName,
                            itemCode: !orderItemResult[i].itemCode ? "" : orderItemResult[i].itemCode,
                            quantity: !orderItemResult[i].quantity ? "" : orderItemResult[i].quantity,
                            // itemPrice: !orderItemResult[i].itemPrice?"":orderItemResult[i].itemPrice,
                            unitPrice: !orderItemResult[i].itemPrice ? "" : "Rs." + orderItemResult[i].itemPrice.toFixed(2),
                            message: !orderItemResult[i].message ? "" : orderItemResult[i].message,
                            brandName: !orderItemResult[i].brandName ? "" : orderItemResult[i].brandName,
                            packName: packName,
                            imageName: !orderItemResult[i].imageName ? "" : orderItemResult[i].imageName,
                            looseItem: !orderItemResult[i].looseItem ? "" : orderItemResult[i].looseItem,
                            stockUnit: !orderItemResult[i].stockUnit ? "" : orderItemResult[i].stockUnit,
                            stockNetAmount: !orderItemResult[i].stockNetAmount ? "" : "Rs." + orderItemResult[i].stockNetAmount.toFixed(2),
                            stockUnitType: !orderItemResult[i].stockUnitType ? "" : orderItemResult[i].stockUnitType,
                            reviewStatus: !orderItemResult[i].reviewStatus ? "" : orderItemResult[i].reviewStatus,
                            netAmount: orderItemResult[i].itemPrice * orderItemResult[i].quantity
                        }
                    }
                }
                callback(itemResult)

            });
        }

    });
}
module.exports = methods;
