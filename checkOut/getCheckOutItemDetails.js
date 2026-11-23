const queryExecution = require('../queryExecution')
let methods = {};

methods.getCheckOutItemDetailsList = function (client, jsonObj, event, callback) {

    let queryString = " SELECT sis.unit_type as unitType,sis.unit as unit,sis.net_amount as itemPrice,it.description as description,it.id AS itemId, sis.id AS storeItemStockId, b.id AS " +
        " brandId, sis.offer_text as offerText, b.name AS brandName, sis.item_name as itemName, if(sis.is_offer = true,'1','0') AS isOffer, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',it.logo_path) AS logoPath,it.logo_path_thumb AS logoPathThumb, if(sis.is_swap_item=true,'1','0') AS isSwapItem, sis.mrp AS mrp, sis.net_amount as netAmount, " +
        " p.name AS packName,p.id AS packId, sis.stock_quantity AS stockQuantity, " +
        " it.category_level1_id AS categoryLevel1Id, it.category_level2_id as categoryLevel2Id, it.category_level3_id AS categoryLevel3Id,s.name AS " +
        " storeName, if(it.is_loose_item=true,'1','0') AS isLooseItem, it.denomination AS denomination, it.letiation AS letiation, " +
        " sis.unit AS maximumDenomination, sis.unit_type AS looseItemUnitType, sise.slug as slug, " +
        " sise.seo_description as seoDescription, sise.seo_keywords AS seoKeywords, sise.seo_title AS seo_Title " +
        " FROM store_item_stock sis " +
        " inner join store_item_stock_seo as sise on sis.id = sise.store_item_stock_id  and sis.city_id = sise.city_id " +
        " INNER JOIN store AS s ON sis.store_id = s.id " +
        " INNER JOIN item it ON it.id = sis.item_id " +
        " INNER JOIN seller_item si ON si.id = sis.seller_item_id " +
        //" INNER JOIN category_level1 ic1 ON it.category_level1_id = ic1.id " +
        //" INNER JOIN category_level2 ic2 ON it.category_level2_id = ic2.id " +
        //" LEFT OUTER JOIN category_level3 ic3 ON it.category_level3_id = ic3.id " +
        " LEFT OUTER JOIN pack p ON p.id = it.pack_id " +
        " LEFT OUTER JOIN brand b ON b.id = it.brand_id " +
        " WHERE sis.id in (" + event.storeItemStockId + ")   AND " +
        " sis.is_active = TRUE " +
        " AND si.is_active = TRUE " +
        " AND si.is_approved = TRUE " +
        " AND it.is_active = TRUE  AND it.is_approved = TRUE "
    queryExecution.queryExecution(client, jsonObj, event, queryString, function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let result = queryStringResult.result
        let itemDetails = []

        if (result.length) {

            for (let i = 0; i < result.length; i++) {
                const itemDetail = {
                    description: result[i].description,
                    itemPrice: result[i].itemPrice,
                    itemId: result[i].itemId,
                    storeItemStockId: result[i].storeItemStockId,
                    brandId: result[i].brandId,
                    offerText: (result[i].offerText == null) ? '' : result[i].offerText,
                    brandName: result[i].brandName,
                    itemName: result[i].itemName,
                    isOffer: result[i].isOffer,
                    logoPath: result[i].logoPath,
                    logoPathThumb: result[i].logoPathThumb,
                    isSwapItem: result[i].isSwapItem,
                    mrp: result[i].mrp,
                    netAmount: result[i].netAmount,
                    packName: result[i].packName,
                    packId: result[i].packId,
                    stockQuantity: result[i].stockQuantity,
                    storeName: result[i].storeName,
                    isLooseItem: result[i].isLooseItem,
                    denomination: result[i].denomination,
                    letiation: result[i].letiation,
                    maximumDenomination: result[i].maximumDenomination,
                    looseItemUnitType: result[i].looseItemUnitType,
                    slug: result[i].slug,
                    seoDescription: result[i].seoDescription,
                    seoKeywords: (result[i].seoKeywords == null) ? '' : result[i].seoKeywords,
                    seo_Title: result[i].seo_Title
                }
                itemDetails.push(itemDetail)

            }

            const data = {
                success: "1",
                result: {
                    itemDetails: itemDetails
                },
                errorMessage: "",
                successMessage: itemDetails.length > 0 ? "Success" : "No data found.",
            };
            callback(data);

        }
    });

};
module.exports = methods;