let mysql = require('mysql');
let itemObject = require('./itemObject.js');
const queryExecution = require('../queryExecution');
let methods = {};
methods.getPopularItem = function (client, jsonObj, event, callback) {

    //console.log("4.....",connection)
    let storeId = jsonObj.storeId;
    let offset = jsonObj.offset;
    let max = jsonObj.max;

    let itemResult = [];
    let selectedProduct = jsonObj.selectedProduct
    //console.log("a...",new Date())
    let storeDetails = "SELECT s.city_id as cityId,s.has_contact_us_without_price as hasContactUsWithoutPrice,s.has_buy_option as hasBuyOption,s.store_button_name as storeButtonName,s.display_item_price as displayItemPrice,c.symbol as currencySymbol,CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        "(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        "(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) as imagePath, ? as itemMax, ? as itemOffset" +
        " from store as s INNER JOIN currency as c on c.id=s.currency_id where s.id = ? ";

    queryExecution.queryExecution(client, jsonObj, event, storeDetails, [parseInt(max), parseInt(offset), storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeResults = response.result

        if (storeResults.length > 0) {
            // console.log("c...",new Date())
            let popularItems = "call usp_get_popular_items(?,?,?,?)";

            //connection.query(popularItems, true, (errorItem, popularItemData, fields) => {
            //queryExecution.queryExecution(client, jsonObj, event, storeDetails, function (popularItemData) {
            queryExecution.queryExecution(client, jsonObj, event, popularItems, [storeResults[0].cityId, storeId, parseInt(offset), parseInt(max)], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let popularItemData = response.result


                if (popularItemData.length > 0) {
                    //console.log("e...",new Date())
                    //console.log("456.......",selectedProduct) 

                    itemObject.itemObject(popularItemData, storeResults, selectedProduct, function (response) {
                        callback(response);
                    });

                }
                else {
                    const response = {
                        success: "1",
                        errorMessage: "",
                        successMessage: "No Data Found.",
                        response: {}
                    };
                    callback(response);
                }

            });
        }
        else {
            const response = {
                success: "1",
                errorMessage: "",
                successMessage: "No Data Found.",
                response: {}
            };
            callback(response);
        }
    });
}
module.exports = methods;