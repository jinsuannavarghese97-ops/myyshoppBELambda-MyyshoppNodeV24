const queryExecution = require('../queryExecution');
const methods = {};
methods.saveStoreItemStock = function (client, jsonObj, event, callback) {
    let query = "";
    let queryParams = [];
    let subQryField = "",
        subQryFieldData = "";
    let subQryFieldParams = [];
    let subQryFieldDataParams = [];

    event.isOffer = event.offerText ? true : false
    if (event.timeZone) {
        let num = event.timeZone.slice(1);
        let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        event.timeZone = symbol + rhours + ':' + rminutes
        event.time = symbol + num
    }
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    event.itemName = event.itemName ? event.itemName.replace(/'/g, "\\'") : "";
    event.quantity = event.quantity ? event.quantity : 100
    event.ranking = event.ranking ? event.ranking : 999

    if (event.offerText) {
        if (event.dateFlag == 'false') {
            event.isOffer = false
            event.netAmount = event.itemPrice
        } else {
            event.isOffer = true
        }
        if (event.offerPrice && event.offerPrice > 0) {
            event.netAmount = event.offerPrice
        } else {
            event.netAmount = event.itemPrice
            event.offerPrice = event.itemPrice
        }
    }

    if (event.displayItemPrice == 'false') {
        if (!event.itemPrice) {
            event.itemPrice = event.mrp
        }
        event.netAmount = event.mrp
    }
    else {
        if (!event.itemPrice) {
            event.itemPrice = event.mrp
        }
        event.netAmount = event.itemPrice
    }

    if (event.storeItemStockId) {
        if (event.offerText) {
            subQryField = ",offer_text=?,offer_from=?,offer_price=?,offer_to=? ";
            subQryFieldParams = [event.offerText, event.offerFrom, parseFloat(event.offerPrice).toFixed(2), event.offerTo];
        }
        query = `
            UPDATE store_item_stock 
            SET 
                version = version + 1, 
                city_id = ?, 
                is_active = true, 
                is_offer = ?, 
                item_code = ?, 
                item_id = ?, 
                item_name = ?, 
                item_price = ?, 
                modified_by = ?, 
                modified_on = NOW(), 
                mrp = ?, 
                net_amount = ?, 
                ranking = ?, 
                seller_item_id = ?, 
                stock_quantity = ?, 
                stock_updated_on = NOW(), 
                store_id = ?, 
                unit = ?, 
                unit_type = ? 
            ${subQryField}
            WHERE id = ?;
            `;

        queryParams = [
            event.cityId,
            event.isOffer,
            event.itemCode,
            event.itemId,
            event.itemName,
            parseFloat(event.itemPrice).toFixed(2),
            event.userId,
            parseFloat(event.mrp).toFixed(2),
            parseFloat(event.netAmount).toFixed(2),
            event.ranking,
            event.sellerItemId,
            event.stockQuantity,
            event.storeId,
            event.unit,
            event.unitType,
            ...subQryFieldParams,
            event.storeItemStockId
        ];

    } else {
        if (event.offerText) {
            subQryField = ",offer_text,offer_from,offer_price,offer_to ";
            subQryFieldData = ",?,?,?,?) ";
            subQryFieldDataParams = [event.offerText, event.offerFrom, parseFloat(event.offerPrice).toFixed(2), event.offerTo];
        }
        query = `
            INSERT INTO store_item_stock 
            (version, city_id, created_by, created_on, is_active, is_offer, item_code, item_id, 
            item_name, item_price, mrp, net_amount, ranking, seller_item_id, stock_quantity, stock_updated_on, 
            store_id, unit, unit_type) 
            ${subQryField}
            VALUES 
            (0, ?, ?, NOW(), true, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?) 
            ${subQryFieldData};
        `;

        queryParams = [
            event.cityId,
            event.userId,
            event.isOffer,
            event.itemCode,
            event.itemId,
            event.itemName,
            parseFloat(event.itemPrice).toFixed(2),
            parseFloat(event.mrp).toFixed(2),
            parseFloat(event.netAmount).toFixed(2),
            event.ranking,
            event.sellerItemId,
            event.stockQuantity,
            event.storeId,
            event.unit,
            event.unitType,
            ...subQryFieldDataParams,
        ];

    }
    // query =query+" INSERT INTO store_categories (version,category_level1_id,category_level2_id,category_level3_id,city_id,is_active,store_id,category_level1sort_order,"+
    // "category_level1status,category_level2sort_order,category_level2status,category_level3sort_order,category_level3status) VALUES "+
    // " ()"
    queryExecution.queryExecution(client, jsonObj, event, query, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let result = response.result
        event.storeItemStockId = event.storeItemStockId ? event.storeItemStockId : result.insertId
        let subQuery = "";
        let subQueryParams = [];
        if (event.level3) {
            subQuery = " AND i.category_level3_id = ?;"
            subQueryParams = [event.level3];
        }
        else {
            subQuery = " AND i.category_level3_id = NULL;"
        }
        let swapQuery = " Select sis.id as storeItemStockId,sis.net_amount AS netAmount,sis.item_id as itemId " +
            " FROM item as i " +
            " INNER JOIN store_item_stock as sis ON sis.item_id = i.id " +
            " WHERE i.name = ? " +
            " AND i.category_level1_id = ? " +
            " AND i.category_level2_id = ? " +
            subQuery;
        let swapQueryParams = [event.itemName, event.level1, event.level2, ...subQueryParams];
        let swapItemMap = `
            SELECT fn_GetIsSwapItem(0, ?, ?, ?, ?, ?, ?) AS swapItemMap;
        `;

        let swapItemMapParams = [
            event.storeItemStockId,
            event.cityId,
            event.storeId,
            event.itemId,
            event.netAmount,
            event.swapPercentage
        ];

        console.log("swapItemMap ", swapItemMap)
        queryExecution.queryExecution(client, jsonObj, event, swapItemMap, swapItemMapParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            result = response.result


        });
    });
}
module.exports = methods;