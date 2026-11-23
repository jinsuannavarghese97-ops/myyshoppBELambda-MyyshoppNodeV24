const queryExecution = require('../queryExecution');
const methods = {};
methods.sellerItemMap = function (client, jsonObj, event, callback) {
    let resultData = [];
    let cquery = "";
    let cqueryParams = [];
    let limitQuery = "";
    let limitQueryParams = [];
    let isMapped = "";
    let sellerSubQuery = "";
    let sellerSubQueryParams = [];
    let searchKey = "";
    let noMapped = "";
    if (event.sellerId) {
        sellerSubQuery = " where si.seller_id = ? ";
        sellerSubQueryParams = [event.sellerId];
    }

    if (event.sellerMax) {
        limitQuery = " limit ?, ?";
        limitQueryParams = [parseInt(event.sellerOffset), parseInt(event.sellerMax)];
    }


    if (event.searchCategory != null && event.searchCategory == "1" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and i.name like ?") : (cquery + " and i.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "2" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and b.name like ?") : (cquery + " and b.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "3" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and c1.name like ?") : (cquery + " and c1.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "4" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and c2.name like ?") : (cquery + " and c2.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "5" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and c3.name like ?") : (cquery + " and c3.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "6" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and concat(ifnull(si.brand,''),' ',si.item_name,' ',ifnull(si.pack,'')) like ?") : (cquery + " and concat(ifnull(si.brand,''),' ',si.item_name,' ',ifnull(si.pack,'')) like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "7" && event.searchText != null && event.searchText.trim() != "") {
        noMapped = "Y"
        cquery = cquery == "" ? (" and si.category like ?") : (cquery + " and si.category like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "8" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and si.item_code like ?") : (cquery + " and si.item_code like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.selectMapped == "1" || event.selectMapped == "2") {
        noMapped = "Y"
        isMapped = event.selectMapped == "1" ? true : false
        cquery = cquery == "" ? (" and si.is_approved = ? and si.is_active = ?") : (cquery + " and si.is_approved = ? and si.is_active = ?");
        cqueryParams.push(isMapped, isMapped);
    }
    if (event.selectMapped == "3") {
        noMapped = "Y"
        cquery = cquery == "" ? (" and i.logo_path  ='noimage2x.jpg' and i.logo_path_thumb  ='noimage1x.jpg' ") : (cquery + "and i.logo_path  ='noimage2x.jpg' and i.logo_path_thumb  ='noimage1x.jpg' ")
    }
    let generalQuery = " SELECT sl.id as sellerId, sl.retail_group_name as retailGroupName " +
        " FROM seller as sl " +
        " INNER JOIN store as st on st.seller_id = sl.id " +
        " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
        " INNER JOIN main_category as mc on mc.id = smc.main_category_id and mc.is_active is true " +
        " WHERE mc.main_group_category_id = 1 " +
        " GROUP BY sl.id " +
        " ORDER BY sl.retail_group_name asc; ";
    let generalQueryParams = [];

    if (event.sellerId) {
        generalQuery = generalQuery + "select i.id as itemId,i.name as itemName,si.seller_id,si.display_name as displayName, " +
            " si.id,si.category,si.item_name,si.item_code,si.item_id,if(si.is_approved is true,'true','false') as is_approved, " +
            " if(si.is_active is true,'true','false') as is_active,c1.id as level1Id,c2.id as level2Id,c3.id as level3Id, " +
            " i.brand_id as brandId,i.pack_id as packId,b.name as brandName, p.name as pName,i.logo_path as logoThumb,i.logo_path_thumb as logoThumbName, " +
            " i.description as description,if(i.is_active is true,'true','false') as itemStatus,i.search_names as searchName," +
            " if(i.is_storedig_item_name is true,'true','false') as storeItemName, c1.name as level1Name,r.name as region,r.id as regionId,c2.name as  level2Name,c3.name as level3Name, " +
            " i.denomination,i.variation ,if(i.is_loose_item is true,'true','false') as isLooseItem, cg.id as categoryGroupId, cg.name as categoryGroupName, if(i.is_storedig_item_name is true,'true','false') as isStoreDigItemName, concat(ifnull(si.brand,''),' ',si.item_name,' ',ifnull(si.pack,'')) as concatedName ," +
            " i.is_veg ,i.nutritional_info,i.addictive_info,i.back_image,i.manufacturer_or_packer_name,i.manufacturer_or_packer_address," +
            " i.common_or_generic_name_of_commodity,i.imported_product_country_of_origin " +
            //" (select 1 from store_item_stock as sis where sis.seller_item_id = si.id and sis.item_id = i.id) as isStockUpdate  " + 
            " from seller_item as si " +
            " left join item as i on si.item_id = i.id and i.is_active is true " +
            " left join category_level1 as c1 on i.category_level1_id = c1.id " +
            " left join category_level2 as c2 on i.category_level2_id = c2.id " +
            " left outer join category_level3 as c3 on i.category_level3_id = c3.id " +
            " left outer join brand as b on i.brand_id = b.id " +
            " left join pack as p on i.pack_id = p.id " +
            " left outer join region as r on r.id=i.region_id  " +
            " left outer join item_category_group as icg on icg.item_id=i.id  " +
            " left outer join category_group as cg on cg.id = icg.category_group_id  " +
            sellerSubQuery + cquery + limitQuery + ";" +

            " select count(si.id) as totalCount " +
            " from seller_item as si " +
            " left join item as i on si.item_id = i.id  " +
            " left join category_level1 as c1 on i.category_level1_id = c1.id " +
            " left join category_level2 as c2 on i.category_level2_id = c2.id " +
            " left outer join category_level3 as c3 on i.category_level3_id = c3.id " +
            " left outer join brand as b on i.brand_id = b.id " +
            " left join pack as p on i.pack_id = p.id " +
            " left outer join region as r on r.id=i.region_id  " +
            " left outer join item_category_group as icg on icg.item_id=i.id  " +
            " left outer join category_group as cg on cg.id = icg.category_group_id  " +
            sellerSubQuery + cquery + ";" +

            " SELECT config_value FROM configuration WHERE config_key = 's3Address';" +
            " SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName';" +
            " SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder';" +
            " SELECT config_value FROM configuration WHERE config_key = 'itemImagesFolder';";
        generalQueryParams = [...sellerSubQueryParams, ...cqueryParams, ...limitQueryParams, ...sellerSubQueryParams, ...cqueryParams];
    }
    //console.log("generalQuery------------------------- ",generalQuery)
    queryExecution.queryExecution(client, jsonObj, event, generalQuery, generalQueryParams, function (response) {
        //console.log("--response----",response)
        if (response.success == '0') {
            callback(response);
        }
        let generalResults = response.result
        if (!event.sellerId) {
            const response = {
                success: "1",
                resultData: [],
                totalCount: 0,
                searchKey: "",
                noMapped: "",
                isMapped: "",
                sellerList: generalResults,
                errorMessage: "",
                successMessage: "success"
            }
            return callback(response);
        }
        if (generalResults[1].length > 0) {


            for (let i = 0; i < generalResults[1].length; i++) {
                resultData[i] = {
                    sellerItemId: generalResults[1][i].id,
                    itemId: generalResults[1][i].itemId == "" || generalResults[1][i].itemId == null ? '' : generalResults[1][i].itemId,
                    itemName: generalResults[1][i].itemName == "" || generalResults[1][i].itemName == null ? '' : generalResults[1][i].itemName,
                    displayName: generalResults[1][i].displayName == "" || generalResults[1][i].displayName == null ? '' : generalResults[1][i].displayName,
                    sellerId: generalResults[1][i].seller_id,
                    sellerItemName: generalResults[1][i].item_name,
                    category: generalResults[1][i].category == "" || generalResults[1][i].category == null ? '' : generalResults[1][i].category,
                    itemCode: generalResults[1][i].item_code,
                    isApproved: generalResults[1][i].is_approved,
                    isActive: generalResults[1][i].is_active,
                    categoryLevel1: generalResults[1][i].cLevel1 == '' || generalResults[1][i].cLevel1 == null ? '' : generalResults[1][i].cLevel1,
                    categoryLevel2: generalResults[1][i].cLevel2 == '' || generalResults[1][i].cLevel2 == null ? '' : generalResults[1][i].cLevel2,
                    categoryLevel3: generalResults[1][i].cLevel3 == "" || generalResults[1][i].cLevel3 == null ? '' : generalResults[1][i].cLevel3,
                    brandId: generalResults[1][i].brandId == "" || generalResults[1][i].brandId == null ? '' : generalResults[1][i].brandId,
                    packId: generalResults[1][i].packId == "" || generalResults[1][i].packId == null ? '' : generalResults[1][i].packId,
                    brandName: generalResults[1][i].brandName == "" || generalResults[1][i].brandName == null ? '' : generalResults[1][i].brandName,
                    packName: generalResults[1][i].pName == "" || generalResults[1][i].pName == null ? '' : generalResults[1][i].pName,
                    imageNameOnly: generalResults[1][i].logoThumb == "" || generalResults[1][i].logoThumb == null ? '' : generalResults[1][i].logoThumb,
                    imageNameWithPath: generalResults[1][i].logoThumb == "" || generalResults[1][i].logoThumb == null ? '' : generalResults[3][0].config_value + '/' + generalResults[4][0].config_value + '/' + generalResults[5][0].config_value + '/' + generalResults[6][0].config_value + '/' + generalResults[1][i].logoThumb,
                    thumbImageNameWithPath: generalResults[1][i].logoThumbName == "" || generalResults[1][i].logoThumbName == null ? '' : generalResults[3][0].config_value + '/' + generalResults[4][0].config_value + '/' + generalResults[5][0].config_value + '/' + generalResults[6][0].config_value + '/' + generalResults[1][i].logoThumbName,
                    logoThumbName: generalResults[1][i].logoThumbName ? generalResults[1][i].logoThumbName : "",
                    pathOnly: generalResults[3][0].config_value + '/' + generalResults[4][0].config_value + '/' + generalResults[5][0].config_value + '/' + generalResults[6][0].config_value,
                    description: generalResults[1][i].description ? generalResults[1][i].description : "",
                    itemStatus: generalResults[1][i].itemStatus ? generalResults[1][i].itemStatus : "",
                    searchName: generalResults[1][i].searchName ? generalResults[1][i].searchName : "",
                    storeItemName: generalResults[1][i].storeItemName ? generalResults[1][i].storeItemName : "",
                    level1Name: generalResults[1][i].level1Name ? generalResults[1][i].level1Name : "",
                    region: generalResults[1][i].region ? generalResults[1][i].region : "",
                    regionId: generalResults[1][i].regionId ? generalResults[1][i].regionId : "",
                    level2Name: generalResults[1][i].level2Name ? generalResults[1][i].level2Name : "",
                    level3Name: generalResults[1][i].level3Name ? generalResults[1][i].level3Name : "",
                    denomination: generalResults[1][i].denomination ? generalResults[1][i].denomination : "",
                    variation: generalResults[1][i].variation ? generalResults[1][i].variation : "",
                    isLooseItem: generalResults[1][i].isLooseItem ? generalResults[1][i].isLooseItem : "",
                    level1Id: generalResults[1][i].level1Id ? generalResults[1][i].level1Id : "",
                    level2Id: generalResults[1][i].level2Id ? generalResults[1][i].level2Id : "",
                    level3Id: generalResults[1][i].level3Id ? generalResults[1][i].level3Id : "",
                    categoryGroupId: generalResults[1][i].categoryGroupId ? generalResults[1][i].categoryGroupId : "",
                    categoryGroupName: generalResults[1][i].categoryGroupName ? generalResults[1][i].categoryGroupName : "",
                    isStoreDigItemName: generalResults[1][i].isStoreDigItemName ? generalResults[1][i].isStoreDigItemName : "",
                    concatedName: generalResults[1][i].concatedName,
                    isStockUpdate: generalResults[1][i].isStockUpdate,
                    isVeg: generalResults[1][i].is_veg ? generalResults[1][i].is_veg : "",
                    nutritionalInfo: generalResults[1][i].nutritional_info ? generalResults[1][i].nutritional_info : "",
                    addictiveInfo: generalResults[1][i].addictive_info ? generalResults[1][i].addictive_info : "",
                    backImage: generalResults[1][i].back_image ? generalResults[1][i].back_image : "",
                    manufacturerOrPackerName: generalResults[1][i].manufacturer_or_packer_name ? generalResults[1][i].manufacturer_or_packer_name : "",
                    manufacturerOrPackerAddress: generalResults[1][i].manufacturer_or_packer_address ? generalResults[1][i].manufacturer_or_packer_address : "",
                    commonOrGenericNameOfCommodity: generalResults[1][i].common_or_generic_name_of_commodity ? generalResults[1][i].common_or_generic_name_of_commodity : "",
                    importedProductCountryOfOrigin: generalResults[1][i].imported_product_country_of_origin ? generalResults[1][i].imported_product_country_of_origin : "",
                    backImageWithPath: generalResults[1][i].back_image == "" || generalResults[1][i].back_image == null ? "" : generalResults[3][0].config_value + '/' + generalResults[4][0].config_value + '/' + generalResults[5][0].config_value + '/' + generalResults[6][0].config_value + '/' + generalResults[1][i].back_image



                }
                //console.log(resultData[i].backImageWithPath)
            }


            let totalCount = generalResults[2][0].totalCount

            const response = {
                success: "1",
                resultData: event.sellerId ? JSON.parse(JSON.stringify(resultData).replace(/\:null/gi, "\:\"\"")) : [],
                totalCount: event.sellerId ? totalCount : 0,
                searchKey: searchKey,
                noMapped: noMapped,
                isMapped: isMapped,
                sellerList: generalResults[0],
                errorMessage: "",
                successMessage: "success"
            }
            return callback(response);

        } else {
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "No Data Found"
            };
            return callback(response);
        }
    });
}
module.exports = methods;