let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.banner = function (client, jsonObj, event, callback) {


    let storeId = jsonObj.storeId;
    let bannerData = [];

    let storeQuery = " select * from store " +
        " where id = ? ";

    //connection.query(storeQuery, function (error, storeResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, storeQuery, [storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeResults = response.result

        if (storeResults.length > 0) {

            let queryString = "SELECT b.id AS bannerID, b.url AS url, " +
                "buc.title AS starTitle, buc.image_path as starImagePath, " +
                "buc.id AS coordinateID, buc.url AS starUrl, buc.x_axis AS xAxis, " + "buc.y_axis AS yAxis, buc.banner_id AS bannerSubId, " +
                "CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
                "(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                "(SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', " +
                "if(b.image_path is null,'default.jpg',b.image_path)) AS image_path " +
                "FROM banner AS b " +
                "inner join store as st on b.store_id = st.id " +
                "LEFT JOIN banner_url_coordinates AS buc ON b.id = buc.banner_id " +
                "WHERE b.is_active = TRUE AND b.is_approved = TRUE AND b.store_id = ? " +
                " AND b.banner_type_id = ? AND b.rank>0 AND (CURDATE() BETWEEN DATE(b.from_date) AND DATE(b.to_date)) " +
                "GROUP BY b.id " + "ORDER BY b.rank ASC, RAND() "
            console.log("banner....", queryString)
            //connection.query(queryString, function (error, results, fields) {
            queryExecution.queryExecution(client, jsonObj, event, queryString, [storeId, jsonObj.bannerType], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let results = response.result

                for (let i = 0; i < results.length; i++) {
                    bannerData[i] = {
                        bannerID: results[i].bannerID,
                        url: (results[i].url == null) ? '' : results[i].url,
                        image_path: (results[i].image_path == null) ? '' : results[i].image_path,
                        starTitle: (results[i].starTitle == null) ? '' : results[i].starTitle,
                        starImagePath: (results[i].starImagePath == null) ? '' : results[i].starImagePath,
                        coordinateID: (results[i].coordinateID == null) ? '' : results[i].coordinateID,
                        starUrl: (results[i].starUrl == null) ? '' : results[i].starUrl,
                        xAxis: (results[i].xAxis == null) ? '' : results[i].xAxis,
                        yAxis: (results[i].yAxis == null) ? '' : results[i].yAxis,
                        bannerSubId: (results[i].bannerSubId == null) ? '' : results[i].bannerSubId
                    }
                }

                let resultData = {
                    bannerData: bannerData
                }
                const resultDatum = {
                    success: "1",
                    errorMessage: "",
                    successMessage: "Success.",
                    result: resultData
                };
                callback(resultDatum);
            });
        }
        else {
            const resultData = {
                success: "1",
                errorMessage: "",
                successMessage: "No Data Found.",
                result: { bannerData: [] }
            };
            callback(resultData);
        }

    });
}
module.exports = methods;