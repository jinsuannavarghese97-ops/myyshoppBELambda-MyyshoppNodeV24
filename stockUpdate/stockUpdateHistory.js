const queryExecution = require('../queryExecution');
const methods = {};
methods.stockUpdateHistory = function (client, jsonObj, event, callback) {

    let wquery = "";
    let wqueryParams = [];
    if (event.cmbSelect == "1") {
        wquery = " and sl.retail_group_name like ? ";
        wqueryParams.push(event.keyword + "%");
    }
    else if (event.cmbSelect == "2") {
        wquery = " and CONCAT(s.name,',',s.locality) like ? ";
        wqueryParams.push(event.keyword + "%");
    }
    if (event.fromDate && event.toDate) {
        wquery = wquery + " and (sis.created_on between ? and ?) ";
        wqueryParams.push(event.fromDate, event.toDate);
    }
    else if (event.fromDate && !event.toDate) {
        wquery = wquery + " and DATE(sis.created_on) >= ? ";
        wqueryParams.push(event.fromDate);
    }
    else if (!event.fromDate && event.toDate) {
        wquery = wquery + " and sis.created_on <= ? ";
        wqueryParams.push(event.toDate);
    }


    let query = " SELECT sis.id as statusId,sl.retail_group_name as sellerName,sl.id as sellerId,CONCAT(s.name,',',s.locality) AS storeName,s.id as storeId,date_format(sis.created_on,'%d-%M-%Y %I:%i %p') AS uploadedOn,date_format(sis.stock_updated_on,'%d-%M-%Y %I:%i %p') AS updatedOn, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'csvFileFolderBackup'),'/',sis.file_name) AS s3fileName,sis.file_name as filename, s.city_id as storeCityId, " +
        " sis.aws_count AS awsCount,sis.error_count as errorCount,sis.import_count as importCount,sis.process_count as processedCount,sis.unchanged_count as unchangedCount,sis.city_id as storeItemStockCityId " +
        " FROM store_item_stock_import_status AS sis " +
        " INNER JOIN store as s ON s.id = sis.store_id " +
        " INNER JOIN seller as sl ON sl.id = s.seller_id " +
        " WHERE sis.id != " + 0 + wquery +
        " order by sis.created_on desc " +
        " limit ?, ?;" +

        " select count(sis.id) as totalCount " +
        " from store_item_stock_import_status as sis " +
        " INNER JOIN store as s ON s.id = sis.store_id " +
        " INNER JOIN seller as sl ON sl.id = s.seller_id " +
        " where sis.id != " + 0 + wquery + ";"
    queryExecution.queryExecution(client, jsonObj, event, query, [...wqueryParams, parseInt(event.offset), parseInt(event.max), ...wqueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let result = response.result
        if (result[1].totalCount == 0) {
            const responseData = {
                success: "0",
                result: [],
                successMessage: "",
                errorMessage: "No item found."
            }
            callback(responseData);
        }
        else {
            const responseData = {
                success: "1",
                result: [{
                    historyList: result[0],
                    count: result[1][0].totalCount
                }],
                successMessage: "",
                errorMessage: "Success"
            }
            callback(responseData);
        }
    });

}
module.exports = methods;