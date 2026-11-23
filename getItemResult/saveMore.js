let mysql = require('mysql');
let methods = {};
const queryExecution = require('../queryExecution');
methods.saveMore = function (client, jsonObj, event, callback) {

    let sisId = jsonObj.sisId;
    let itemPrice = jsonObj.itemPrice;
    let unit = jsonObj.unit;
    let itemId = jsonObj.itemId;
    let cityId = jsonObj.cityId;
    let storeId = jsonObj.storeId;
    let itemDataArr = []
    let swapItemDataArr = []
    let selectedProduct = jsonObj.selectedProduct

    let resultsQuery = "SELECT 1 - CAST(config_value AS UNSIGNED)/100 as swapPercentage FROM configuration WHERE config_key = 'swapPercentage';" +
        "SELECT config_value as cdnImagePath FROM configuration WHERE config_key = 'cdnImagePath';" +
        "SELECT config_value as bucketSubFolder FROM configuration WHERE config_key = 'bucketSubFolder';" +
        "SELECT config_value as imageFolder  FROM configuration WHERE config_key = 'itemImagesFolder ';" +
        "SELECT name as itemName FROM  item where id= ?;";
    //console.log(resultsQuery)

    //connection.query(resultsQuery, function (error, results, fields) {
    queryExecution.queryExecution(client, jsonObj, event, resultsQuery, [itemId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        if (results.length > 0) {
            let cdnImagePath = results[1][0].cdnImagePath;
            let bucketSubFolder = results[2][0].bucketSubFolder;
            let imageFolder = results[3][0].imageFolder;
            let itemName = results[4][0].itemName;
            let imagePath = cdnImagePath + "/" + bucketSubFolder + "/" + imageFolder
            let itemQuery = " SELECT sis.store_id as storeId,sis.id as sisId,sis.item_id as itemId,sis.item_name as itemName,sis.mrp,(sis.item_price-IFNULL(sis.discount_amount,0))as price,sis.net_amount as netAmount, sis.is_offer as isOffer,s.display_item_price as displayPrice,sis.offer_text as offerText, " +
                " sis.stock_quantity as quantity,brand.name as brandName,IFNULL(p.id,0) as packId,p.name as packName,s.name as storeName,siss.slug as slug, " +
                " concat(?,'/',it.logo_path_thumb) as imageName " +
                " FROM store_item_stock sis " +
                " INNER JOIN item it ON it.id = sis.item_id " +
                " INNER JOIN store s ON s.id = sis.store_id " +
                " INNER JOIN seller_item si ON si.id = sis.seller_item_id " +
                " INNER JOIN store_item_stock_seo as siss on siss.store_item_stock_id = sis.id and sis.city_id = siss.city_id " +
                " LEFT OUTER JOIN pack p ON p.id = it.pack_id " +
                " AND p.is_active = true " +
                " AND p.is_approved = true " +
                " LEFT OUTER JOIN brand  on it.brand_id=brand.id " +
                " AND brand.is_active = true " +
                " AND brand.is_approved = true " +
                " WHERE sis.id =? " +
                " AND si.is_active = true " +
                " AND si.is_approved = true " +
                " AND sis.is_active = true " +
                " AND it.is_active = true " +
                " AND it.is_approved = true "
            //console.log("itemQuery.."+itemQuery)
            //connection.query(itemQuery, function (error, itemData, fields) {
            queryExecution.queryExecution(client, jsonObj, event, itemQuery, [imagePath, sisId], function (response) {
                if (response.success == '0') {
                    callback(response)
                }
                let itemData = response.result

                if (itemData.length > 0) {
                    // let itemDataArr = []

                    itemDataArr[0] = itemData[0]
                    //console.log("itemData[0].."+itemData[0])
                    let cartItemsArr = []
                    if (selectedProduct && selectedProduct.length > 0) {
                        console.log("selectedProduct.length.." + selectedProduct.length)
                        for (let cartItem = 0; cartItem < selectedProduct.length; cartItem++) {
                            if (selectedProduct[cartItem].store_item_stock_ids == itemData[0].sisId) {

                                cartItemsArr[0] = selectedProduct[cartItem]
                                itemDataArr[0].cartItems = cartItemsArr
                            }
                            else {

                                itemDataArr[0].cartItems = cartItemsArr
                            }

                        }
                    }
                    else {
                        itemDataArr[0].cartItems = cartItemsArr
                    }
                    //console.log("itemDataArr..",itemDataArr)
                    let swapPercentage = results[0][0].swapPercentage;
                    let swapItemQuery = `
                        SELECT 
                            sis.store_id AS storeId,
                            sis.id AS sisId,
                            sis.item_id AS itemId,
                            sis.item_name AS itemName,
                            sis.mrp,
                            sis.net_amount AS netAmount,
                            sis.is_offer AS isOffer,
                            s.display_item_price AS displayPrice,
                            sis.offer_text AS offerText,
                            sis.stock_quantity AS quantity,
                            IFNULL(brand.name, ' ') AS brandName,
                            IFNULL(p.id, 0) AS packId,
                            IFNULL(p.name, '') AS packName,
                            s.name AS storeName,
                            siss.slug AS slug,
                            CONCAT(?, '/', it.logo_path_thumb) AS imageName,
                            sis.id AS sisId
                        FROM 
                            store_item_stock sis
                        INNER JOIN 
                            item it ON it.id = sis.item_id
                        INNER JOIN 
                            store s ON s.id = sis.store_id
                        INNER JOIN 
                            seller_item si ON si.id = sis.seller_item_id
                        INNER JOIN 
                            store_item_stock_seo AS siss ON siss.store_item_stock_id = sis.id AND sis.city_id = siss.city_id
                        LEFT OUTER JOIN 
                            pack p ON p.id = it.pack_id
                        LEFT OUTER JOIN 
                            brand ON it.brand_id = brand.id
                        WHERE 
                            sis.is_active = TRUE 
                            AND it.is_active = TRUE 
                            AND it.is_approved = TRUE 
                            AND it.name = ?
                            AND sis.store_id = ?
                            AND sis.city_id = ?
                            AND si.is_active = TRUE 
                            AND si.is_approved = TRUE 
                            AND (
                                (sis.unit > ? AND sis.net_amount / sis.unit <= (? / ?) * ?)
                                OR (sis.unit = ? AND sis.net_amount / sis.unit <= (? / ?))
                            )
                            AND sis.id != ? 
                            AND sis.stock_quantity > 0 
                        ORDER BY 
                            sis.ranking ASC;
                    `;

                    let swapItemParams = [
                        imagePath,
                        itemName,
                        storeId,
                        cityId,
                        unit,
                        itemPrice,
                        unit,
                        swapPercentage,
                        unit,
                        itemPrice,
                        unit,
                        sisId
                    ];

                    //console.log("swapItemQuery..."+swapItemQuery)
                    queryExecution.queryExecution(client, jsonObj, event, swapItemQuery, swapItemParams, function (swapItemData) {
                        if (swapItemData.length > 0) {
                            // let swapItemDataArr = []

                            for (let k = 0; k < swapItemData.length; k++) {
                                let cartItems = []
                                swapItemDataArr[k] = swapItemData[k]
                                if (selectedProduct) {
                                    for (let cartItem = 0; cartItem < selectedProduct.length; cartItem++) {
                                        if (selectedProduct[cartItem].store_item_stock_ids == swapItemData[k].sisId) {
                                            cartItems[0] = selectedProduct[cartItem]
                                            swapItemDataArr[k].cartItems = cartItems
                                        }
                                        else {
                                            swapItemDataArr[k].cartItems = cartItems
                                        }

                                    }
                                }
                                else {
                                    swapItemDataArr[k].cartItems = cartItems
                                }
                            }
                            //.log("itemDataArr2....",itemDataArr)


                            callback(itemDataArr, swapItemDataArr);
                        }

                        else {
                            const response = {
                                success: "1",
                                errorMessage: "",
                                successMessage: "No Data Found.",
                                response: {}
                            };
                            callback(itemDataArr, swapItemDataArr);
                        }

                    })
                }

                else {
                    const response = {
                        success: "1",
                        errorMessage: "",
                        successMessage: "No Data Found.",
                        response: {}
                    };
                    callback(itemDataArr, swapItemDataArr);
                }

            })
        }

        else {
            const response = {
                success: "1",
                errorMessage: "",
                successMessage: "No Data Found.",
                response: {}
            };
            callback(itemDataArr, swapItemDataArr);
        }


    });
}
module.exports = methods;