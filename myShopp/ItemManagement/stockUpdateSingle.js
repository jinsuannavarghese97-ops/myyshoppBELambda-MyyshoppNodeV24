var mysql = require('mysql');
var methods = {};

methods.stockUpdateSingle = function (jsonObj, callback) {
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
        var subQuery1 = "";
        let subQuery1Params = [];
        var subQuery2 = "";
        var queryString = "";
        var stockUpdateSingleCmbStatus = jsonObj.stockUpdateSingleCmbStatus;
        var stockUpdateSingleCmbStatusOffer = jsonObj.stockUpdateSingleCmbStatusOffer;
        var stockUpdateSingleCmbSelect = jsonObj.stockUpdateSingleCmbSelect;
        var stockUpdateSingleTextInput = jsonObj.stockUpdateSingleTextInput;
        var stockUpdateSingleCmbSelectSort = jsonObj.stockUpdateSingleCmbSelectSort;
        var stockUpdateSingleFromDate = jsonObj.stockUpdateSingleFromDate;
        var stockUpdateSingleToDate = jsonObj.stockUpdateSingleToDate;
        var storeId = jsonObj.storeId;
        var sellerId = jsonObj.sellerId;
        var stockUpdateSingleOffset = jsonObj.stockUpdateSingleOffset;
        var stockUpdateSingleMax = jsonObj.stockUpdateSingleMax;
        var singleStockUpdateDetails = [];
        var result = [];

        switch (stockUpdateSingleCmbStatus) {
            case "active":
                subQuery1 = subQuery1 + " and sis.is_active = true "
                break;
            case "inActive":
                subQuery1 = subQuery1 + " and sis.is_active = false "
                break;
        }

        switch (stockUpdateSingleCmbStatusOffer) {
            case "active":
                subQuery1 = subQuery1 + " AND sis.offer_text IS NOT NULL  and ((sis.is_offer = TRUE AND DATE(sis.offer_to) >= CURDATE()) OR (sis.is_offer = TRUE AND sis.offer_to IS NULL)) "
                break;
            case "expired":
                subQuery1 = subQuery1 + " AND sis.offer_text IS NOT NULL AND (DATE(sis.offer_to) < CURDATE()) "
                break;
            case "inactive":
                subQuery1 = subQuery1 + " AND sis.offer_text IS NOT NULL AND (sis.is_offer = FALSE) "
                break;
        }

        if (stockUpdateSingleCmbSelect != "" && stockUpdateSingleCmbSelect != null && stockUpdateSingleCmbSelect != "0") {
            switch (stockUpdateSingleCmbSelect) {
                case "itemName":
                    subQuery1 = subQuery1 + (' and si.display_name like ?');
                    subQuery1Params.push("%" + stockUpdateSingleTextInput + "%");
                    break;
                case "brand":
                    subQuery1 = subQuery1 + (' and b.name like ?');
                    subQuery1Params.push("%" + stockUpdateSingleTextInput + "%");
                    break;
                case "pack":
                    subQuery1 = subQuery1 + (' and p.name like ?');
                    subQuery1Params.push("%" + stockUpdateSingleTextInput + "%");
                    break;
                case "itemCode":
                    subQuery1 = subQuery1 + " and si.item_code like ?"
                    subQuery1Params.push(stockUpdateSingleTextInput + "%");
                    break;
                case "offerText":
                    subQuery1 = subQuery1 + (' and sis.offer_text like ?');
                    subQuery1Params.push("%" + stockUpdateSingleTextInput + "%");
                    break;
                case "stockQuantityLess":
                    subQuery1 = subQuery1 + " and sis.stock_quantity < ? and sis.stock_quantity != 0";
                    subQuery1Params.push(stockUpdateSingleTextInput);
                    break;
                case "stockQuantityGreater":
                    subQuery1 = subQuery1 + " and sis.stock_quantity > ? and sis.stock_quantity != 0";
                    subQuery1Params.push(stockUpdateSingleTextInput);
                    break;
                case "outOfStock":
                    subQuery1 = subQuery1 + " and sis.stock_quantity = 0"
                    break;
            }
        }
        if (stockUpdateSingleCmbSelectSort != "" && stockUpdateSingleCmbSelectSort != null && stockUpdateSingleCmbSelectSort != "0") {
            switch (stockUpdateSingleCmbSelectSort) {
                case "buyCount":
                    subQuery1 = subQuery1 + " AND IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE)  = 1 "
                    subQuery2 = " sis.item_buy_count desc,"
                    break;
                case "mrp":
                    subQuery1 = subQuery1 + " AND IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE)  = 1 "
                    subQuery2 = " sis.mrp desc,"
                    break;
                case "itemPrice":
                    subQuery1 = subQuery1 + " AND IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE)  = 1 "
                    subQuery2 = " sis.item_price desc,"
                    break;
                case "quantity":
                    subQuery1 = subQuery1 + " AND IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE)  = 1 "
                    subQuery2 = " sis.stock_quantity desc,"
                    break;
                case "rank":
                    subQuery1 = subQuery1 + " AND IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE)  = 1 "
                    subQuery2 = " sis.ranking asc,"
                    break;
            }
        }
        if ((stockUpdateSingleFromDate != "" && stockUpdateSingleFromDate != null) && (stockUpdateSingleToDate == "" || stockUpdateSingleToDate == null)) {
            //fromdt = dateFormatFunction(Date.parse('dd/MM/yyyy',params.txtFromDate))
            subQuery1 = subQuery1 + " and DATE(sis.offer_from) >= DATE(?)";
            subQuery1Params.push(stockUpdateSingleFromDate);
        }
        if ((stockUpdateSingleFromDate == "" || stockUpdateSingleFromDate == null) && (stockUpdateSingleToDate != "" && stockUpdateSingleToDate != null)) {
            //todt = dateFormatFunction(Date.parse('dd/MM/yyyy',params.txtToDate))
            subQuery1 = subQuery1 + " and DATE(sis.offer_to) <= DATE(?)";
            subQuery1Params.push(stockUpdateSingleToDate);
        }
        if ((stockUpdateSingleFromDate != "" && stockUpdateSingleFromDate != null) && (stockUpdateSingleToDate != "" && stockUpdateSingleToDate != null)) {
            //fromdt = dateFormatFunction(Date.parse('dd/MM/yyyy',params.txtFromDate))
            //todt = dateFormatFunction(Date.parse('dd/MM/yyyy',params.txtToDate))
            subQuery1 = subQuery1 + " and DATE(sis.offer_from) >= DATE(?) and DATE(sis.offer_to) <= DATE(?)";
            subQuery1Params.push(stockUpdateSingleFromDate, stockUpdateSingleToDate);
        }
        var getCityQry = " select city_id as cityId from store where id = ? ";

        connection.query(getCityQry, [storeId], function (error, getCityQryResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting city details"
                };
                return callback(response);
            }
            else {
                queryString = " SELECT IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE) AS is_stock_exists ,si.id as sellerItemId , " +
                    " si.item_code AS seller_item_code, si.item_name AS seller_item_name,si.display_name as displayName, b.name " +
                    " AS brand_name, p.name AS pack_name, cl1.name AS category_level1_name , " +
                    " cl2.name AS category_level2_name, cl3.name AS category_level3_name , " +
                    " i.name AS storedig_item_name , sis.id, sis.is_offer,sis.offer_text, " +
                    " DATE_FORMAT(sis.offer_from,'%d/%m/%Y') AS offer_from , " +
                    " DATE_FORMAT(sis.offer_to,'%d/%m/%Y') AS offer_to,sis.offer_price, sis.mrp , " +
                    " sis.item_price, sis.net_amount, sis.stock_quantity , sis.is_active,sis.ranking as rank,sis.item_buy_count as itembuycount " +
                    " FROM seller_item si " +
                    " INNER JOIN item i ON i.id = si.item_id " +
                    " INNER JOIN pack p ON i.pack_id = p.id " +
                    " LEFT OUTER JOIN brand b ON i.brand_id = b.id " +
                    " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id " +
                    " INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id " +
                    " LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id " +
                    " LEFT OUTER JOIN store_item_stock sis " +
                    " ON sis.city_id= ? " +
                    " AND sis.item_code = si.item_code " +
                    " WHERE si.seller_id = ? " +
                    " AND sis.store_id= ? " + subQuery1 +
                    " AND si.item_id IS NOT NULL " +
                    " AND si.is_active = TRUE " +
                    " AND si.is_approved = TRUE " +
                    " AND i.is_active = TRUE " +
                    " AND i.is_approved = TRUE " +
                    " ORDER BY " + subQuery2 + "is_stock_exists DESC, seller_item_code ;" +

                    " SELECT IF(IFNULL(sis.id, -1) = -1, FALSE, TRUE) AS is_stock_exists ,si.id as sellerItemId , " +
                    " si.item_code AS seller_item_code, si.item_name AS seller_item_name,si.display_name as displayName, b.name " +
                    " AS brand_name, p.name AS pack_name, cl1.name AS category_level1_name , " +
                    " cl2.name AS category_level2_name, cl3.name AS category_level3_name , " +
                    " i.name AS storedig_item_name , sis.id, sis.is_offer,sis.offer_text, " +
                    " DATE_FORMAT(sis.offer_from,'%d/%m/%Y') AS offer_from , " +
                    " DATE_FORMAT(sis.offer_to,'%d/%m/%Y') AS offer_to,sis.offer_price, sis.mrp , " +
                    " sis.item_price, sis.net_amount, sis.stock_quantity , sis.is_active,sis.ranking as rank,sis.item_buy_count as itembuycount " +
                    " FROM seller_item si " +
                    " INNER JOIN item i ON i.id = si.item_id " +
                    " INNER JOIN pack p ON i.pack_id = p.id " +
                    " LEFT OUTER JOIN brand b ON i.brand_id = b.id " +
                    " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id " +
                    " INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id " +
                    " LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id " +
                    " LEFT OUTER JOIN store_item_stock sis " +
                    " ON sis.city_id= ? " +
                    " AND sis.item_code = si.item_code " +
                    " WHERE si.seller_id = ? " +
                    " AND sis.store_id= ? " + subQuery1 +
                    " AND si.item_id IS NOT NULL " +
                    " AND si.is_active = TRUE " +
                    " AND si.is_approved = TRUE " +
                    " AND i.is_active = TRUE " +
                    " AND i.is_approved = TRUE " +
                    " ORDER BY " + subQuery2 + "is_stock_exists DESC, seller_item_code " +
                    " limit ?,? ; ";
                const queryParams = [
                    getCityQryResult[0].cityId, sellerId, storeId, ...subQuery1Params,
                    getCityQryResult[0].cityId, sellerId, storeId, ...subQuery1Params,
                    parseInt(stockUpdateSingleOffset), parseInt(stockUpdateSingleMax)
                ];

                connection.query(queryString, queryParams, function (error, queryStringResult, fields) {
                    if (error) {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: "Something went wrong in getting single stock update details"
                        };
                        return callback(response);
                    }
                    else if (queryStringResult.length > 0) {
                        for (var i = 0; i < queryStringResult[1].length; i++) {
                            singleStockUpdateDetails[i] = {
                                isStockExists: queryStringResult[1][i].is_stock_exists == null ? '' : queryStringResult[1][i].is_stock_exists,
                                sellerItemId: queryStringResult[1][i].sellerItemId == null ? '' : queryStringResult[1][i].sellerItemId,
                                sellerItemCode: queryStringResult[1][i].seller_item_code == null ? '' : queryStringResult[1][i].seller_item_code,
                                sellerItemName: queryStringResult[1][i].seller_item_name == null ? '' : queryStringResult[1][i].seller_item_name,
                                displayName: queryStringResult[1][i].displayName == null ? '' : queryStringResult[1][i].displayName,
                                brandName: queryStringResult[1][i].brand_name == null ? '' : queryStringResult[1][i].brand_name,
                                packName: queryStringResult[1][i].pack_name == null ? '' : queryStringResult[1][i].pack_name,
                                categoryLevel1Name: queryStringResult[1][i].category_level1_name == null ? '' : queryStringResult[1][i].category_level1_name,
                                categoryLevel2Name: queryStringResult[1][i].category_level2_name == null ? '' : queryStringResult[1][i].category_level2_name,
                                categoryLevel3Name: queryStringResult[1][i].category_level3_name == null ? '' : queryStringResult[1][i].category_level3_name,
                                itemName: queryStringResult[1][i].storedig_item_name == null ? '' : queryStringResult[1][i].storedig_item_name,
                                storeItemStockId: queryStringResult[1][i].id == null ? '' : queryStringResult[1][i].id,
                                isOffer: queryStringResult[1][i].is_offer == null ? '' : queryStringResult[1][i].is_offer,
                                offerText: queryStringResult[1][i].offer_text == null ? '' : queryStringResult[1][i].offer_text,
                                offerFrom: queryStringResult[1][i].offer_from == null ? '' : queryStringResult[1][i].offer_from,
                                offerTo: queryStringResult[1][i].offer_to == null ? '' : queryStringResult[1][i].offer_to,
                                offerPrice: queryStringResult[1][i].offer_price == null ? '' : queryStringResult[1][i].offer_price,
                                mrp: queryStringResult[1][i].mrp == null ? '' : queryStringResult[1][i].mrp,
                                itemPrice: queryStringResult[1][i].item_price == null ? '' : queryStringResult[1][i].item_price,
                                netAmount: queryStringResult[1][i].net_amount == null ? '' : queryStringResult[1][i].net_amount,
                                stockQuantity: queryStringResult[1][i].stock_quantity == null ? '' : queryStringResult[1][i].stock_quantity,
                                isActive: queryStringResult[1][i].is_active == null ? '' : queryStringResult[1][i].is_active,
                                rank: queryStringResult[1][i].rank == null ? '' : queryStringResult[1][i].rank,
                                itemBuyCount: queryStringResult[1][i].itembuycount == null ? '' : queryStringResult[1][i].itembuycount
                            }
                        }
                        var totalCount = queryStringResult[0].length
                        result = {
                            singleStockUpdateDetails: singleStockUpdateDetails,
                            totalCount: totalCount
                        }
                        console.log(result)
                        const response = {
                            success: "1",
                            result: result,
                            errorMessage: "",
                            successMessage: "success"
                        }
                        return callback(response);
                    }
                    else {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: "No Data Found"
                        };
                        return callback(response);
                    }
                })

            }
        });



    });
}
module.exports = methods;