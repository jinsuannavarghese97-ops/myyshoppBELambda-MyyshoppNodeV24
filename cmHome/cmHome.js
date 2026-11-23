const queryExecution = require('../queryExecution')
let methods = {};

methods.index = function (client, jsonObj, event, callback) {
    //context.callbackWaitsForEmptyEventLoop = false;
    let storeId = event.storeId
    let bannerData = [];
    let bannerDataParams = [];
    let popularItemDataResult = [];
    bannerData = " SELECT  CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 'storeImagesFolder'),'/',b.image_path) AS image_path" +
        " FROM banner AS b " +
        " LEFT JOIN banner_url_coordinates AS buc ON b.id = buc.banner_id  " +
        " WHERE b.theme_id IS NULL and b.is_active=TRUE AND b.is_approved=TRUE " +
        " AND b.store_id= ? AND b.banner_type_id=2 AND b.rank>0 " +
        " AND (CURDATE() BETWEEN DATE(b.from_date) AND DATE(b.to_date)) ;" +

        " select if((cha.name is null or cha.name = ''),'NO_DATA',cha.name) as name, " +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cha.image)as image, " +
        " if((cha.url is null or cha.url = ''),'NO_DATA',cha.url) as url " +
        " from cm_home_ads as cha " +
        " where cha.store_id= ? and cha.is_active = true and cha.is_text = false " +
        " and cha.theme_id IS NULL " +
        " order by cha.row_number ASC, cha.sort_order ASC ;" +


        " select cs3.folder_name as s3_folder_name,ci.id as item_id, cim.store_id as store_id," +
        " cim.id as item_master_id,cim.name as item_name, ci.title as item_title, " +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/', cii.image) as item_image," +
        " if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount) as net_amount," +
        " ci.mrp as mrp, cb.name as brand_name,ci.available_quantity as available_quantity,ci.slug as slug," +
        " if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,'1','0'),'0') as is_offer," +
        " ci.offer_text as offer_text ," +
        "(select group_concat(cs.name separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size," +
        " (select group_concat(cs.id separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_id," +
        " (select group_concat(cis.available_quantity separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_quantity, " +
        " (select group_concat(cis.id separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as cm_item_size_id " +
        " from cm_item_master as cim  " +
        " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
        " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
        " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
        " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
        " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
        " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
        "  left join cm_brand as cb on cb.id = cim.cm_brand_id " +
        " left join cm_item_images as cii on ci.id = cii.cm_item_id and cii.is_default = true " +
        " where (cb.is_active = true OR cb.is_active IS NULL) and (cc3.is_active = true OR cc3.is_active IS NULL) " +
        " and (cc2.is_active = true OR cc2.is_active IS NULL) and cc1.is_active = true " +
        " and (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) " +
        " from cm_item as ci1 " +
        "  left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true  where   ci1.id = ci.id ) > 0 " +
        " and cim.store_id = ? and ci.is_active = true " +
        " and cim.is_active = true and cim.cm_type_id = 1 " +
        " order by ci.ranking ASC, ci.itembuy_count DESC, ci.item_view_count DESC  ";
    bannerDataParams = [storeId, storeId, storeId];
    queryExecution.queryExecution(client, jsonObj, event, bannerData, bannerDataParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let bannerDataResults = response.result
        for (let i = 0; i < bannerDataResults[2].length; i++) {
            let sizeArray = []
            if (bannerDataResults[2][i].item_size != null && bannerDataResults[2][i].item_size != '') {
                let item_size = bannerDataResults[2][i].item_size.split(',')
                //console.log("item_size......"+item_size)
                let item_size_id = bannerDataResults[2][i].item_size_id.split(',')
                let item_size_quantity = bannerDataResults[2][i].item_size_quantity.split(',')
                let cm_item_size_id = bannerDataResults[2][i].cm_item_size_id.split(',')

                for (let s = 0; s < item_size.length; s++) {
                    let sizeVal = {
                        sizeName: item_size[s].toString().trim(),
                        sizeId: item_size_id[s].toString().trim(),
                        sizeQuantity: item_size_quantity[s].toString().trim(),
                        cmItemSizeId: cm_item_size_id[s].toString().trim()
                    }
                    sizeArray.push(sizeVal)
                }
            }

            let popularItemData = [];
            popularItemData = {

                s3_folder_name: bannerDataResults[2][i].s3_folder_name,
                item_id: bannerDataResults[2][i].item_id,
                store_id: bannerDataResults[2][i].store_id,
                item_master_id: bannerDataResults[2][i].item_master_id,
                item_name: bannerDataResults[2][i].item_name,
                item_title: bannerDataResults[2][i].item_title,
                item_image: bannerDataResults[2][i].item_image,
                net_amount: bannerDataResults[2][i].net_amount,
                mrp: bannerDataResults[2][i].mrp,
                brand_name: bannerDataResults[2][i].brand_name,
                available_quantity: bannerDataResults[2][i].available_quantity,
                slug: bannerDataResults[2][i].slug,
                is_offer: bannerDataResults[2][i].is_offer,
                offer_text: bannerDataResults[2][i].offer_text,
                sizeResult: sizeArray
            }
            popularItemDataResult.push(popularItemData)
        }
        const responseData = {
            success: "1",
            result: {
                "bannerResult": bannerDataResults[0],
                "advertisementResult": bannerDataResults[1],
                "popularItemResult": popularItemDataResult
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);
    })
}
module.exports = methods;