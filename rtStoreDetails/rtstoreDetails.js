const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let storeQuery
    let storeBannerQuery
    let coursetypeQuery
    let storeId = event.storeId
    let offset = event.offset ? event.offset : 0;
    let max = event.max ? event.max : 20;
    let alcoholSubQry = ""
    let alcoholContent = ""
    if (event.alcoholContent && event.alcoholContent.length > 0) {
        event.alcoholContent.forEach(element => {
            alcoholContent = alcoholContent + "," + element
        })
        alcoholSubQry = " and a.alcohol_content in ("+alcoholContent.slice(1)+")"
    }
    storeQuery = " Select CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 'storeImagesFolder'),'/',st.logo_path) as logoPath," +
        " st.name as storeName,st.locality as locality,c.name as cityName ,st.id as storeId " +
        " from store as st " +
        " inner join city as c on c.id=st.city_id " +
        " where st.id = ?;";

    storeBannerQuery = " SELECT b.id AS bannerID, CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 'storeImagesFolder'),'/',b.image_path) AS image_path" +
        " FROM banner AS b " +
        " WHERE b.is_active=TRUE AND b.is_approved=TRUE  " +
        " AND b.store_id = ? AND b.banner_type_id=2 AND b.rank>0 " +
        " AND (CURDATE() BETWEEN DATE(b.from_date) AND DATE(b.to_date)) " +
        " GROUP BY b.id ORDER BY b.rank ASC, RAND() ;";

    coursetypeQuery = " SELECT a.rt_course_id as courseid,b.name as coursename,a.alcohol_content " +
        " FROM rt_store_item a " +
        " inner join rt_course b on a.rt_course_id=b.id and b.is_active=true " +
        "  where store_id = ? and a.is_active=true " + alcoholSubQry +
        " group by b.name order by max(a.ranking) asc, max(a.item_buy_count) desc, max(a.item_view_count) desc limit ?,?; ";

    const queryParams = [storeId, storeId, storeId, parseInt(offset), parseInt(max)];
    queryExecution.queryExecution(client, jsonObj, event, storeQuery + storeBannerQuery + coursetypeQuery, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeResult = response.result;

        const responseData = {
            success: "1",
            result: {
                "storeResult": storeResult[0],
                "storeBannerResult": storeResult[1],
                "coursetypeResult": storeResult[2]
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);
    });

}
module.exports = methods;
