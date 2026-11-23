const itemObject = require('./itemObject.js');
let queryExecution = require('../queryExecution');
let methods = {};
methods.getItemDetailsById = function (client, jsonObj, event, callback) {
    //console.log("enter")
    let itemDetail = [];
    let itemDetailResult = [];
    let itemDetailPacks = [];
    let getBreadCrumbData = [];
    //let finalArray = [];
    let sisId = event.storeItemStockId
    let queryString = "select sis.store_id as storeId, sis.city_id as cityId, ifnull(i.brand_id,0) as brandId, " +
        "if(i.is_loose_item is true,'1','0') as isLooseItem, sis.item_id as itemId, IFNULL(i.category_level1_id,0) as cat1, " +
        "IFNULL(i.category_level2_id,0) as cat2, IFNULL(i.category_level3_id,0) as cat3, " +
        "s.name as storeName, cl1.name as categoryLevel1, cl2.name as categoryLevel2, cl3.name as categoryLevel3, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        "(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        "(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) as imagePath,i.name as itemName " +
        "from store_item_stock as sis " +
        "inner join item as i on sis.item_id = i.id " +
        "inner join store as s on sis.store_id = s.id  " +
        "inner join category_level1 as cl1 on i.category_level1_id = cl1.id " +
        "inner join category_level2 as cl2 on i.category_level2_id = cl2.id " +
        "left join category_level3 as cl3 on i.category_level3_id = cl3.id " +
        "where sis.id = ? "
    //console.log("queryString..",queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, [sisId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        //console.log("results",results)
        getBreadCrumbData[0] = {
            storeId: results[0].storeId,
            storeName: results[0].storeName,
            catId1: results[0].cat1,
            categoryLevel1: (results[0].categoryLevel1 == null) ? '' : results[0].categoryLevel1,
            catId2: results[0].cat2,
            categoryLevel2: (results[0].categoryLevel2 == null) ? '' : results[0].categoryLevel2,
            catId3: results[0].cat3,
            categoryLevel3: (results[0].categoryLevel3 == null) ? '' : results[0].categoryLevel3
        }


        let storeDetails = "SELECT s.city_id as cityId,if(s.has_contact_us_without_price is true,'1','0') as hasContactUsWithoutPrice,if(s.has_buy_option is true,'1','0') as hasBuyOption,s.store_button_name as storeButtonName,if(s.display_item_price is true,'1','0') as displayItemPrice,c.symbol as currencySymbol,CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
            "(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
            "(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) as imagePath" +
            " from store as s INNER JOIN currency as c on c.id=s.currency_id where s.id = ? ";
        //console.log("storeDetails",storeDetails)
        queryExecution.queryExecution(client, jsonObj, event, storeDetails, [results[0].storeId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let storeResults = response.result
            //console.log("storeResults",storeResults)
            let itemName = results[0].itemName.replace(/'/ig, "\\'")
            let popularItems = `
                CALL groceryItemProfile(?, ?, ?, ?, ?, ?, ?)
            `;
            let popularItemsParams = [
                results[0].cityId,
                results[0].storeId,
                results[0].cat1,
                results[0].cat2,
                results[0].cat3,
                results[0].brandId,
                itemName
            ];

            console.log("popularItems", popularItems)
            queryExecution.queryExecution(client, jsonObj, event, popularItems, popularItemsParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let popularItemData = response.result
                console.log("response......", response)
                itemObject.itemObject(popularItemData, storeResults, '', function (response) {
                    let finalArray = {
                        itemDetail: response,
                        getBreadCrumbData: getBreadCrumbData,
                        storeResults: storeResults
                    }
                    const responseData = {
                        success: "1",
                        result: {
                            itemDetail: response,
                            getBreadCrumbData: getBreadCrumbData,
                            storeResults: storeResults
                        },
                        errorMessage: "",
                        successMessage: "Success"
                    };
                    callback(responseData);
                });

            });
        });

    });

}
module.exports = methods;