const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let leftMenuData = [];
    let leftMenuLevel1Query
    let leftMenuLevel2Query
    let leftMenuLevel3Query
    let storeId = event.storeId

    leftMenuLevel1Query = " SELECT DISTINCT l1.id AS level1Id, l1.name AS level1Name " +
        " FROM rt_store_item AS rsi " +
        "INNER JOIN rt_cuisine AS l1 ON l1.id = rsi.rt_cuisine_id " +
        " INNER JOIN  rt_spice AS s ON s.id = rsi.rt_spice_id " +
        " INNER JOIN rt_store_item_size AS rsis ON rsi.id = rsis.rt_store_item_id " +
        " INNER JOIN  rt_item_size AS ris ON ris.id = rsis.rt_item_size_id " +
        " LEFT JOIN rt_menu_sort_order AS rmso ON rmso.type_id = l1.id " +
        "  AND rmso.is_active = TRUE " +
        " AND rmso.store_id = 258 AND rmso.rt_menu_type_id = 1" +
        "  LEFT JOIN rt_menu_type AS rmt ON rmt.id = rmso.rt_menu_type_id  AND rmt.name = 'rt_cuisine' " +
        " WHERE  rsi.is_active = TRUE  AND l1.is_active = TRUE " +
        "  AND s.is_active = TRUE  AND rsis.is_active = TRUE " +
        "  AND ris.is_active = TRUE  AND rsi.store_id = ? " +
        " ORDER BY rmso.sort_order ASC ;"

    leftMenuLevel2Query = " SELECT  l1.id AS level1Id,l1.name AS level1Name,l2.id AS level2Id,l2.name AS level2Name " +
        " FROM rt_store_item AS rsi " +
        " INNER JOIN rt_cuisine AS l1 ON l1.id = rsi.rt_cuisine_id " +
        "  INNER JOIN rt_course AS l2 ON l2.id = rsi.rt_course_id " +
        "  INNER JOIN rt_spice AS s ON s.id = rsi.rt_spice_id " +
        "  INNER JOIN rt_store_item_size AS rsis ON rsi.id = rsis.rt_store_item_id " +
        " INNER JOIN  rt_item_size AS ris ON ris.id = rsis.rt_item_size_id " +
        " LEFT JOIN  rt_menu_sort_order AS rmso ON rmso.type_id = l2.id " +
        " AND rmso.is_active = TRUE  AND rmso.store_id = ? " +
        "  AND rmso.rt_menu_type_id = 2 " +
        "  LEFT JOIN rt_menu_type AS rmt ON rmt.id = rmso.rt_menu_type_id " +
        "  AND rmt.name = 'rt_course' " +
        " WHERE rsi.is_active = TRUE AND l1.is_active = TRUE " +
        "  AND l2.is_active = TRUE AND s.is_active = TRUE " +
        " AND rsis.is_active = TRUE  AND ris.is_active = TRUE " +
        "  AND rsi.store_id = ? GROUP BY l1.id , l2.id " +
        " ORDER BY rmso.sort_order ASC ;"

    leftMenuLevel3Query = " SELECT  l3.id AS level1Id,l3.name AS level1Name,l1.id AS level2Id," +
        "  l1.name AS level2Name,l2.id AS level3Id,l2.name AS level3Name " +
        "FROM rt_store_item AS rsi " +
        " INNER JOIN  rt_course AS l1 ON l1.id = rsi.rt_course_id " +
        "  INNER JOIN rt_course_type AS l2 ON l2.id = rsi.rt_course_type_id " +
        " INNER JOIN rt_cuisine AS l3 ON l3.id = rsi.rt_cuisine_id " +
        " INNER JOIN rt_spice AS s ON s.id = rsi.rt_spice_id " +
        " INNER JOIN  rt_store_item_size AS rsis ON rsi.id = rsis.rt_store_item_id " +
        " INNER JOIN  rt_item_size AS ris ON ris.id = rsis.rt_item_size_id " +
        " LEFT JOIN rt_menu_sort_order AS rmso ON rmso.type_id = l2.id " +
        "  AND rmso.is_active = TRUE  AND rmso.store_id = ? " +
        " AND rmso.rt_menu_type_id = 3 " +
        "  LEFT JOIN rt_menu_type AS rmt ON rmt.id = rmso.rt_menu_type_id " +
        " AND rmt.name = 'rt_course_type'  " +
        " WHERE rsi.is_active = TRUE  AND l1.is_active = TRUE " +
        " AND l2.is_active = TRUE  AND s.is_active = TRUE " +
        "  AND rsis.is_active = TRUE AND ris.is_active = TRUE " +
        "  AND rsi.store_id = ? " +
        " GROUP BY l1.id , l2.id , l3.id " +
        " ORDER BY rmso.sort_order ASC ";
    const queryParams = [storeId, storeId, storeId, storeId, storeId];
    //connection.query(leftMenuLevel1Query, function (error, leftMenuLevel1Results, fields) {
    queryExecution.queryExecution(client, jsonObj, event, leftMenuLevel1Query + leftMenuLevel2Query + leftMenuLevel3Query, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let leftMenuLevelResults = response.result;
        const responseData = {
            success: "1",
            result: {
                "leftMenuLevel1Results": leftMenuLevelResults[0],
                "leftMenuLevel2Results": leftMenuLevelResults[1],
                "leftMenuLevel3Results": leftMenuLevelResults[2],
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);



    })
}
module.exports = methods;
