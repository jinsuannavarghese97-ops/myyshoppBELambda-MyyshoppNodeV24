const queryExecution = require('../queryExecution')
let methods = {};

methods.index = function (client, jsonObj, event, callback) {

    let storeId = event.storeId
    //let storeId=319
    let sortBySearch = event.sortBySearch
    let brandSearch = event.brandSearch
    let hidMinSearch = event.hidMinSearch
    let hidMaxSearch = event.hidMaxSearch
    let featureSearch = event.featureSearch
    let colorSearch = event.colorSearch
    let sizeSearch = event.sizeSearch
    let offset = event.offset
    let max = event.max
    let category1Id = event.category1Id
    let category2Id = event.category2Id
    let category3Id = event.category3Id
    let sortSearchQuery = '';
    let sortSearchQueryParams = [];
    let brandSearchQuery = '';
    let brandSearchQueryParams = [];
    let priceSearchQuery = '';
    let priceSearchQueryParams = [];
    let materialSearchQuery = '';
    let materialSearchQueryParams = [];
    let colorSearchQuery = '';
    let colorSearchQueryParams = [];
    let sizeSearchQuery = '';
    let sizeSearchQueryParams = [];
    let itemrelatedData = [];
    let featureArray = [];
    let commonCountData = [];
    let mainCountData = [];
    let categoyLevel1Query = [];
    let categoyLevel1QueryParams = [];
    let categoyLevel2Query = [];
    let categoyLevel2QueryParams = [];
    let categoyLevel3Query = [];
    let categoyLevel3QueryParams = [];
    let categoryLevel1And2Query = [];
    let categoryLevel1And2And3Query = [];
    let storeQuery = " select cm.store_id as storeId,cmtc.cm_type_id as typeId " +
        " from cm_item_master as cm " +
        " inner join cm_type_main_category as cmtc on cmtc.cm_type_id=cm.cm_type_id " +
        " where cm.store_id= ? and cm.is_active=true " +
        " group by cm.store_id "
    queryExecution.queryExecution(client, jsonObj, event, storeQuery, [storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeQueryResult = response.result

        if (sortBySearch != "0" && sortBySearch != null && sortBySearch != "" && sortBySearch != 'null') {
            if (sortBySearch == 'alphabetical') {
                sortSearchQuery = sortSearchQuery + ' cim.name asc,'
            }

            else if (sortBySearch == 'asc') {
                sortSearchQuery = sortSearchQuery + ' ci.net_amount  ' + sortBySearch + ','
            }
            else if (sortBySearch == 'desc') {
                sortSearchQuery = sortSearchQuery + ' ci.net_amount  ' + sortBySearch + ','
            }
            else {
                sortSearchQuery = sortSearchQuery + ' ci.ranking asc,'
            }
        }
        if (brandSearch != "0" && brandSearch != null && brandSearch != "" && brandSearch != 'null') {
            brandSearchQuery = brandSearchQuery + ' and cim.cm_brand_id in (?)';
            brandSearchQueryParams.push(brandSearch);

        }
        if (hidMinSearch != "0" && hidMinSearch != null && hidMinSearch != "" && hidMinSearch != 'null' && hidMaxSearch != "0" && hidMaxSearch != null && hidMaxSearch != "" && hidMaxSearch != 'null') {
            priceSearchQuery = priceSearchQuery + " and (if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount)) between ? and ? "
            priceSearchQueryParams.push(hidMinSearch, hidMaxSearch);

        }
        if (featureSearch != "0" && featureSearch != null && featureSearch != "" && featureSearch != 'null') {
            materialSearchQuery = " and citf.cm_feature_value_id  in (?) "
            materialSearchQueryParams.push(featureSearch);

        }
        if (colorSearch != "0" && colorSearch != null && colorSearch != "" && colorSearch != 'null') {
            colorSearchQuery = " and cic.cm_colour_id in (?) ";
            colorSearchQueryParams.push(colorSearch);

        }
        if (sizeSearch != "0" && sizeSearch != null && sizeSearch != "" && sizeSearch != 'null') {
            sizeSearchQuery = " and cis.cm_size_id in (?) and (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) from cm_item as ci1 " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true  where  ci1.id = ci.id and cis.cm_size_id in (?) ) > 0 "
            sizeSearchQueryParams.push(sizeSearch, sizeSearch);

        }

        if (offset == null || offset == '') {
            offset = 0;
        }
        if (max == null || max == '') {
            max = 24;
        }

        if (category1Id != "0" && category1Id != null && category1Id != "" && category1Id != 'null' || category2Id != "0" && category2Id != null && category2Id != "" && category2Id != 'null' || category3Id != "0" && category3Id != null && category3Id != "" && category3Id != 'null') {
            if (category1Id != "0" && category1Id != null && category1Id != "" && category1Id != 'null') {
                categoyLevel1Query = " and cim.cm_category1_id = ? "
                categoyLevel1QueryParams.push(category1Id);
            }
            else if (category2Id != "0" && category2Id != null && category2Id != "" && category2Id != 'null') {
                categoyLevel2Query = " and cim.cm_category1_id = " + categoyLevel1Query + " and cim.cm_category2_id= ? ";
                categoyLevel2QueryParams = [...categoyLevel1QueryParams, category2Id];
            }
            else if (category3Id != "0" && category3Id != null && category3Id != "" && category3Id != 'null') {
                categoyLevel3Query = " and cim.cm_category1_id = " + categoyLevel1Query + " and cim.cm_category2_id= ? and cim.cm_category3_id = ? ";
                categoyLevel3QueryParams = [...categoyLevel1QueryParams, category2Id, category3Id];
            }
        }

        let mainCountQuery = " SELECT COUNT(*) AS totalCount " +
            " from cm_item_master as cim " +
            " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
            " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
            " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
            " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
            " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
            " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
            " left join cm_brand as cb on cb.id = cim.cm_brand_id " +
            " left join cm_item_images as cii on ci.id = cii.cm_item_id and cii.is_default = true " +
            " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
            " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
            " left join cm_item_size as cis on ci.id = cis.cm_item_id  where (cb.is_active = true OR cb.is_active IS NULL) " +
            " and (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL)" +
            " and cc1.is_active = true and cim.store_id = ? and ci.is_active = true " +
            " and cim.is_active = true and cim.cm_type_id =1 "
            + sortBySearch + brandSearchQuery + priceSearchQuery + materialSearchQuery + colorSearchQuery + sizeSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query
        //+storeQueryResult[0].typeId+brandSearchQuery+priceSearchQuery+materialSearchQuery+colorSearchQuery+sizeSearchQuery
        // " group by ci.id "
        const mainCountQueryParams = [storeId, ...brandSearchQueryParams, ...priceSearchQueryParams, ...materialSearchQueryParams, ...colorSearchQueryParams,
            ...sizeSearchQueryParams, ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams
        ];

        let mainCountDetails = [];
        queryExecution.queryExecution(client, jsonObj, event, mainCountQuery, mainCountQueryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let mainCountResults = response.result
            mainCountDetails = {
                itemCount: mainCountResults[0].totalCount
            }
            mainCountData.push(mainCountDetails)
            let mainQuery = " select distinct cc1.id as category_level1_id, cc1.name" +
                " from cm_item_master as cim " +
                " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left JOIN cm_category2 cc2 ON cim.cm_category2_id = cc2.id " +
                " left JOIN cm_category3 cc3 ON cim.cm_category3_id = cc3.id " +
                " left join cm_menu_sort_order as cmso on cmso.type_id = cc1.id and cmso.is_active = true" +
                " and cmso.store_id= ? and cmso.cm_menu_type_id = ? " +
                " and cmso.store_id= ? and cmso.cm_menu_type_id = ? " +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) " +
                " and (cc2.is_active = true OR cc2.is_active IS NULL) and cim.store_id = ? " +
                " and cc1.is_active = true and ci.is_active = true and cim.is_active = true " +
                " and cim.cm_type_id =1" +
                //storeQueryResult[0].typeId+
                " order by cmso.sort_order asc ;" +

                " select cs3.folder_name as s3_folder_name,ci.id as item_id, cim.store_id as store_id," +
                " cim.id as item_master_id,cim.name as item_name, ci.title as item_title," +
                " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/',cs3.folder_name,'/', cii.image) as item_image,if(curdate() between date(ci.offer_from) and date(ci.offer_to)," +
                " if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount) as net_amount," +
                " ci.mrp as mrp,  cb.name as brand_name," +
                " (select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity)) " +
                " from cm_item as ci1  " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true  where   ci1.id = ci.id )" +
                " as available_quantity, ci.slug as slug, if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,'1','0'),'0') as is_offer," +
                " ci.offer_text as offer_text,(select group_concat(cs.name separator ', ') as size_name " +
                " from cm_item as ci1 " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
                " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
                " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size," +
                " (select group_concat(cs.id separator ', ') as size_name " +
                " from cm_item as ci1 " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
                " inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_id," +
                " (select group_concat(cis.available_quantity separator ', ') as size_name " +
                " from cm_item as ci1 " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
                "  inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
                " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as item_size_quantity, " +
                " (select group_concat(cis.id separator ', ') as size_name " +
                " from cm_item as ci1 " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id " +
                "  inner join cm_size as cs on cs.id = cis.cm_size_id where ci1.id = ci.id and cis.is_active = true " +
                " and cs.is_active = true and cis.available_quantity > 0 group by ci1.id) as cm_itemids " +
                " from cm_item_master as cim " +
                " inner join cm_type_main_category as ctmc on cim.cm_type_id = ctmc.cm_type_id " +
                " inner join cms3image_type as cs3 on cs3.main_category = ctmc.main_category_id " +
                " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_brand as cb on cb.id = cim.cm_brand_id " +
                " left join cm_item_images as cii on ci.id = cii.cm_item_id and cii.is_default = true " +
                " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
                " left join cm_item_size as cis on ci.id = cis.cm_item_id  where (cb.is_active = true OR cb.is_active IS NULL) " +
                " and (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL)" +
                " and cc1.is_active = true and cim.store_id = ? and ci.is_active = true " +
                " and cim.is_active = true and cim.cm_type_id = ? " + brandSearchQuery + priceSearchQuery + materialSearchQuery + colorSearchQuery + sizeSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query +
                " group by ci.id " +
                " order by " + sortSearchQuery + " ci.ranking ASC, ci.itembuy_count DESC, ci.item_view_count DESC LIMIT ?,?; " +

                " select cc1.id as category_level1_id, cc1.name as category_level1_name,  cc2.id as category_level2_id," +
                " cc2.name as category_level2_name,  cc3.id as category_level3_id, cc3.name as category_level3_name " +
                " from cm_item_master as cim " +
                " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
                "  inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
                " left join cm_item_size as cis on ci.id = cis.cm_item_id " +
                "  left join cm_menu_sort_order as cmso1 on cmso1.type_id = cc1.id and cmso1.is_active = true and cmso1.store_id= ? " +
                " and cmso1.cm_menu_type_id = 1" +
                " left join cm_menu_sort_order as cmso2 on cmso2.type_id = cc2.id and cmso2.is_active = true and cmso2.store_id= ? and cmso2.cm_menu_type_id = 2" +
                " left join cm_menu_sort_order as cmso3 on cmso3.type_id = cc3.id and cmso3.is_active = true and cmso3.store_id= ?  and cmso3.cm_menu_type_id = 3" +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL) and cim.store_id = ? " +
                " and cc1.is_active = true and ci.is_active = true   and cim.is_active = true and cim.cm_type_id = ? " + brandSearchQuery + priceSearchQuery + materialSearchQuery + colorSearchQuery + sizeSearchQuery +
                " group by cc1.id, cc2.id, cc3.id  " +
                " order by cmso1.sort_order asc ,cmso2.sort_order asc ,cmso3.sort_order asc; " +

                " select cc.colour_code as colour_code, cc.name as colour_name, cc.id as colour_id " +
                " from cm_item_colour as cic " +
                " inner join cm_item as ci on cic.cm_item_id = ci.id " +
                " inner join cm_item_master as cim on cim.id = ci.cm_item_master_id " +
                " inner join cm_colour as cc on cc.id = cic.cm_colour_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " left join cm_item_size as cis on ci.id = cis.cm_item_id " +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) " +
                " and (cc2.is_active = true OR cc2.is_active IS NULL) and cc1.is_active = true " +
                " and cc.is_active = true and cic.is_active = true and ci.is_active = true" +
                " and cim.is_active = true and cim.cm_type_id = ? " + brandSearchQuery + priceSearchQuery + materialSearchQuery + sizeSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query + " and cim.store_id = ?" +
                " group by cc.id ;" +

                " select cs.name as size_name, cs.id as size_id,cis.id as cmItemSizeId " +
                " from cm_item_size as cis " +
                " inner join cm_item as ci on cis.cm_item_id = ci.id " +
                " inner join cm_item_master as cim on cim.id = ci.cm_item_master_id " +
                " inner join cm_size as cs on cs.id = cis.cm_size_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL) and cc1.is_active = true and cis.is_active = true and cs.is_active = true and cis.available_quantity > 0" +
                " and ci.is_active = true and cim.is_active = true and cim.cm_type_id = ? " + brandSearchQuery + priceSearchQuery + materialSearchQuery + colorSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query +
                " and cim.store_id = ? group by cs.id ;" +



                " select (if(curdate() between date(ci.offer_from) and date(ci.offer_to),if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount)) as net_amount,(select if(cis.id is null,ci1.available_quantity,MAX(cis.available_quantity))" +
                " from cm_item as ci1 " +
                " left join cm_item_size as cis on cis.cm_item_id = ci1.id and cis.is_active = true where ci1.id = ci.id ) as available_quantity " +
                " from cm_item_master as cim " +
                " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
                " left join cm_item_size as cis on ci.id = cis.cm_item_id " +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL) " +
                " and cc1.is_active = true and cim.is_active = true and ci.is_active = true and cim.store_id = ? " +
                " and cim.cm_type_id =? " + brandSearchQuery + materialSearchQuery + colorSearchQuery + sizeSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query +
                " order by (if(curdate() between date(ci.offer_from) " +
                " and date(ci.offer_to),if(ci.is_offer,if(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount)," +
                " ci.net_amount)) ASC ;" +

                " select cb.name as brand_name, cb.id as brand_id" +
                " from cm_item_master as cim " +
                " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
                " inner join cm_brand as cb on cb.id = cim.cm_brand_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
                " left join cm_item_size as cis on ci.id = cis.cm_item_id " +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL) and cc1.is_active = true" +
                " and cim.is_active = true and ci.is_active = true " +
                " and cb.is_active = true and cim.store_id = ? " +
                " and cim.cm_type_id = ? " + priceSearchQuery + materialSearchQuery + colorSearchQuery + sizeSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query +
                " group by cb.id;" +

                " select ci.id as cm_item_id, cf.id as cm_features_id, cf.name as cm_features_name, " +
                " cfv.feature_value as feature_value ,cfv.id as feature_value_id " +
                " from cm_item_master as cim " +
                " inner join cm_item as ci on cim.id = ci.cm_item_master_id " +
                " inner join cm_item_type_features as citf on ci.id = citf.cm_item_id " +
                " inner join cm_type_features as ctf on citf.cm_type_features_id = ctf.id " +
                " inner join cm_features as cf on cf.id = ctf.cm_features_id " +
                " inner join cm_feature_value as cfv on cfv.id = citf.cm_feature_value_id " +
                " inner join cm_category1 as cc1 on cim.cm_category1_id = cc1.id " +
                " left join cm_category2 as cc2 on cim.cm_category2_id = cc2.id " +
                " left join cm_category3 as cc3 on cim.cm_category3_id = cc3.id " +
                " left join cm_item_colour as cic on ci.id = cic.cm_item_id " +
                " left join cm_item_size as cis on ci.id = cis.cm_item_id " +
                " where (cc3.is_active = true OR cc3.is_active IS NULL) and (cc2.is_active = true OR cc2.is_active IS NULL) " +
                " and cc1.is_active = true and ci.is_active = true and cim.is_active = true and ctf.is_active = true " +
                " and cf.is_active = true and ctf.cm_type_id = " + storeQueryResult[0].typeId + " and cfv.is_active = true " +
                " and cim.store_id = " + storeId + brandSearchQuery + priceSearchQuery + colorSearchQuery + sizeSearchQuery + categoyLevel1Query + categoyLevel2Query + categoyLevel3Query +
                " group by cf.id, cfv.id " +
                " order by cf.name,cfv.feature_value; "

            const mainQueryParams = [
                storeId, storeQueryResult[0].typeId, storeId, storeQueryResult[0].typeId, storeId,
                storeId, storeQueryResult[0].typeId, ...brandSearchQueryParams, ...priceSearchQueryParams, ...materialSearchQueryParams, ...colorSearchQueryParams,
                ...sizeSearchQueryParams, ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams, parseInt(offset), parseInt(max),
                storeId, storeId, storeId, storeId, storeQueryResult[0].typeId, , ...brandSearchQueryParams, ...priceSearchQueryParams, ...materialSearchQueryParams, ...colorSearchQueryParams, ...sizeSearchQueryParams,
                storeQueryResult[0].typeId, ...brandSearchQueryParams, ...priceSearchQueryParams, ...materialSearchQueryParams,
                ...sizeSearchQueryParams, ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams, storeId,
                storeQueryResult[0].typeId, ...brandSearchQueryParams, ...priceSearchQueryParams, ...materialSearchQueryParams, ...colorSearchQueryParams,
                ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams, storeId,
                storeId, storeQueryResult[0].typeId, ...brandSearchQueryParams, ...materialSearchQueryParams, ...colorSearchQueryParams,
                ...sizeSearchQueryParams, ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams,
                storeId, storeQueryResult[0].typeId, ...priceSearchQueryParams, ...materialSearchQueryParams, ...colorSearchQueryParams,
                ...sizeSearchQueryParams, ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams,
                storeQueryResult[0].typeId, storeId, ...brandSearchQueryParams, ...priceSearchQueryParams, ...colorSearchQueryParams,
                ...sizeSearchQueryParams, ...categoyLevel1QueryParams, ...categoyLevel2QueryParams, ...categoyLevel3QueryParams
            ];

            queryExecution.queryExecution(client, jsonObj, event, mainQuery, mainQueryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let mainQueryQueryResult = response.result

                let featureIDs = [];
                if (mainQueryQueryResult[7].length > 0) {
                    for (let s = 0; s < mainQueryQueryResult[7].length; s++) {
                        if (featureIDs.indexOf(mainQueryQueryResult[7][s].cm_features_name) == false) {
                            for (let m = 0; m < mainQueryQueryResult[7].length; m++) {
                                if (mainQueryQueryResult[7][s].cm_features_id == mainQueryQueryResult[7][m].cm_features_id) {
                                    let feature_value = mainQueryQueryResult[7][m].feature_value
                                    let cm_features_name = mainQueryQueryResult[7][s].cm_features_name
                                    let cm_features_id = mainQueryQueryResult[7][s].cm_features_id
                                    for (let n = 0; n < cm_features_id.length; n++) {
                                        let featureVal = {
                                            feature_value: feature_value[n],
                                            cm_features_name: cm_features_name[n]
                                        }
                                        featureArray.push(featureVal)
                                    }


                                }
                            }
                        }

                    }

                }

                if (mainQueryQueryResult[1].length > 0) {

                    for (let i = 0; i < mainQueryQueryResult[1].length; i++) {
                        let sizeArray = []
                        if (mainQueryQueryResult[1][i].item_size != null && mainQueryQueryResult[1][i].item_size != '') {
                            let item_size = mainQueryQueryResult[1][i].item_size.split(',')
                            let item_size_id = mainQueryQueryResult[1][i].item_size_id.split(',')
                            let item_size_quantity = mainQueryQueryResult[1][i].item_size_quantity.split(',')
                            let cm_ItemSizeId = mainQueryQueryResult[1][i].cm_itemids.split(',')
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
                            s3_folder_name: mainQueryQueryResult[1][i].s3_folder_name,
                            item_name: mainQueryQueryResult[1][i].item_name,
                            item_id: mainQueryQueryResult[1][i].item_id,
                            store_id: mainQueryQueryResult[1][i].store_id,
                            item_master_id: mainQueryQueryResult[1][i].item_master_id,
                            item_title: mainQueryQueryResult[1][i].item_title,
                            item_image: mainQueryQueryResult[1][i].item_image,
                            mrp: mainQueryQueryResult[1][i].mrp,
                            net_amount: mainQueryQueryResult[1][i].net_amount,
                            brand_name: mainQueryQueryResult[1][i].brand_name,
                            available_quantity: mainQueryQueryResult[1][i].available_quantity,
                            slug: mainQueryQueryResult[1][i].slug,
                            is_offer: mainQueryQueryResult[1][i].is_offer,
                            offer_text: mainQueryQueryResult[1][i].offer_text,
                            item_size: mainQueryQueryResult[1][i].item_size,
                            item_size_id: mainQueryQueryResult[1][i].item_size_id,
                            item_size_quantity: mainQueryQueryResult[1][i].item_size_quantity,
                            sizeResult: sizeArray
                        }
                        itemrelatedData.push(itemData)
                    }
                }
                let minPrice = 0;
                let maxPrice = 0;
                if (mainQueryQueryResult[5].length > 0) {
                    minPrice = mainQueryQueryResult[5][0].net_amount
                    maxPrice = mainQueryQueryResult[5][(mainQueryQueryResult[5].length > 0 ? (mainQueryQueryResult[5].length - 1) : 0)].net_amount
                }
                let price = {
                    minPrice: minPrice,
                    maxPrice: maxPrice
                }
                const responseData = {
                    success: "1",
                    result: {
                        "storeQueryResult": storeQueryResult,
                        "headQueryResult": mainQueryQueryResult[0],
                        "itemListingQuery": itemrelatedData,
                        "leftCategory": mainQueryQueryResult[2],
                        "leftColour": mainQueryQueryResult[3],
                        "size": mainQueryQueryResult[4],
                        "featureQuery": mainQueryQueryResult[7],
                        "priceQuery": price,
                        "brandQuery": mainQueryQueryResult[6],
                        "featureMainQuery": featureArray,
                        "commonCountData": mainCountData
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };

                callback(responseData);

            })

        })

    })

}
module.exports = methods;