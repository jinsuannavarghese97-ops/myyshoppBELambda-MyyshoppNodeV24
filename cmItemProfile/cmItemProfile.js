const queryExecution = require('../queryExecution')
let methods = {};

methods.index = function (client, jsonObj, event, callback) {
    let cmItemId = event.cmItemId
    let cmStoreId = event.cmStoreId
    let itemlistData = [];
    let relatedlistData = [];
    let featureIds = [];


    let cmItemData = "select if(st.has_contact_us_without_price is true,'1','0') as hasContactUsWithoutPrice ,if(st.has_buy_option is true,'1','0') as hasBuyOption,if(st.store_button_name is null,'',st.store_button_name) as storeButtonName,ci.max_buy_count as maxBuyCount,cs3.folder_name as s3_folder_name,cim.name as name,ci.id as item_id," +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/') as imagePath, " +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/',(select config_value from configuration where config_key = 'CommonSizeChartImagePath'),'/') as imageSizeChartPath, " +
        "cim.store_id as store_id, ci.store_id as storeId,cur.symbol as currencySymbol, cc.name as colourName,cc.colour_code as colourCode,ci.cm_item_master_id as itemMasterId, cim.id as item_master_id,ci.title as title,ci.collection_name as collection_name," +
        "ci.model_name as model_name,ci.description as description , ci.over_view as over_view, " +
        " if(ci.has_size_chart is true,'1','0') as has_size_chart, ci.size_chart_image_path as size_chart_image_path," +
        " ci.warrenty as warrenty,ci.extented_warranty_cost as warrentyPrice, cc1.name as category1_name,cc1.id as category1_id, ci.warranty_path as warrantyPath," +
        " cc2.id as category2_id, cc2.name as category2_name,cc3.name as category3_name, cc3.id as category3_id, cb.name as brand_name, " +
        " ci.rating as rating, ci.mrp as mrp, if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount) as net_amount," +
        " (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true  where   ci1.id = ci.id ) as available_quantity, ci.slug as slug," +
        " if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,'1','0'),'0') as is_offer," +
        " ci.offer_text as offer_text, (select group_concat(cs.name separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size," +
        " (select group_concat(cs.id separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true" +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_id," +
        " (select group_concat(cis.id separator ', ') as size_name from cm_item as ci1 " +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true" +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as cm_itemids," +
        " (select group_concat(cis.available_quantity separator ', ') as size_name from cm_item as ci1" +
        " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
        " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
        " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_quantity," +
        " ci.is_trial_room_enabled as is_trial_room_enabled,st.name as storeName    from cm_item_master as cim " +
        " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
        " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
        " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
        " inner join store as st on st.id=ci.store_id " +
        " inner join currency as cur on st.currency_id=cur.id " +
        " left join cm_item_colour as ctc on ctc.cm_item_id=ci.id" +
        " left join cm_colour as cc on cc.id=ctc.cm_colour_id " +
        " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
        " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
        " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
        " left join cm_brand as cb on cim.cm_brand_id = cb.id " +
        " where (cb.is_active = true OR cb.is_active IS NULL) and (cc3.is_active = true OR cc3.is_active IS NULL) " +
        " and (cc2.is_active = true OR cc2.is_active IS NULL) and cim.is_active = true and ci.is_active = true and " +
        " cc1.is_active = true  and ci.id = ?;" +

        " Select cs3.folder_name as s3_folder_name," +
        " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/', ifnull(cii.image,'no_image_common_item.jpg')) as image_name,  if(cii.is_video is true,'1','0') as is_video " +
        "  from cm_item_master as cim " +
        " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id" +
        " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
        " inner join cm_item as ci on cim.id = ci.cm_item_master_id" +
        " left join cm_item_images as cii on ci.id = cii.cm_item_id" +
        " where (cii.is_trail_room = false OR cii.is_trail_room IS NULL) " +
        " and (cii.is_active = true OR cii.is_active IS NULL) and ci.id = ? " +
        " order by cii.is_default = true DESC, cii.is_video asc ;" +

        " select cmfl1.cm_item_id, cmfl1.name as level1Name,if(cmfl1.is_name_value_pair is true,'1','0') as isNameValuePair,group_concat(cmfl2.name separator '<br>') as level2Name,group_concat(cmfl2.value separator '<br>') as value,group_concat(cmfl2.image separator '<br>') as image " +
        " from cm_item_feature_level1 as cmfl1 " +
        " left join cm_item_feature_level2 as cmfl2 on cmfl2.cm_item_feature_level1_id = cmfl1.id " +
        " where cmfl1.is_active is true and (cmfl2.id is null or cmfl2.is_active is true) and cmfl1.cm_item_id= ? " +
        " group by cmfl1.id " +
        " order by cmfl1.is_name_value_pair desc; " +

        " select citf.id as cmItemTypeFeaturesId,cfv.feature_value as featureValue, " +
        " cfv.cm_features_id as cmFeaturesId,ctf.cm_type_id as typeId " +
        " from cm_item_type_features as citf " +
        " inner join cm_type_features as ctf on ctf.id=citf.cm_type_features_id " +
        " inner join cm_feature_value as cfv on cfv.id=citf.cm_feature_value_id " +
        " where cm_item_id=? ;"
    // console.log("cmItemData......",cmItemData)
    const cmItemDataParams = [cmItemId, cmItemId, cmItemId, cmItemId];
    queryExecution.queryExecution(client, jsonObj, event, cmItemData, cmItemDataParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let cmItemDataResult = response.result
        //console.log("cmItemDataResult......",cmItemDataResult)
        //connection.query(cmItemData, function (error, cmItemDataResult, fields) {
        let cmItemReltedData = '';
        if (cmItemDataResult[0].length > 0) {
            for (let i = 0; i < cmItemDataResult[0].length; i++) {
                let item_size = cmItemDataResult[0][i].item_size ? cmItemDataResult[0][i].item_size.split(',') : ''
                let item_size_id = cmItemDataResult[0][i].item_size ? cmItemDataResult[0][i].item_size_id.split(',') : ''
                let item_size_quantity = cmItemDataResult[0][i].item_size ? cmItemDataResult[0][i].item_size_quantity.split(',') : ''
                let cm_ItemSizeId = cmItemDataResult[0][i].item_size ? cmItemDataResult[0][i].cm_itemids.split(',') : ''
                let sizeArray = []

                for (let s = 0; s < item_size.length; s++) {
                    let sizeVal = {
                        sizeName: item_size[s],
                        sizeId: item_size_id[s],
                        sizeQuantity: item_size_quantity[s],
                        cmItemSizeId: cm_ItemSizeId[s]
                    }
                    sizeArray.push(sizeVal)
                }
                let featureData = []
                for (let m = 0; m < cmItemDataResult[2].length; m++) {
                    let level2NameDatum = cmItemDataResult[2][m].level2Name ? cmItemDataResult[2][m].level2Name.split('<br>') : ""
                    let level2ValueDatum = cmItemDataResult[2][m].value ? cmItemDataResult[2][m].value.split('<br>') : ""
                    let level2ImageDatum = cmItemDataResult[2][m].image ? cmItemDataResult[2][m].image.split('<br>') : ""
                    let level2Data = []
                    for (let c = 0; c < level2NameDatum.length; c++) {
                        const level2 = {
                            name: level2NameDatum[c] == null ? "" : level2NameDatum[c],
                            value: level2ValueDatum[c] == null ? "" : level2ValueDatum[c],
                            image: level2ImageDatum[c] == null ? '' : cmItemDataResult[0][i].imagePath + level2ImageDatum[c]
                        }
                        level2Data.push(level2)
                    }
                    const featureResult = {
                        featureName: cmItemDataResult[2][m].level1Name,
                        isNameValuePair: cmItemDataResult[2][m].isNameValuePair,
                        level2Data: level2Data
                    }
                    featureData.push(featureResult)

                }
                let featureDataArray = []
                for (let f = 0; f < cmItemDataResult[3].length; f++) {
                    const featureArrayResult = {
                        cmFeaturesId: cmItemDataResult[3][f].cmFeaturesId,
                        featureValue: cmItemDataResult[3][f].featureValue,
                        cmItemTypeFeaturesId: cmItemDataResult[3][f].cmItemTypeFeaturesId
                    }
                    featureDataArray.push(featureArrayResult)
                }


                let itemData = [];
                itemData = {

                    s3_folder_name: cmItemDataResult[0][i].s3_folder_name,
                    name: cmItemDataResult[0][i].name,
                    colourName: cmItemDataResult[0][i].colourName,
                    colourCode: cmItemDataResult[0][i].colourCode,
                    item_id: cmItemDataResult[0][i].item_id,
                    store_id: cmItemDataResult[0][i].store_id,
                    storeId: cmItemDataResult[0][i].storeId,
                    itemMasterId: cmItemDataResult[0][i].itemMasterId,
                    item_master_id: cmItemDataResult[0][i].item_master_id,
                    title: cmItemDataResult[0][i].title,
                    collection_name: cmItemDataResult[0][i].collection_name,
                    model_name: cmItemDataResult[0][i].model_name,
                    description: cmItemDataResult[0][i].description,
                    storeName: cmItemDataResult[0][i].storeName,
                    currencySymbol: cmItemDataResult[0][i].currencySymbol,
                    over_view: cmItemDataResult[0][i].over_view,
                    has_size_chart: cmItemDataResult[0][i].has_size_chart,
                    size_chart_image_path: cmItemDataResult[0][i].size_chart_image_path ? cmItemDataResult[0][i].imageSizeChartPath + cmItemDataResult[0][i].size_chart_image_path : '',
                    warrenty: cmItemDataResult[0][i].warrenty,
                    warrentyPrice: cmItemDataResult[0][i].warrentyPrice,
                    warrantyPath: cmItemDataResult[0][i].warrantyPath ? cmItemDataResult[0][i].imagePath + cmItemDataResult[0][i].warrantyPath : '',
                    category1_name: cmItemDataResult[0][i].category1_name,
                    category1_id: cmItemDataResult[0][i].category1_id,
                    category2_id: cmItemDataResult[0][i].category2_id,
                    category2_name: cmItemDataResult[0][i].category2_name,
                    category3_name: cmItemDataResult[0][i].category3_name,
                    category3_id: cmItemDataResult[0][i].category3_id,
                    brand_name: cmItemDataResult[0][i].brand_name,
                    rating: cmItemDataResult[0][i].rating,
                    mrp: cmItemDataResult[0][i].mrp,
                    net_amount: cmItemDataResult[0][i].net_amount,
                    available_quantity: cmItemDataResult[0][i].available_quantity,
                    slug: cmItemDataResult[0][i].slug,
                    is_offer: cmItemDataResult[0][i].is_offer,
                    offer_text: cmItemDataResult[0][i].offer_text,
                    size_name: cmItemDataResult[0][i].size_name,
                    hasContactUsWithoutPrice: cmItemDataResult[0][i].hasContactUsWithoutPrice,
                    storeButtonName: cmItemDataResult[0][i].storeButtonName,
                    hasBuyOption: cmItemDataResult[0][i].hasBuyOption,
                    sizeResult: sizeArray,
                    featureData: featureData,
                    maxBuyCount: cmItemDataResult[0][i].maxBuyCount,
                    featureDataArray: featureDataArray

                }
                itemlistData.push(itemData)

            }



        }

        cmItemReltedData = " select if(st.has_contact_us_without_price is true,'1','0') as hasContactUsWithoutPrice ,if(st.has_buy_option is true,'1','0') as hasBuyOption,if(st.store_button_name is null,'',st.store_button_name) as storeButtonName, " +
            " cs3.folder_name as s3_folder_name,ci.id as item_id, cim.store_id as store_id,cim.name as name," +
            " CONCAT(?, ifnull(cii.image,'no_image_common_item.jpg')) as item_image," +
            " cim.id as item_master_id, cim.name as item_name,ci.title as item_title, " +
            " if(curdate() between date(ci.offer_from) and date(ci.offer_to)," +
            " if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount) as net_amount, " +
            " ci.mrp as mrp,  cb.name as brand_name,(select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) from cm_item as ci1 " +
            " left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true " +
            " where   ci1.id = ci.id ) as available_quantity, ci.slug as slug,if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,'1','0'),'0') as is_offer," +
            "ci.offer_text as offer_text, (select group_concat(cs.name separator ', ') as size_name from cm_item as ci1 " +
            " left join cm_item_size as cis on cis.cm_item_id = ci1.id  " +
            " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id " +
            " and cis.is_active = true and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size," +
            " (select group_concat(cs.id separator ', ') as size_name " +
            " from cm_item as ci1 " +
            " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
            " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
            " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_id," +
            " (select group_concat(cis.id separator ', ') as size_name from cm_item as ci1 " +
            " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
            " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true" +
            " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as cm_itemids," +
            " (select group_concat(cis.available_quantity separator ', ') as size_name " +
            " from cm_item as ci1" +
            " left join cm_item_size as cis on cis.cm_item_id = ci1.id  " +
            " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
            " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_quantity " +
            " from cm_item_master as cim " +
            " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
            " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
            " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
            " inner join store as st on st.id=ci.store_id " +
            " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id" +
            " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
            " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
            " left join cm_brand as cb on cb.id = cim.cm_brand_id " +
            " left join cm_item_images as cii on ci.id = cii.cm_item_id and cii.is_default = true " +
            " where  (cii.is_active = TRUE OR cii.is_active IS NULL) and (cb.is_active = true OR cb.is_active IS NULL) and (cc3.is_active = true OR cc3.is_active IS NULL)" +
            " and (cc2.is_active = true OR cc2.is_active IS NULL) and cc1.is_active = true and cim.store_id = ? " +
            " and (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) " +
            " from cm_item as ci1 " +
            "left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true " +
            " where   ci1.id = ci.id ) > 0 and ci.is_active = true and cim.is_active = true " +
            " and cim.cm_type_id = 1 and cim.cm_category1_id = ? " +
            " and ci.id not in (?) group by ci.id order by ci.ranking ASC, ci.itembuy_count DESC," +
            "ci.item_view_count DESC limit 15 ;" +

            " select cs3.folder_name as s3_folder_name,if(curdate() between date(ci.offer_from) and date(ci.offer_to)," +
            " if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount) as net_amount," +
            " CONCAT(?, ifnull(cii.image,'no_image_common_item.jpg')) as item_image," +
            " ci.slug as slug,ci.id as itemId from cm_item_master as cim  " +
            " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
            " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
            " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
            " left join cm_item_images as cii on ci.id = cii.cm_item_id and cii.is_default = true  " +
            " where cim.is_active = true and ci.is_active = true " +
            " and (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) from cm_item as ci1 " +
            " left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true " +
            " where   ci1.id = ci.id ) > 0  " +
            " and ci.id not in (?) and cim.id = ? ;" +

            " select ci.slug as slug, cc.colour_code as colour_code, cc.name as colour_name, cc.id as colour_id " +
            " from cm_item_colour as cic " +
            " inner join cm_item as ci on cic.cm_item_id = ci.id " +
            " inner join cm_item_master as cim on cim.id = ci.cm_item_master_id " +
            " inner join cm_colour as cc on cc.id = cic.cm_colour_id " +
            " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
            " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
            "  left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
            " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
            "  left join cm_item_size as cis on ci.id = cis.cm_item_id " +
            " where (cc3.is_active = true OR cc3.is_active IS NULL) " +
            " and (cc2.is_active = true OR cc2.is_active IS NULL) and cc1.is_active = true " +
            " and cc.is_active = true and cic.is_active = true and ci.is_active = true " +
            " and (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) from cm_item as ci1 " +
            "  left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true " +
            " where ci1.id = ci.id ) > 0 " +
            " and cim.is_active = true and cim.id = ? " +
            " and ci.id not in (?)" +
            " group by cc.id ;" +

            " select cif1.id as level1_id, cif2.id as level2_id," +
            " cif1.name as feature_level1_name , cif1.is_name_value_pair as is_name_value_pair," +
            " cif2.name as feature_level2_name, cif2.value as feature_level2_value,CONCAT(?, ifnull(cif2.image,'no_image_common_item.jpg')) as image" +
            " from cm_item_feature_level1 as cif1 " +
            " inner join cm_item_feature_level2 as cif2 on cif1.id = cif2.cm_item_feature_level1_id " +
            " where cif1.is_active = true and cif2.is_active = true " +
            " and cif1.cm_item_id = ? " +
            " order by cif1.is_name_value_pair "
        console.log("cmItemReltedData ", cmItemReltedData)
        const cmItemReltedDataParams = [
            cmItemDataResult[0][0].imagePath, cmStoreId, cmItemDataResult[0][0].category1_id, cmItemId,
            cmItemDataResult[0][0].imagePath, cmItemId, cmItemDataResult[0][0].itemMasterId,
            cmItemDataResult[0][0].itemMasterId, cmItemId,
            cmItemDataResult[0][0].imagePath, cmItemId
        ];
        queryExecution.queryExecution(client, jsonObj, event, cmItemReltedData, cmItemReltedDataParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let cmItemReltedDataResults = response.result
            //connection.query(cmItemReltedData, function (error, cmItemReltedDataResults, fields) {
            if (cmItemReltedDataResults[0].length > 0) {
                for (let i = 0; i < cmItemReltedDataResults[0].length; i++) {
                    let sizeArray = []
                    if (null != cmItemReltedDataResults[0][i].item_size && 'null' != cmItemReltedDataResults[0][i].item_size) {
                        let item_size = cmItemReltedDataResults[0][i].item_size.split(',')
                        let item_size_id = cmItemReltedDataResults[0][i].item_size_id.split(',')
                        let item_size_quantity = cmItemReltedDataResults[0][i].item_size_quantity.split(',')
                        let cm_ItemSizeId = cmItemReltedDataResults[0][i].cm_itemids.split(',')

                        for (let s = 0; s < item_size.length; s++) {
                            let sizeVal = {
                                sizeName: item_size[s],
                                sizeId: item_size_id[s],
                                sizeQuantity: item_size_quantity[s],
                                cmItemSizeId: cm_ItemSizeId[s]
                            }
                            sizeArray.push(sizeVal)
                        }
                    }

                    let itemData = [];
                    itemData = {
                        imageName: cmItemReltedDataResults[0][i].item_image,
                        s3_folder_name: cmItemReltedDataResults[0][i].s3_folder_name,
                        name: cmItemReltedDataResults[0][i].name,
                        item_id: cmItemReltedDataResults[0][i].item_id,
                        store_id: cmItemReltedDataResults[0][i].store_id,
                        storeId: cmItemReltedDataResults[0][i].storeId,
                        itemMasterId: cmItemReltedDataResults[0][i].itemMasterId,
                        item_master_id: cmItemReltedDataResults[0][i].item_master_id,
                        title: cmItemReltedDataResults[0][i].title,
                        collection_name: cmItemReltedDataResults[0][i].collection_name,
                        model_name: cmItemReltedDataResults[0][i].model_name,
                        description: cmItemReltedDataResults[0][i].description,
                        over_view: cmItemReltedDataResults[0][i].over_view,
                        has_size_chart: cmItemReltedDataResults[0][i].has_size_chart,
                        size_chart_image_path: cmItemReltedDataResults[0][i].size_chart_image_path,
                        warrenty: cmItemReltedDataResults[0][i].warrenty,
                        category1_name: cmItemReltedDataResults[0][i].category1_name,
                        category1_id: cmItemReltedDataResults[0][i].category1_id,
                        category2_id: cmItemReltedDataResults[0][i].category2_id,
                        category2_name: cmItemReltedDataResults[0][i].category2_name,
                        category3_name: cmItemReltedDataResults[0][i].category3_name,
                        category3_id: cmItemReltedDataResults[0][i].category3_id,
                        brand_name: cmItemReltedDataResults[0][i].brand_name,
                        rating: cmItemReltedDataResults[0][i].rating,
                        mrp: cmItemReltedDataResults[0][i].mrp,
                        net_amount: cmItemReltedDataResults[0][i].net_amount,
                        available_quantity: cmItemReltedDataResults[0][i].available_quantity,
                        slug: cmItemReltedDataResults[0][i].slug,
                        is_offer: cmItemReltedDataResults[0][i].is_offer,
                        size_name: cmItemReltedDataResults[0][i].size_name,
                        sizeResult: sizeArray
                    }
                    relatedlistData.push(itemData)

                }
            }

            if (cmItemReltedDataResults[3].length > 0) {
                for (let n = 0; n < cmItemReltedDataResults[3].length; n++) {
                    if (featureIds.indexOf(cmItemReltedDataResults[3].level1_id == false)) {
                        if (cmItemReltedDataResults[3][0].is_name_value_pair == true) {
                            for (let j = 0; j < cmItemReltedDataResults[3].length; j++) {
                                if (cmItemReltedDataResults[3][0].level1_id[n] == cmItemReltedDataResults[3][0].level1_id[j]) {
                                    if (cmItemReltedDataResults[3][0].image != null && cmItemReltedDataResults[3][0].image != '') {

                                    }
                                }
                            }
                        }
                        else {
                            for (let m = 0; m < cmItemReltedDataResults[3].length; m++) {
                                if (cmItemReltedDataResults[3][0].level1_id[n] == cmItemReltedDataResults[3][0].level1_id[m]) {
                                    if (cmItemReltedDataResults[3].image != null && cmItemReltedDataResults[3].image != '') {
                                    }
                                }
                            }
                        }
                        featureIds = featureIds + cmItemReltedDataResults[3][0].level1_id
                    }
                }
            }
            const responseData = {
                success: "1",
                result: {
                    "itemProfile": itemlistData,
                    "imageResult": cmItemDataResult[1],
                    "relateditemProfile": relatedlistData,
                    "similarItem": cmItemReltedDataResults[1],
                    "colourResultProfile": cmItemReltedDataResults[2],
                    "otherData": cmItemReltedDataResults[3]
                },
                errorMessage: "",
                successMessage: "Success"
            };
            console.log("responseData.result.....", responseData.result)
            callback(responseData);

        })

    })

}
module.exports = methods;