var mysql = require('mysql');
var methods = {};
methods.sellerStockPrice = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    })
    pool.getConnection(function (err, connection) {
        var subQuery = "";
        let subQueryParams = [];
        var storeId = jsonObj.storeId
        var sellerStockPriceCmbSelect = jsonObj.sellerStockPriceCmbSelect
        var sellerStockPriceTextInput = jsonObj.sellerStockPriceTextInput
        var sellerId = jsonObj.sellerId
        var sellerStockPriceOffset = jsonObj.sellerStockPriceOffset
        var sellerStockPriceMax = jsonObj.sellerStockPriceMax
        var stockPriceDetails = []
        var result = []
        var storeDetails = []

        if (storeId != "" && storeId != null && storeId != "0") {
            subQuery = " and s.id = ?";
            subQueryParams.push(storeId);
        }
        if (sellerStockPriceCmbSelect != "" && sellerStockPriceCmbSelect != null && sellerStockPriceCmbSelect != "0") {
            if (sellerStockPriceCmbSelect == "stockQuantity") {
                subQuery = subQuery + " and stit.stock_quantity < ? ";
                subQueryParams.push(sellerStockPriceTextInput);
            }
            if (sellerStockPriceCmbSelect == "itemName") {
                subQuery = "  and stit.item_name like ? ";
                subQueryParams.push(sellerStockPriceTextInput + "%");
            }
        }
        var queryString = " select stit.item_id as id,si.seller_id as sellerid,stit.store_id as storeid,s.name as stotrename,stit.item_name as item,stit.item_buy_count as buycount,stit.stock_quantity as quantity,concat(stit.unit,'',stit.unit_type) as unit, stit.net_amount as netamount,stit.mrp as price,stit.offer_price as offerprice,stit.offer_from as oferfrom,stit.offer_to as toofer from store_item_stock as stit" +
            " inner join seller_item as si on si.id=stit.seller_item_id " +
            " inner join store as s on s.id=stit.store_id " +
            " where si.seller_id = ? " + subQuery +
            " order by stit.stock_quantity asc ; " +

            " select stit.item_id as id,si.seller_id as sellerid,stit.store_id as storeid,s.name as stotrename,stit.item_name as item,stit.item_buy_count as buycount,stit.stock_quantity as quantity,concat(stit.unit,'',stit.unit_type) as unit, stit.net_amount as netamount,stit.mrp as price,stit.offer_price as offerprice,stit.offer_from as oferfrom,stit.offer_to as toofer from store_item_stock as stit" +
            " inner join seller_item as si on si.id=stit.seller_item_id " +
            " inner join store as s on s.id=stit.store_id " +
            " where si.seller_id = ? " + subQuery +
            " order by stit.stock_quantity asc " +
            " limit ?,?; " +

            " select s.id as sId,s.name as strName from store s " +
            " inner join seller as slr on slr.id = s.seller_id " +
            " where slr.id = ? and s.is_active=true  group by s.id  ; ";
        const queryParams = [
            sellerId,
            ...subQueryParams,
            sellerId,
            ...subQueryParams,
            parseInt(sellerStockPriceOffset),
            parseInt(sellerStockPriceMax),
            sellerId
        ];

        connection.query(queryString, queryParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting seller stock price details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {

                for (var i = 0; i < queryStringResult[1].length; i++) {
                    stockPriceDetails[i] = {
                        storeItemStockId: queryStringResult[1][i].id == null ? '' : queryStringResult[1][i].id,
                        sellerId: queryStringResult[1][i].sellerid == null ? '' : queryStringResult[1][i].sellerid,
                        storeId: queryStringResult[1][i].storeid == null ? '' : queryStringResult[1][i].storeid,
                        storeName: queryStringResult[1][i].stotrename == null ? '' : queryStringResult[1][i].stotrename,
                        itemName: queryStringResult[1][i].item == null ? '' : queryStringResult[1][i].item,
                        itemBuyCount: queryStringResult[1][i].buycount == null ? '' : queryStringResult[1][i].buycount,
                        quantity: queryStringResult[1][i].quantity == null ? '' : queryStringResult[1][i].quantity,
                        unit: queryStringResult[1][i].unit == null ? '' : queryStringResult[1][i].unit,
                        netAmount: queryStringResult[1][i].netamount == null ? '' : queryStringResult[1][i].netamount,
                        mrp: queryStringResult[1][i].price == null ? '' : queryStringResult[1][i].price,
                        offerPrice: queryStringResult[1][i].offerprice == null ? '' : queryStringResult[1][i].offerprice,
                        oferFrom: queryStringResult[1][i].oferfrom == null ? '' : queryStringResult[1][i].oferfrom,
                        offerTo: queryStringResult[1][i].toofer == null ? '' : queryStringResult[1][i].toofer
                    }
                }
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    storeDetails[j] = {
                        storeId: queryStringResult[2][j].sId == null ? '' : queryStringResult[2][j].sId,
                        storeName: queryStringResult[2][j].strName == null ? '' : queryStringResult[2][j].strName
                    }
                }
                var totalCount = queryStringResult[0].length
                result = {
                    stockPriceDetails: stockPriceDetails,
                    totalCount: totalCount,
                    storeDetails: storeDetails
                }
                //console.log(result)
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
        });
    });
}
module.exports = methods;