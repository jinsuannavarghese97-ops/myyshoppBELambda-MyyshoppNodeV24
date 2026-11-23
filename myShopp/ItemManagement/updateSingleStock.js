var mysql = require('mysql');
let moment = require('moment-timezone');
var methods = {};

methods.updateSingleStock = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    });
    pool.getConnection(function (err, connection) {
        var storeItemStockId = jsonObj.storeItemStockId
        var sellerId = jsonObj.sellerId
        var now = new Date()
        var modifiedDate = moment(now).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")//dateFormat(now, "yyyy-mm-dd hh:MM:ss");
        var createdDate = moment(now).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")//dateFormat(now, "yyyy-mm-dd hh:MM:ss");
        var storeId = jsonObj.storeId
        var sellerItemId = jsonObj.sellerItemId
        var itemName = jsonObj.itemName
        var itemCode = jsonObj.itemCode
        var updateSingleStockOfferText = jsonObj.updateSingleStockOfferText
        var updateSingleStockIsOfferFlag = jsonObj.updateSingleStockIsOfferFlag
        var updateSingleStockOfferPrice = jsonObj.updateSingleStockOfferPrice
        var updateSingleStockOfferFrom = moment(jsonObj.updateSingleStockOfferFrom, "DD/MM/YYYY").tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')//dateFormat(updateSingleStockOfferFrom, "yyyy-mm-dd hh:MM:ss")
        var updateSingleStockOfferTo = moment(jsonObj.updateSingleStockOfferTo, "DD/MM/YYYY").tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")//dateFormat(updateSingleStockOfferTo, "yyyy-mm-dd hh:MM:ss")
        var updateSingleStockStockQuantity = jsonObj.updateSingleStockStockQuantity
        var updateSingleStockStockUpdatedOn = moment(now).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")//dateFormat(now, "yyyy-mm-dd hh:MM:ss");
        var updateSingleStockItemPrice = jsonObj.updateSingleStockItemPrice
        var updateSingleStockMrp = jsonObj.updateSingleStockMrp
        var updateSingleStockRank = jsonObj.updateSingleStockRank
        var queryString = "";
        var updateSubQuery = "";
        let updateSubQueryParams = [];
        var insertSubQuery = "";
        let insertSubQueryParams = [];
        var storeItemStockTableId
        var netAmount

        if (updateSingleStockOfferText != null && updateSingleStockOfferText != '') {
            if (updateSingleStockIsOfferFlag == 'checked') {
                updateSubQuery = updateSubQuery + " is_offer = ?, "
                updateSubQueryParams.push(false);
                insertSubQuery = insertSubQuery + "?,";
                insertSubQueryParams.push(false)
            }
            else {
                updateSubQuery = updateSubQuery + " is_offer = ?, ";
                updateSubQueryParams.push(true);
                insertSubQuery = insertSubQuery + "?,";
                insertSubQueryParams.push(true)
            }
            updateSubQuery = updateSubQuery + " offer_text = ?, "
            updateSubQueryParams.push(updateSingleStockOfferText);
            insertSubQuery = insertSubQuery + "?,";
            insertSubQueryParams.push(updateSingleStockOfferText);
            if (updateSingleStockOfferPrice != null && updateSingleStockOfferPrice != '') {
                updateSubQuery = updateSubQuery + " offer_price = ?, ";
                updateSubQueryParams.push(updateSingleStockOfferPrice);
                insertSubQuery = insertSubQuery + "?,";
                insertSubQueryParams.push(updateSingleStockOfferPrice);
            }
            else {
                updateSubQuery = updateSubQuery + " offer_price = ?, "
                updateSubQueryParams.push(null);
                insertSubQuery = insertSubQuery + "?,";
                insertSubQueryParams.push(null);
            }
            if (updateSingleStockOfferFrom != null && updateSingleStockOfferFrom != '') {
                updateSubQuery = updateSubQuery + " offer_from = ?,offer_to = ?,";
                updateSubQueryParams.push(updateSingleStockOfferFrom, updateSingleStockOfferTo);
                insertSubQuery = insertSubQuery + "?,?,";
                insertSubQueryParams.push(updateSingleStockOfferFrom, updateSingleStockOfferTo);
            }
            else {
                updateSingleStockOfferFrom = moment(now).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")//dateFormat(now, "yyyy-mm-dd hh:MM:ss");               
                var date = now.getDate();
                var month = now.getMonth(); // Since getUTCMonth() returns month from 0-11 not 1-12
                var year = now.getFullYear() + 1; // next year
                var dateObj = new Date(year, month, date)
                var formattedDate = moment(dateObj).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")//dateFormat(dateObj, "yyyy-mm-dd hh:MM:ss");
                updateSingleStockOfferTo = formattedDate
                updateSubQuery = updateSubQuery + " offer_from = ?, offer_to = ?,";
                updateSubQueryParams.push(updateSingleStockOfferFrom, updateSingleStockOfferTo);
                insertSubQuery = insertSubQuery + "?,?,";
                insertSubQueryParams.push(updateSingleStockOfferFrom, updateSingleStockOfferTo);
            }
        }
        else {
            updateSubQuery = updateSubQuery + "is_offer = ?, offer_text = ?, offer_price = ?, offer_from = ?, offer_to = ?,";
            updateSubQueryParams.push(false, null, null, null, null);
            insertSubQuery = insertSubQuery + "?,?,?,?,?,";
            insertSubQueryParams.push(false, null, null, null, null);
        }
        if (updateSingleStockStockQuantity == null || updateSingleStockStockQuantity == '') {
            updateSingleStockStockQuantity = 100
        }
        var getCityAndItem = " select s.city_id as cityId,s.display_item_price as displayItemPrice,s.name as storeName,s.locality,c.name as cityName,st.name as stateName,s.address1,s.address2 from store as s " +
            " inner join city as c on c.id = s.city_id " +
            " inner join state as st on st.id = c.state_id " +
            " where s.id = ?; " +
            " select item_id as itemId,display_name as displayName from seller_item where id = ?; " +
            " select config_value from configuration where config_key = 'swapPercentage' ; "

        connection.query(getCityAndItem, [storeId, sellerItemId], function (error, getCityAndItemResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting city/item/config details"
                };
                return callback(response);
            }
            else {
                var getUnitDetails = " select p.unit as unit, p.unit_type as unitType,p.name as packName from pack as p " +
                    " inner join item as i on i.pack_id = p.id where i.id = ?";

                connection.query(getUnitDetails, [getCityAndItemResult[1][0].itemId], function (error, getUnitDetailsResult, fields) {
                    if (error) {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: "Something went wrong in getting unit details"
                        };
                        return callback(response);
                    }
                    else {
                        if (getCityAndItemResult[0][0].displayItemPrice == false) {
                            netAmount = updateSingleStockMrp
                        }
                        else if (updateSingleStockOfferText != null && updateSingleStockOfferText != '') {
                            if (updateSingleStockIsOfferFlag == 'checked') {
                                netAmount = updateSingleStockItemPrice
                            }
                            else {
                                if (updateSingleStockOfferPrice != null && updateSingleStockOfferPrice != '') {
                                    if (updateSingleStockOfferPrice > 0) {
                                        netAmount = updateSingleStockOfferPrice
                                    }
                                    else {
                                        netAmount = updateSingleStockItemPrice
                                    }
                                }
                                else {
                                    netAmount = updateSingleStockItemPrice
                                }
                            }
                        }
                        else {
                            netAmount = updateSingleStockItemPrice
                        }
                        if (updateSingleStockRank != null && updateSingleStockRank != '') {
                            updateSingleStockRank = updateSingleStockRank
                        }
                        else {
                            updateSingleStockRank = 999
                        }
                        let queryStringParams = [];
                        if (storeItemStockId != '' && storeItemStockId != null) {
                            queryString = `
                                UPDATE store_item_stock 
                                SET 
                                    modified_by = ?, 
                                    modified_on = ?, 
                                    city_id = ?, 
                                    is_active = true, 
                                    item_id = ?, 
                                    store_id = ?, 
                                    seller_item_id = ?, 
                                    unit = ?, 
                                    unit_type = ?, 
                                    item_name = ?, 
                                    item_code = ?, 
                                    ${updateSubQuery}
                                    stock_quantity = ?, 
                                    stock_updated_on = ?, 
                                    item_price = ?, 
                                    mrp = ?, 
                                    net_amount = ?, 
                                    ranking = ? 
                                WHERE id = ?
                            `;

                            queryStringParams = [
                                sellerId,
                                modifiedDate,
                                getCityAndItemResult[0][0].cityId,
                                getCityAndItemResult[1][0].itemId,
                                storeId,
                                sellerItemId,
                                getUnitDetailsResult[0].unit,
                                getUnitDetailsResult[0].unitType,
                                itemName,
                                itemCode,
                                ...updateSubQueryParams,
                                updateSingleStockStockQuantity,
                                updateSingleStockStockUpdatedOn,
                                updateSingleStockItemPrice,
                                updateSingleStockMrp,
                                netAmount,
                                updateSingleStockRank,
                                storeItemStockId
                            ];

                        }
                        else {
                            queryString = `
                            INSERT INTO store_item_stock 
                                (version, created_by, created_on, city_id, is_active, item_id, store_id, seller_item_id, unit, unit_type, item_name, item_code, is_offer, offer_text, offer_price, offer_from, offer_to, stock_quantity, stock_updated_on, item_price, mrp, net_amount, ranking, is_swap_item, item_buy_count, item_view_count, modified_by) 
                            VALUES 
                                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `;

                            queryStringParams = [
                                0,
                                sellerId,
                                createdDate,
                                getCityAndItemResult[0][0].cityId,
                                true,
                                getCityAndItemResult[1][0].itemId,
                                storeId,
                                sellerItemId,
                                getUnitDetailsResult[0].unit,
                                getUnitDetailsResult[0].unitType,
                                itemName,
                                itemCode,
                                ...insertSubQueryParams,
                                updateSingleStockStockQuantity,
                                updateSingleStockStockUpdatedOn,
                                updateSingleStockItemPrice,
                                updateSingleStockMrp,
                                netAmount,
                                updateSingleStockRank,
                                false,
                                0,
                                0,
                                0,
                                sellerId
                            ];

                        }
                        connection.query(queryString, queryStringParams, function (error, queryStringResult, fields) {
                            if (error) {
                                const response = {
                                    success: "0",
                                    successMessage: "",
                                    errorMessage: "Something went wrong in saving store_item_stock details"
                                };
                                return callback(response);
                            }
                            else {
                                //Swap Item Starts
                                console.log(queryStringResult.insertId)
                                if (storeItemStockId != '' && storeItemStockId != null) {
                                    storeItemStockTableId = storeItemStockId
                                }
                                else {
                                    storeItemStockTableId = queryStringResult.insertId
                                }
                                var swapItemMap = `
                                    SELECT fn_GetIsSwapItem(?, ?, ?, ?, ?, ?) AS swapItemMap;
                                    SELECT 
                                        i.name, 
                                        i.category_level1_id, 
                                        i.category_level2_id, 
                                        i.category_level3_id, 
                                        i.brand_id AS brand, 
                                        b.name AS brandName, 
                                        i.description AS itemDescription 
                                    FROM 
                                        item AS i 
                                    INNER JOIN 
                                        store_item_stock AS sis ON sis.item_id = i.id 
                                    LEFT JOIN 
                                        brand AS b ON b.id = i.brand_id 
                                    WHERE 
                                        sis.item_id = ?;
                                    `;

                                const swapItemMapParams = [
                                    0,
                                    storeItemStockTableId,
                                    getCityAndItemResult[0][0].cityId,
                                    storeId,
                                    getCityAndItemResult[1][0].itemId,
                                    netAmount,
                                    getCityAndItemResult[2][0].config_value,
                                    getCityAndItemResult[1][0].itemId
                                ];


                                connection.query(swapItemMap, swapItemMapParams, function (error, swapItemMapResult) {
                                    if (error) {
                                        console.log(error)
                                        const response = {
                                            success: "0",
                                            successMessage: "",
                                            errorMessage: "Something went wrong in swap items"
                                        };
                                        return callback(response);
                                    }
                                    else {
                                        var insertSwapItem = " update store_item_stock set is_swap_item = ? where id = ?";
                                        connection.query(insertSwapItem, [swapItemMapResult[0][0].swapItemMap, storeItemStockTableId], function (error, insertSwapItemResult) {
                                            if (error) {
                                                const response = {
                                                    success: "0",
                                                    successMessage: "",
                                                    errorMessage: "Something went wrong in updating swap items"
                                                };
                                                return callback(response);
                                            }
                                            else {
                                                var subQuery = "";
                                                let subQueryParams = [];
                                                if (swapItemMapResult[1][0].category_level3_id != null) {
                                                    subQuery = " AND i.category_level3_id = ?";
                                                    subQueryParams = [swapItemMapResult[1][0].category_level3_id];
                                                }
                                                else {
                                                    subQuery = " AND i.category_level3_id = NULL"
                                                }
                                                var swapQuery = " Select sis.id as storeItemStockId,sis.net_amount AS netAmount,sis.item_id as itemId " +
                                                    " FROM item as i " +
                                                    " INNER JOIN store_item_stock as sis ON sis.item_id = i.id " +
                                                    " WHERE i.name = ?" +
                                                    " AND i.category_level1_id = ? " +
                                                    " AND i.category_level2_id =  ? " + subQuery;

                                                const swapQueryParams = [swapItemMapResult[1][0].name, swapItemMapResult[1][0].category_level1_id, swapItemMapResult[1][0].category_level2_id, ...subQueryParams];

                                                connection.query(swapQuery, swapQueryParams, function (error, swapQueryResult) {
                                                    if (error) {
                                                        const response = {
                                                            success: "0",
                                                            successMessage: "",
                                                            errorMessage: "Something went wrong in getting swap items"
                                                        };
                                                        return callback(response);
                                                    }
                                                    else {
                                                        for (var i = 0; i < swapQueryResult.length; i++) {
                                                            var swapItemMapExist = `
                                                                SELECT fn_GetIsSwapItem(?, ?, ?, ?, ?, ?) AS swapItemMap
                                                            `;

                                                            var swapItemMapExistParams = [
                                                                0,
                                                                swapQueryResult[i].storeItemStockId,
                                                                getCityAndItemResult[0][0].cityId,
                                                                storeId,
                                                                swapQueryResult[i].itemId,
                                                                swapQueryResult[i].netAmount,
                                                                getCityAndItemResult[2][0].config_value
                                                            ];

                                                            connection.query(swapItemMapExist, swapItemMapExistParams, function (error, swapItemMapExistResult) {
                                                                if (error) {
                                                                    const response = {
                                                                        success: "0",
                                                                        successMessage: "",
                                                                        errorMessage: "Something went wrong in updating swap items"
                                                                    };
                                                                    return callback(response);
                                                                }
                                                                else {
                                                                    var updateEachSwapItem = " update store_item_stock set is_swap_item = ? where id = ? ";
                                                                    connection.query(updateEachSwapItem, [swapItemMapExistResult[0].swapItemMap, storeItemStockTableId], function (error, updateEachSwapItemResult) {
                                                                        if (error) {
                                                                            const response = {
                                                                                success: "0",
                                                                                successMessage: "",
                                                                                errorMessage: "Something went wrong in updating swap items"
                                                                            };
                                                                            return callback(response);
                                                                        }
                                                                        else {
                                                                            //do
                                                                        }
                                                                    });
                                                                }
                                                            });

                                                        }//for loop ends
                                                        var getStoreCategories = `
                                                            SELECT 
                                                                category_level1_id, 
                                                                category_level2_id, 
                                                                category_level3_id, 
                                                                city_id, 
                                                                store_id 
                                                            FROM 
                                                                store_categories 
                                                            WHERE 
                                                                category_level1_id = ? 
                                                                AND category_level2_id = ? 
                                                                AND category_level3_id = ? 
                                                                AND city_id = ? 
                                                                AND store_id = ?
                                                        `;

                                                        var getStoreCategoriesParams = [
                                                            swapItemMapResult[1][0].category_level1_id,
                                                            swapItemMapResult[1][0].category_level2_id,
                                                            swapItemMapResult[1][0].category_level3_id,
                                                            getCityAndItemResult[0][0].cityId,
                                                            storeId
                                                        ];


                                                        connection.query(getStoreCategories, getStoreCategoriesParams, function (error, getStoreCategoriesResult) {
                                                            if (error) {
                                                                const response = {
                                                                    success: "0",
                                                                    successMessage: "",
                                                                    errorMessage: "Something went wrong in getting storeCategories"
                                                                };
                                                                return callback(response);
                                                            }
                                                            else {
                                                                var seoSubQuery1 = ""
                                                                if (swapItemMapResult[1][0].brand != null) {
                                                                    seoSubQuery1 = swapItemMapResult[1][0].brandName + "','"
                                                                }
                                                                else {
                                                                    seoSubQuery1 = null + "','"
                                                                }
                                                                var seoSlugTitleDescription = `
                                                                    SELECT 
                                                                        fn_GetSeoSlug(?, ?, ?, ?) AS slug;
                                                                    
                                                                    SELECT 
                                                                        fn_GetSeoTitle(?, ?, ?, ?, ?, ?, ?) AS title;
                                                                    
                                                                    SELECT 
                                                                        fn_GetSeoDescription(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS description;
                                                                `;

                                                                var seoSlugTitleDescriptionParams = [
                                                                    storeItemStockTableId,
                                                                    getCityAndItemResult[1][0].displayName,
                                                                    seoSubQuery1 + getCityAndItemResult[0][0].storeName,
                                                                    getUnitDetailsResult[0].packName,

                                                                    getCityAndItemResult[1][0].displayName,
                                                                    seoSubQuery1 + getUnitDetailsResult[0].packName,
                                                                    netAmount,
                                                                    getCityAndItemResult[0][0].storeName,
                                                                    getCityAndItemResult[0][0].locality,
                                                                    getCityAndItemResult[0][0].cityName,
                                                                    getCityAndItemResult[0][0].stateName,

                                                                    getCityAndItemResult[1][0].displayName,
                                                                    swapItemMapResult[1][0].brandName,
                                                                    getUnitDetailsResult[0].packName,
                                                                    getCityAndItemResult[0][0].storeName,
                                                                    swapItemMapResult[1][0].itemDescription,
                                                                    netAmount,
                                                                    getCityAndItemResult[0][0].locality,
                                                                    getCityAndItemResult[0][0].cityName,
                                                                    getCityAndItemResult[0][0].stateName,
                                                                    swapItemMapResult[1][0].category_level1_id,
                                                                    swapItemMapResult[1][0].category_level2_id,
                                                                    swapItemMapResult[1][0].category_level3_id,
                                                                    getCityAndItemResult[0][0].address1,
                                                                    getCityAndItemResult[0][0].address2
                                                                ];

                                                                connection.query(seoSlugTitleDescription, seoSlugTitleDescriptionParams, function (error, seoSlugTitleDescriptionResult) {
                                                                    if (error) {
                                                                        const response = {
                                                                            success: "0",
                                                                            successMessage: "",
                                                                            errorMessage: "Something went wrong in getting seo slug, title, description"
                                                                        };
                                                                        return callback(response);
                                                                    }
                                                                    else {
                                                                        var checkStoreItemStockSeoExist = " select * from store_item_stock_seo where store_item_stock_id = ? ";
                                                                        connection.query(checkStoreItemStockSeoExist, [storeItemStockTableId], function (error, checkStoreItemStockSeoExistResult) {
                                                                            if (error) {
                                                                                const response = {
                                                                                    success: "0",
                                                                                    successMessage: "",
                                                                                    errorMessage: "Something went wrong in checking store_item_stock_seo exist"
                                                                                };
                                                                                return callback(response);
                                                                            }
                                                                            else {
                                                                                var deleteStoreItemStockSeo = " delete from store_item_stock_seo where store_item_stock_id = ?";
                                                                                connection.query(deleteStoreItemStockSeo, [storeItemStockTableId], function (error, deleteStoreItemStockSeoResult) {
                                                                                    if (error) {
                                                                                        const response = {
                                                                                            success: "0",
                                                                                            successMessage: "",
                                                                                            errorMessage: "Something went wrong in deleting store_item_stock_seo "
                                                                                        };
                                                                                        return callback(response);
                                                                                    }
                                                                                    else {
                                                                                        var insertStoreItemStockSeo = `
                                                                                            INSERT INTO store_item_stock_seo 
                                                                                                (version, city_id, seo_description, seo_keywords, seo_title, slug, store_item_stock_id) 
                                                                                            VALUES 
                                                                                                (?, ?, ?, ?, ?, ?, ?)
                                                                                        `;

                                                                                        var insertStoreItemStockSeoParams = [
                                                                                            0,
                                                                                            getCityAndItemResult[0][0].cityId,
                                                                                            seoSlugTitleDescriptionResult[2][0].description,
                                                                                            '',
                                                                                            seoSlugTitleDescriptionResult[1][0].title,
                                                                                            seoSlugTitleDescriptionResult[0][0].slug,
                                                                                            storeItemStockTableId
                                                                                        ];

                                                                                        connection.query(insertStoreItemStockSeo, insertStoreItemStockSeoParams, function (error, insertStoreItemStockSeoResult) {
                                                                                            if (error) {
                                                                                                const response = {
                                                                                                    success: "0",
                                                                                                    successMessage: "",
                                                                                                    errorMessage: "Something went wrong in inserting store_item_stock_seo "
                                                                                                };
                                                                                                return callback(response);
                                                                                            }
                                                                                            else {
                                                                                                if (getStoreCategoriesResult.length < 1) {
                                                                                                    var insertStoreCategory = `
                                                                                                        INSERT INTO store_categories 
                                                                                                            (category_level1_id, category_level2_id, category_level3_id, city_id, store_id, is_active) 
                                                                                                        VALUES 
                                                                                                            (?, ?, ?, ?, ?, ?)
                                                                                                    `;

                                                                                                    var insertStoreCategoryParams = [
                                                                                                        swapItemMapResult[1][0].category_level1_id,
                                                                                                        swapItemMapResult[1][0].category_level2_id,
                                                                                                        swapItemMapResult[1][0].category_level3_id,
                                                                                                        getCityAndItemResult[0][0].cityId,
                                                                                                        storeId,
                                                                                                        true
                                                                                                    ];

                                                                                                    connection.query(insertStoreCategory, insertStoreCategoryParams, function (error, insertStoreCategoryResult) {
                                                                                                        if (error) {
                                                                                                            const response = {
                                                                                                                success: "0",
                                                                                                                successMessage: "",
                                                                                                                errorMessage: "Something went wrong in saving storeCategories"
                                                                                                            };
                                                                                                            return callback(response);
                                                                                                        }
                                                                                                        else {

                                                                                                        }
                                                                                                    })

                                                                                                }

                                                                                                const response = {
                                                                                                    success: "1",
                                                                                                    result: itemCode,
                                                                                                    errorMessage: "",
                                                                                                    successMessage: "success"
                                                                                                };
                                                                                                return callback(response);
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });

                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });

                            }
                        });
                    }

                })

            }
        });


    });
}
module.exports = methods; 