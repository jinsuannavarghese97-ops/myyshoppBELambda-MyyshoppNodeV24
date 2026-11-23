let mysql = require('mysql');
let methods = {};
const https = require('https');
const http = require('http');
let queryExecution = require('../queryExecution');
methods.searchResultItemListing = function (client, jsonObj, event, callback) {
    let max = (jsonObj.max == '' ? '25' : jsonObj.max);
    let offset = (jsonObj.offset == '' ? '0' : jsonObj.offset);
    let store = (jsonObj.storeId == '' ? '*' : jsonObj.storeId);
    let storeDetails = `
  SELECT 
    s.city_id AS cityId,
    IF(s.has_contact_us_without_price = TRUE, '1', '0') AS hasContactUsWithoutPrice,
    IF(s.has_buy_option = TRUE, '1', '0') AS hasBuyOption,
    s.store_button_name AS storeButtonName,
    IF(s.display_item_price = TRUE, '1', '0') AS displayItemPrice,
    c.symbol AS currencySymbol,
    CONCAT(
      (SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'), '/',
      (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'), '/',
      (SELECT config_value FROM configuration WHERE config_key = 'itemImagesFolder')
    ) AS imagePath,
    ? AS itemMax,
    ? AS itemOffset,
    (SELECT config_value FROM configuration WHERE config_key = 'solarPath') AS solrPath
   ` +
// `, (SELECT config_value FROM configuration WHERE config_key = 's3bucketAccessKey') AS s3bucketAccessKey,
// (SELECT config_value FROM configuration WHERE config_key = 's3bucketSecretKey') AS s3bucketSecretKey` +
`
  FROM 
    store AS s 
  INNER JOIN 
    currency AS c ON c.id = s.currency_id 
  WHERE 
    s.id = ?;
`;

    const storeDetailsParams = [parseInt(max), parseInt(offset), store];

    //connection.query(storeDetails, function (error, storeResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, storeDetails, storeDetailsParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeResults = response.result;
        const responseData = {
            success: "1",
            successMessage: storeResults.length > 0 ? "Success" : "No data found.",
            result: {
                itemResult: storeResults
            },
            errorMessage: ""
        }
        callback(responseData)

    });
}
module.exports = methods;
