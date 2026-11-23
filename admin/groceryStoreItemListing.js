let queryExecution = require('../queryExecution');
let methods = {};

methods.groceryStoreItemListing = function (client, jsonObj, event, callback) {
    let storequery = ''
    let limitQry = ''
    let searchQry = ''
    let statusQry = ''
    let values = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    let limitVal = []
    if (event.storeId) {
        storequery = "and sis.store_id =?"
        values.push(event.storeId)
    }

    if (event.itemName) {
        searchQry = ` and sis.item_name LIKE ?`
        values.push(removeQuotes(`'%${event.itemName}%'`))

    }
    if (event.cmbStatus) {
        statusQry = ` and sis.is_active = ? `
        values.push(event.cmbStatus)

    }
    if (event.max) {
        limitQry = "limit  ?,?"
        limitVal.push(parseInt(event.offset), parseInt(event.max))
    }
    let storeItemListQry = `SELECT sis.item_name AS storeItemStockItemName,i.name AS itemName, IFNULL(sis.unit, 0) AS unit,
    (select symbol from currency where id in(select currency_id from store where id=sis.store_id)) as currencySymbol,
    IFNULL(sis.unit_type, '') AS unit_type,sis.item_code,sis.item_price,sis.mrp, sis.net_amount, sis.stock_quantity,
    sis.stock_updated_on, sis.created_on, IF(sis.is_active = true,true,false) as is_active,sis.id AS storeItemStockId,sis.item_id,sis.seller_item_id,
    cl1.id as category1Id,cl2.id as category2Id,cl3.id as category3Id,cl1.name AS category1,cl2.name AS category2,cl3.name AS category3,b.name AS brandName,
    CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'), '/', (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'), '/', (SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) AS imagePath,
    i.logo_path,i.logo_path_thumb
FROM  
    store_item_stock AS sis  
        INNER JOIN
    item i ON i.id = sis.item_id
        INNER JOIN
    category_level1 cl1 ON cl1.id = i.category_level1_id
        INNER JOIN
    category_level2 cl2 ON cl2.id = i.category_level2_id
        LEFT JOIN
    category_level3 cl3 ON cl3.id = i.category_level3_id
        LEFT JOIN
    brand b ON b.id = i.brand_id where sis.id != '0' ${storequery} ${searchQry} ${statusQry} ${limitQry} ;
    
    SELECT count(*) as totalCount
FROM  
    store_item_stock AS sis  
        INNER JOIN
    item i ON i.id = sis.item_id
        INNER JOIN
    category_level1 cl1 ON cl1.id = i.category_level1_id
        INNER JOIN
    category_level2 cl2 ON cl2.id = i.category_level2_id
        LEFT JOIN
    category_level3 cl3 ON cl3.id = i.category_level3_id
        LEFT JOIN
    brand b ON b.id = i.brand_id where sis.id != '0' ${storequery} ${searchQry} ${statusQry} ; `

    //     SELECT 
    //     sis.item_name AS storeItemStockItemName,i.name AS itemName, IFNULL(sis.unit, 0) AS unit,IFNULL(sis.unit_type, '') AS unit_type,
    //     sis.item_code,sis.item_price,sis.mrp, sis.net_amount, sis.stock_quantity,sis.stock_updated_on, sis.created_on, IF(sis.is_active = true,true,false) as is_active,
    //     sis.id AS storeItemStockId,sis.item_id,sis.seller_item_id,cl1.name AS category1,cl2.name AS category2,cl3.name AS category3,
    //     b.name AS brandName
    // FROM  
    //     store_item_stock AS sis  
    //         INNER JOIN
    //     item i ON i.id = sis.item_id
    //         INNER JOIN
    //     category_level1 cl1 ON cl1.id = i.category_level1_id
    //         INNER JOIN
    //     category_level2 cl2 ON cl2.id = i.category_level2_id
    //         LEFT JOIN
    //     category_level3 cl3 ON cl3.id = i.category_level3_id
    //         LEFT JOIN
    //     brand b ON b.id = i.brand_id where sis.id != '0' ${storequery} ${searchQry} ${statusQry} ;

    queryExecution.queryExecution(client, jsonObj, event, storeItemListQry, [...values, ...limitVal, ...values], function (response) {
        console.log("response.....", response.result[0])
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results.length > 0) {
            const response = {
                "success": "1",
                "successMessage": "Success",
                "result": {
                    storeItemData: JSON.parse(JSON.stringify(results[0]).replace(/\:null/gi, "\:\"\""))
                    // storeItemExportData :  JSON.parse(JSON.stringify(results[2]).replace(/\:null/gi, "\:\"\"")) 
                },
                "totalCount": results[1][0].totalCount,
                "errorMessage": ""
            }
            callback(response)
        }
        else {
            const response = {
                "success": "1",
                "successMessage": "No data found.",
                "errorMessage": ""
            }
            callback(response)
        }
    });

}
module.exports = methods;
