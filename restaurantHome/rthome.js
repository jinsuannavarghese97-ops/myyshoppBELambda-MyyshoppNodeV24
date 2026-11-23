const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let sellerId = event.sellerId;
    let sellerQuery = " select se.home_page_html as innerhtml,group_concat(st.id) as storeId " +
        " from seller as se " +
        " inner join store as st on st.seller_id=se.id " +
        " where se.id= ?" +
        " group by se.id"
    queryExecution.queryExecution(client, jsonObj, event, sellerQuery, [sellerId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let sellerResult = response.result;
        let bannerQuery = " Select store_id as storeId,CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/'," +

            "(select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
            "(select config_value from configuration where config_key = 'storeImagesFolder'),'/',b.image_path) as imagePath ," +
            " b.name as bannerName " +
            " from banner as b " +
            " where theme_id IS NULL and store_id in(?) and is_active=true " +
            " and is_approved=true and banner_type_id=9 " +
            " and rank>0 AND (CURDATE() BETWEEN DATE(from_date) AND DATE(to_date)) order by rank ASC, RAND() "

        queryExecution.queryExecution(client, jsonObj, event, bannerQuery, [sellerResult[0].storeId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let bannerResults = response.result;
            const responseData = {
                success: "1",
                result: {
                    "bannerDetails": bannerResults,
                    "innerHtmlDetails": sellerResult[0].innerhtml,
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(responseData);
        })
    })

}
module.exports = methods;
