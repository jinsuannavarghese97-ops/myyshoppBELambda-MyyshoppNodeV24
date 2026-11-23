const queryExecution = require('../queryExecution');
const methods = {};

methods.saveRestuarantStock = function (client, jsonObj, event, callback) {
    let storeItemQuery = "";
    let storeItemQueryParams = [];
    let netAmount = ""
    let discountAmount = ""
    let offerPrice = ""
    let offerText = ""
    let sizeQuery = "";
    let sizeQueryParams = [];

    if (jsonObj.rtStoreItemId) {
        storeItemQuery = `
            UPDATE rt_store_item 
            SET 
                modified_by = ?, 
                modified_on = NOW(), 
                name = ? 
            WHERE id = ?;
        `;

        storeItemQueryParams = [
            jsonObj.userId,
            jsonObj.name,
            jsonObj.rtStoreItemId
        ];

        console.log("storeItemQuery.." + storeItemQuery)
        // storeItemArray = jsonObj.rtStoreItemId
    }

    for (const eachData of jsonObj.sizeList) {
        netAmount = ""
        discountAmount = ""
        offerPrice = ""
        offerText = ""
        if (eachData.offerPrice) {
            netAmount = eachData.offerPrice
            discountAmount = eachData.offerPrice
            offerPrice = eachData.offerPrice


        }
        else {
            netAmount = eachData.price
            discountAmount = "null"
            offerPrice = "null"

        }
        if (eachData.offerText) {
            offerText = eachData.offerText
            offerPrice = eachData.offerPrice

        }
        else {
            offerText = " "
            offerPrice = "null"

            discountAmount = 0
        }

        if (eachData.storeItemSizeId) {
            sizeQuery += `
                UPDATE rt_store_item_size 
                SET 
                    rt_item_size_id = ?, 
                    is_active = 1, 
                    price = ?, 
                    net_amount = ?, 
                    discount_amount = ?, 
                    offer_text = ?, 
                    offer_price = ? 
                WHERE id = ?;
            `;

            sizeQueryParams.push(
                eachData.size,
                eachData.price,
                netAmount,
                discountAmount,
                offerText,
                offerPrice,
                eachData.storeItemSizeId
            );

        }
    }
    let fullQuery = storeItemQuery + sizeQuery;
    console.log(fullQuery)
    queryExecution.queryExecution(client, jsonObj, event, fullQuery, [...storeItemQueryParams, ...sizeQueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        else {
            response.result = []
            response.successMessage = "Success."
            callback(response);
        }

    })
}
module.exports = methods;