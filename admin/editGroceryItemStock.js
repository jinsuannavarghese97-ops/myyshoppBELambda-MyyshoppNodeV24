let methods = {};
const queryExecution = require('../queryExecution');

methods.editGroceryItemStockList = function (client, jsonObj, event, callback) {

    var getCityQry = `select city_id as cityId from store where id = ? `
    queryExecution.queryExecution(client, jsonObj, event, getCityQry, [event.storeId], function (getCityQryResult) {
        if (getCityQryResult.success == '0') {
            callback(getCityQryResult);
        } else {

            let whereQuery = ""
            let whereQparams = []
            if (event.sellerId) {
                whereQuery = " si.seller_id = ? AND "
                whereQparams.push(event.sellerId)
            }
            if (event.storeId) {
                whereQuery = whereQuery + " sis.store_id = ? AND "
                whereQparams.push(event.storeId)
            }

            console.log("getCityQryResult.....", getCityQryResult);
            let selectQry = ` SELECT i.id as itemId,b.id as brandId, p.id as packId,
   si.id AS sellerItemId,
   si.item_code AS seller_item_code,
   si.item_name AS seller_item_name,
   si.display_name AS displayName,
   b.name AS brandName,
   p.name AS packName,
   cl1.id as categoryLevel1Id,
   cl1.name AS categoryLevel1,
   cl2.id as categoryLevel2Id,
   cl2.name AS categoryLevel2,
   cl3.id as categoryLevel3Id,
   cl3.name AS categoryLevel3,
   i.search_names as searchNames,
   i.name AS itemName,
   i.description as itemDescription,
   if(i.is_storedig_item_name=1,true,false) as isMyyShoppItemName,
   if(i.is_loose_item=1,true,false) as isLoose,
   i.denomination AS denomination,
   i.variation as variation,
   i.logo_path as imagePath,
   i.logo_path_thumb as imageThumbPath,
    CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/',
    (SELECT config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',i.logo_path_thumb )as   imageThumbfullPath,
     CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/',
    (SELECT config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',i.logo_path )as   imagefullPath,
   icg.category_group_id as categoryGroup,
   i.modified_by as userId,
   i.is_veg as isVeg,
   i.nutritional_info as nutritionalInfo,
   i.addictive_info as addictiveInfo,
   i.back_image as backImage,
   i.manufacturer_or_packer_name  as manufacturerOrPackerName,
   i.manufacturer_or_packer_address  as manufacturerOrPackerAddress,
   i.common_or_generic_name_of_commodity  as commonOrGenericNameOfCommodity,
   i.imported_product_country_of_origin as importedProductCountryOfOrigin,
   si.seller_id as sellerId,
   si.display_name as sellerItemDisplayName,
   si.category as sellerItemCategory,
   sis.store_id  as storeId,
   sis.item_code  as itemCode,
   sis.item_price as itemPrice,
   sis.stock_quantity as stockQuantity,
   if(sis.is_offer=1,true,false) as isOffer,
   sis.offer_price as offerPrice,
   if(sis.is_cancellable=1,true,false)  as isCancellable,
   if(sis.is_returnable=1,true,false) as isReturnable,
   sis.return_window_id as returnWindow_id,
   sis.time_to_ship_id as timeToShipId,
   sis.id as storeItemStockId,    
   sis.offer_text as offerText,
   DATE_FORMAT(sis.offer_from, '%d/%m/%Y') AS offerFrom,
   DATE_FORMAT(sis.offer_to, '%d/%m/%Y') AS offerTo,    
   sis.mrp,    
   sis.net_amount as netAmount,
   if(sis.is_active=1,true,false) as is_active,
   sis.ranking AS rank1,
   sis.item_buy_count AS itembuycount
FROM 
   store_item_stock as sis
       INNER JOIN 
   seller_item si on si.id = sis.seller_item_id
       INNER JOIN
   item i ON i.id = si.item_id
       INNER JOIN
   pack p ON i.pack_id = p.id
       LEFT OUTER JOIN
   brand b ON i.brand_id = b.id
       INNER JOIN
   category_level1 cl1 ON cl1.id = i.category_level1_id
       INNER JOIN
   category_level2 cl2 ON cl2.id = i.category_level2_id
       LEFT OUTER JOIN
   category_level3 cl3 ON cl3.id = i.category_level3_id
      INNER JOIN
   item_category_group AS icg on icg.item_id = i.id
    
WHERE
   ${whereQuery} si.item_id IS NOT NULL  AND si.is_active = TRUE 
AND si.is_approved = TRUE  AND i.is_active = TRUE  AND i.is_approved = TRUE and sis.city_id = ? AND sis.id = ?;`
            //console.log("selectQry....",selectQry);
            let params = [...whereQparams, getCityQryResult.result[0].cityId, event.storeItemStockId]
            queryExecution.queryExecution(client, jsonObj, event, selectQry, params, function (queryStringResult) {
                if (queryStringResult.success == '0') {
                    callback(queryStringResult);
                } else {
                    let result = queryStringResult.result
                    console.log("....", result.length)
                    for (let i = 0; i < result.length; i++) {
                        let rankData = result[i].rank1
                        console.log("rankData..", rankData)
                        result[i].rank = rankData
                    }
                    // console.log(queryStringResult)
                    callback(queryStringResult);
                }

            })
        }

    })
}
module.exports = methods;