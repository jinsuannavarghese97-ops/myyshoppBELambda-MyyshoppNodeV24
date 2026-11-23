let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.getStoreDetails = function (client, jsonObj, event, callback) {

    let storeId = jsonObj.storeId;
    let bannerData = [];
    let socialMediaLink = [];
    let categoryLevel1 = [];
    let storeQuery = " select * from store " +
        " where id = ? "

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
                " AND b.banner_type_id = 2 AND b.rank>0 AND (CURDATE() BETWEEN DATE(b.from_date) AND DATE(b.to_date)) " +
                "GROUP BY b.id " + "ORDER BY b.rank ASC, RAND() "
            queryExecution.queryExecution(client, jsonObj, event, queryString, [storeId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let results = response.result
                if (results.length > 0) {
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
                    let queryString1 = "select sfl.url as url " +
                        "from seller_footer_links as sfl " +
                        "WHERE sfl.is_media = TRUE AND sfl.seller_id = 4 " +
                        "AND sfl.name = 'facebook'; " +
                        "select sfl.url as url " +
                        "from seller_footer_links as sfl " +
                        "WHERE sfl.is_media = TRUE AND sfl.seller_id = 4 " +
                        "AND sfl.name = 'twitter'; " +
                        "select sfl.url as url " +
                        "from seller_footer_links as sfl " +
                        "WHERE sfl.is_media = TRUE AND sfl.seller_id = 4 " +
                        "AND sfl.name = 'google'; "
                    queryExecution.queryExecution(client, jsonObj, event, queryString1, [],function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let results1 = response.result
                        if (results1.length > 0) {
                            let facebookLink = ''
                            let twitterLink = ''
                            let googleLink = ''
                            if (results1[0][0]) {
                                facebookLink = results1[0][0].url
                            }
                            if (results1[1][0]) {
                                twitterLink = results1[1][0].url
                            }
                            if (results1[2][0]) {
                                googleLink = results1[2][0].url
                            }
                            socialMediaLink = {
                                facebookLink: facebookLink,
                                twitterLink: twitterLink,
                                googleLink: googleLink
                            }
                            let queryString2 = ""
                            if (storeResults[0].is_brand_based == true) {
                                queryString2 = "SELECT IFNULL(b.id,0) AS category_level1_id, IFNULL(b.name, '') AS name " +
                                    "FROM store_item_stock sis " +
                                    "INNER JOIN store_item_stock_seo seo " +
                                    "ON seo.city_id = sis.city_id " +
                                    "AND seo.store_item_stock_id = sis.id " +
                                    "INNER JOIN seller_item si " +
                                    "ON si.id = sis.seller_item_id " +
                                    "INNER JOIN store s " +
                                    "ON s.id = sis.store_id " +
                                    "AND s.city_id = sis.city_id " +
                                    "INNER JOIN city c " +
                                    "ON c.id = sis.city_id " +
                                    "INNER JOIN item i " +
                                    "ON i.id = sis.item_id " +
                                    "INNER JOIN item_category_group icg " +
                                    "ON icg.item_id = i.id " +
                                    "INNER JOIN category_group cg " +
                                    "ON cg.id = icg.category_group_id " +
                                    "LEFT OUTER JOIN brand b " +
                                    "ON b.id = i.brand_id " +
                                    "INNER JOIN item_names inames " +
                                    "ON inames.item_id = i.id " +
                                    "LEFT OUTER JOIN pack p " +
                                    "ON p.id = i.pack_id " +
                                    "INNER JOIN category_level1 cl1 " +
                                    "ON cl1.id = i.category_level1_id " +
                                    "INNER JOIN category_level2 cl2 " +
                                    "ON cl2.id = i.category_level2_id " +
                                    "LEFT OUTER JOIN category_level3 cl3 " +
                                    "ON cl3.id = i.category_level3_id " +
                                    "AND cl3.is_active = 1 " +
                                    "AND cl3.is_approved = 1 " +
                                    "WHERE sis.is_active = 1 " +
                                    "AND s.is_active = 1 " +
                                    "AND s.is_approved = 1 " +
                                    "AND c.is_active = 1 " +
                                    "AND i.is_active = 1 " +
                                    "AND i.is_approved = 1 " +
                                    "AND si.is_active = 1 " +
                                    "AND si.is_approved = 1 " +
                                    "AND p.is_active = 1 " +
                                    "AND p.is_approved = 1 " +
                                    "AND cl1.is_active = 1 " +
                                    "AND cl1.is_approved = 1 " +
                                    "AND cl2.is_active = 1 " +
                                    "AND cl2.is_approved = 1 " +
                                    "AND b.is_active = 1 " +
                                    "AND b.is_approved = 1 " +
                                    "AND s.id = ? " +
                                    "group by b.id " +
                                    "ORDER BY b.name ASC "
                            }
                            else {
                                queryString2 = "Select DISTINCT sc.category_level1_id,cl1.name , cl1.is_red as isRed," +
                                    "cl1.web_image_path AS level1ImagePath " +

                                    " from store_categories as sc " +
                                    "INNER JOIN category_level1 cl1  " +
                                    "ON sc.category_level1_id = cl1.id  " +
                                    "WHERE sc.category_level1status = 1 " +
                                    "AND sc.store_id = ? " +
                                    "ORDER BY sc.category_level1sort_order asc"
                            }
                            //console.log("queryString2.."+queryString2)
                            //connection.query(queryString2, function (error, results2, fields) {
                            queryExecution.queryExecution(client, jsonObj, event, queryString2, [storeId], function (response) {
                                if (response.success == '0') {
                                    callback(response);
                                }
                                let results2 = response.result
                                if (results2.length > 0) {
                                    let queryString3 = ""
                                    if (storeResults[0].is_brand_based == true) {
                                        queryString3 = " SELECT IFNULL(b.id,0) AS category1_id, IFNULL(b.name, '') AS category1_name , " +
                                            " i.category_level1_id as category2_id, c1.name as category2_name " +
                                            " ,group_concat(distinct i.category_level2_id separator '|') as category3_id, " +
                                            " group_concat(distinct c2.name separator '|') as category3_name " +
                                            " FROM store_item_stock sis " +
                                            " INNER JOIN store_item_stock_seo seo ON seo.city_id = sis.city_id AND seo.store_item_stock_id = sis.id " +
                                            " INNER JOIN seller_item si ON si.id = sis.seller_item_id " +
                                            " INNER JOIN store s ON s.id = sis.store_id AND s.city_id = sis.city_id " +
                                            " INNER JOIN city c ON c.id = sis.city_id " +
                                            " INNER JOIN item i ON i.id = sis.item_id " +
                                            " inner join category_level1 as c1 on c1.id = i.category_level1_id " +
                                            " inner join category_level2 as c2 on c2.id = i.category_level2_id " +
                                            " INNER JOIN item_category_group icg ON icg.item_id = i.id " +
                                            " INNER JOIN category_group cg ON cg.id = icg.category_group_id " +
                                            " inner JOIN brand b ON b.id = i.brand_id " +
                                            " INNER JOIN item_names inames ON inames.item_id = i.id " +
                                            " LEFT OUTER JOIN pack p ON p.id = i.pack_id " +
                                            " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id " +
                                            " INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id " +
                                            " LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id AND cl3.is_active = 1 AND cl3.is_approved = 1 " +
                                            " WHERE sis.is_active = 1 AND s.is_active = 1 AND s.is_approved = 1 AND c.is_active = 1 AND i.is_active = 1 " +
                                            " AND i.is_approved = 1 AND si.is_active = 1 AND si.is_approved = 1 AND p.is_active = 1 AND p.is_approved = 1 " +
                                            " AND cl1.is_active = 1 AND cl1.is_approved = 1 AND cl2.is_active = 1 AND cl2.is_approved = 1 " +
                                            " AND b.is_active = 1 AND b.is_approved = 1 AND s.id = ? group by b.id ,i.category_level1_id "
                                    }
                                    else {
                                        queryString3 = "Select DISTINCT sc.category_level1_id AS category1_id,cat1.name AS category1_name, " +
                                            "sc.category_level2_id AS category2_id,cat2.name AS category2_name,group_concat(DISTINCT sc.category_level3_id ORDER BY cat3.sort_order SEPARATOR '|') " +
                                            "AS category3_id,group_concat(DISTINCT cat3.name ORDER BY cat3.sort_order SEPARATOR '|') AS category3_name, cat1.web_image_path AS level1ImagePath " +
                                            "from store_categories as sc " +
                                            "INNER JOIN category_level1 as cat1 on cat1.id=sc.category_level1_id and sc.category_level1status = 1 " +
                                            "INNER JOIN category_level2 as cat2 on cat2.id=sc.category_level2_id AND sc.category_level2status = 1 " +
                                            "LEFT OUTER JOIN category_level3 as cat3 on cat3.id=sc.category_level3_id AND sc.category_level3status = 1 " +
                                            "WHERE sc.store_id = ? " +
                                            "GROUP BY sc.category_level1_id, sc.category_level2_id " +
                                            "ORDER BY sc.category_level1sort_order asc,sc.category_level2sort_order asc,sc.category_level3sort_order asc "
                                    }
                                    console.log("...queryString3..",queryString3)
                                    queryExecution.queryExecution(client, jsonObj, event, queryString3, [storeId], function (response) {
                                        if (response.success == '0') {
                                            callback(response);
                                        }
                                        let results3 = response.result
                                         console.log("...results3..",results3)
                                        if (results3.length > 0) {
                                            for (let i = 0; i < results2.length; i++) {
                                                categoryLevel1[i] = {
                                                    category_level1_id: results2[i].category_level1_id,
                                                    name: results2[i].name,
                                                    level1ImagePath: results2[i].level1ImagePath
                                                }
                                                let categoryLevel2 = [];
                                                let count = 0;
                                                for (let j = 0; j < results3.length; j++) {
                                                    if (results3[j].category1_id == results2[i].category_level1_id) {
                                                        categoryLevel2[count] = {
                                                            category1_id: results3[j].category1_id,
                                                            category1_name: (results3[j].category1_name == null) ? '' : results3[j].category1_name,
                                                            level1ImagePath: results3[j].level1ImagePath,
                                                            category2_id: results3[j].category2_id,
                                                            category2_name: (results3[j].category2_name == null) ? '' : results3[j].category2_name,
                                                            category3_id: results3[j].category3_id,
                                                            category3_name: (results3[j].category3_name == null) ? '' : results3[j].category3_name
                                                        }
                                                        let categoryLevel3 = [];
                                                        if (results3[j].category3_name) {
                                                            let categoryName3 = results3[j].category3_name.split("|");
                                                            let categoryId3 = results3[j].category3_id.split("|");
                                                            for (let k = 0; k < categoryId3.length; k++) {
                                                                categoryLevel3[k] = {
                                                                    category3_id: categoryId3[k],
                                                                    category3_name: (categoryName3[k] == null) ? '' : categoryName3[k]
                                                                }
                                                            }
                                                        }
                                                        categoryLevel2[count].categoryLevel3 = categoryLevel3
                                                        count++;
                                                    }
                                                    categoryLevel1[i].categoryLevel2 = categoryLevel2
                                                }
                                            }
                                            let resultData = {
                                                bannerData: bannerData,
                                                socialMediaLink: socialMediaLink,
                                                category: categoryLevel1
                                            }
                                            //callback(resultData;
                                            const resultDatum = {
                                                success: "1",
                                                errorMessage: "",
                                                successMessage: "Success.",
                                                result: resultData
                                            };
                                            console.log("..resultDatum....",resultDatum.result.category)
                                            console.log("..resultDatum....",resultDatum.result.category[0])
                                            callback(resultDatum);
                                        }
                                        else {
                                            const resultData = {
                                                success: "1",
                                                errorMessage: "",
                                                successMessage: "No Data Found.",
                                                result: {
                                                    bannerData: [],
                                                    socialMediaLink: [],
                                                    category: []
                                                }
                                            };
                                            callback(resultData);
                                        }

                                    });
                                }
                                else {
                                    const resultData = {
                                        success: "1",
                                        errorMessage: "",
                                        successMessage: "No Data Found.",
                                        result: {
                                            bannerData: [],
                                            socialMediaLink: [],
                                            category: []
                                        }
                                    };
                                    callback(resultData);
                                }

                            });
                        }
                        else {
                            console.log("2222222222222")
                            const resultData = {
                                success: "1",
                                errorMessage: "",
                                successMessage: "No Data Found.",
                                result: {
                                    bannerData: [],
                                    socialMediaLink: [],
                                    category: []
                                }
                            };
                            callback(resultData);
                        }

                    });
                }
                else {
                    const resultData = {
                        success: "1",
                        errorMessage: "",
                        successMessage: "No Data Found.",
                        result: {
                            bannerData: [],
                            socialMediaLink: [],
                            category: []
                        }
                    };
                    callback(resultData);
                }

            });
        }
        else {
            const resultData = {
                success: "1",
                errorMessage: "",
                successMessage: "No Data Found.",
                result: {
                    bannerData: [],
                    socialMediaLink: [],
                    category: []
                }
            };
            callback(resultData);
        }


    });
}
module.exports = methods;