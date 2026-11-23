const queryExecution = require('../queryExecution');
const methods = {};
methods.storeItemList = function (client, jsonObj, event, callback) {
    let listQry = " select st.locality as locality, st.id as id, st.name as name, if(st.display_item_price is true,'true','false') as displayItemPrice, " +
        " c.id as cityId, c.name as cityName, se.id as stateId, se.name as stateName, st.address1, st.address2 " +
        " from seller as sl " +
        " inner join store as st on st.seller_id = sl.id and st.id = ?" +
        " inner join store_main_category as smc on st.id = smc.store_id " +
        " inner join main_category as mc on smc.main_category_id = mc.id and mc.main_group_category_id = 1 " +
        " inner join city as c on st.city_id = c.id " +
        " inner join state as se on c.state_id = se.id; " +

        " SELECT si.display_name as sellerItemDisplayName, i.id as itemId, b.id as brandId, b.name as brandName, si.item_code as itemCode,sis.unit as unit,sis.unit_type as unitType, " +
        " p.name as packName, i.name as itemName,sis.city_id as cityId,sis.store_id as storeId, sis.mrp AS mrp, " +
        " i.description as itemDescription,sis.item_name as storeItemStockName, sis.id AS storeItemStockId,sis.item_price AS itemPrice,sis.stock_quantity AS stockQuantity, " +
        " if(sis.is_offer is true,'true','false') AS isOffer,sis.offer_price AS offerPrice, sis.net_amount as netAmount, " +
        " date_format(sis.offer_from,'%d/%m/%Y' ) AS offerFrom,date_format(sis.offer_to,'%d/%m/%Y' ) AS offerTo, " +
        " sis.ranking AS ranks,if(sis.is_active is true,'true','false') AS isActive,sis.offer_text AS offerText, " +
        " i.category_level1_id as level1, i.category_level2_id as level2, i.category_level3_id as level3  ,if(sis.is_cancellable is true,'true','false') as isCancellable,   " +
        " if(sis.is_returnable is true,'true','false') as isReturnable ,sis.return_window_id as returnWindowId,time_to_ship_id as timeToShipId " +
        " FROM seller_item as si " +
        " INNER JOIN item as i on i.id = si.item_id " +
        " LEFT JOIN store_item_stock AS sis on si.id = sis.seller_item_id and sis.seller_item_id = ? and sis.store_id = ? and sis.is_active is true " +
        " LEFT JOIN store as s on s.id = sis.store_id and s.id = ?" +
        " LEFT JOIN pack as p on p.id = i.pack_id " +
        " LEFT JOIN brand as b on b.id = i.brand_id " +
        " WHERE si.id = ? ;" +

        " select config_value as swapPercentage from configuration where config_key = 'swapPercentage';";
    const listQryParams = [event.storeId, event.sellerItemId, event.storeId, event.storeId, event.sellerItemId];
    console.log("---------------------", listQry)
    queryExecution.queryExecution(client, jsonObj, event, listQry, listQryParams, function (response) {
        //  console.log("-------in--------------",response)
        if (response.success == '0') {
            callback(response);
        }
        let resultData = response.result
        console.log("resultData ", resultData)
        if (resultData[0].length == 0) {
            const responseData = {
                success: "0",
                result: [],
                swapPercentage: resultData[2][0].swapPercentage,
                successMessage: "",
                errorMessage: "No data found."
            }
            callback(responseData);
        }
        let storeList = []
        for (let i = 0; i <= resultData[0].length; i++) {
            let itemArr = []
            if (i < resultData[0].length) {
                for (let j = 0; j < resultData[1].length; j++) {
                    //if(resultData[0][i].id == resultData[1][j].storeId){
                    resultData[1][j].mrp = resultData[1][j].mrp ? parseFloat(resultData[1][j].mrp).toFixed(2) : ""
                    resultData[1][j].itemPrice = resultData[1][j].itemPrice ? parseFloat(resultData[1][j].itemPrice).toFixed(2) : ""
                    resultData[1][j].netAmount = resultData[1][j].netAmount ? (resultData[1][j].netAmount).toFixed(2) : ""
                    resultData[1][j].offerPrice = resultData[1][j].offerPrice ? parseFloat(resultData[1][j].offerPrice).toFixed(2) : ""
                    resultData[1][j].storeId = resultData[1][j].storeId ? resultData[1][j].storeId : resultData[0][0].id
                    resultData[1][j].cityId = resultData[1][j].cityId ? resultData[1][j].cityId : resultData[0][0].cityId
                    resultData[1][j].cityName = resultData[1][j].cityName ? resultData[1][j].cityName : resultData[0][0].cityName
                    resultData[1][j].storeItemStockName = resultData[1][j].storeItemStockName ? resultData[1][j].storeItemStockName : ""
                    itemArr.push(resultData[1][j])
                    //}
                }
                const storeItem = {
                    storeId: resultData[0][i].id,
                    storeName: resultData[0][i].name,
                    displayItemPrice: resultData[0][i].displayItemPrice,
                    cityId: resultData[0][i].cityId,
                    cityName: resultData[0][i].cityName,
                    stateId: resultData[0][i].stateId,
                    stateName: resultData[0][i].stateName,
                    locality: resultData[0][i].locality,
                    address1: resultData[0][i].address1,
                    address2: resultData[0][i].address2,
                    itemList: itemArr
                }
                storeList.push(storeItem)
            }
            else {
                const responseData = {
                    success: "1",
                    result: JSON.parse(JSON.stringify(storeList).replace(/\:null/gi, "\:\"\"")),
                    swapPercentage: resultData[2][0].swapPercentage,
                    successMessage: "Success",
                    errorMessage: ""
                }

                callback(responseData);
            }

        }
    });
}
module.exports = methods;