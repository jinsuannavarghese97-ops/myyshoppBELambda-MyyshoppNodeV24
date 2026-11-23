let methods = {};
let queryExecution = require('../queryExecution');
methods.footerData = function (client, jsonObj, event, callback) {

    let sellerId = jsonObj.sellerId
    let sellerFooterData = [];
    let urlDetailStatus = [];
    let queryString = " select sfl.url as url " +
        " from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        " AND sfl.name = 'facebook'; " +
        " select sfl.url as url " +
        "  from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        " AND sfl.name = 'twitter'; " +
        " select sfl.url as url " +
        " from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        " AND sfl.name = 'google'; " +
        " select sfl.url as url " +
        " from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        " AND sfl.name = 'Privacy Policy'; " +
        " select sfl.url as url " +
        " from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        "  AND sfl.name = 'About Us'; " +
        " select sfl.url as url " +
        "  from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        " AND sfl.name = 'app store url '; " +
        " select sfl.url as url " +
        " from seller_footer_links as sfl " +
        " WHERE sfl.is_media = TRUE AND sfl.seller_id = ? " +
        " AND sfl.name = ' play store url '; " +
        " select sec.email_id AS emailId, sec.mobile_number AS mobileNumber from  sec_user AS sec " +
        " inner join seller as sl on sl.id=sec.id " +
        " where sl.id = ? ";

    let queryStringParams = [sellerId, sellerId, sellerId, sellerId, sellerId, sellerId, sellerId, sellerId];
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results1 = response.result
        let footerLink = []
        let facebookLink = ''
        let twitterLink = ''
        let googleLink = ''
        let privacyPolicy = ''
        let AboutUs = ''
        let mobileNumber = ''
        let emailId = ''
        let workingTime = ''
        let appStoreUrl = ''
        let playStoreUrl = ''
        if (results1[0][0]) {
            facebookLink = results1[0][0].url
        }
        if (results1[1][0]) {
            twitterLink = results1[1][0].url
        }
        if (results1[2][0]) {
            googleLink = results1[2][0].url
        }
        if (results1[3][0]) {
            privacyPolicy = results1[3][0].url
        }
        if (results1[4][0]) {
            AboutUs = results1[4][0].url
        }
        if (results1[5][0]) {
            appStoreUrl = results1[5][0].url
        }
        if (results1[6][0]) {
            playStoreUrl = results1[6][0].url
        }
        if (results1[7][0]) {
            mobileNumber = results1[7][0].mobileNumber
            emailId = results1[7][0].emailId
            workingTime = ""
        }

        footerLink = [{
            facebookLink: facebookLink,
            twitterLink: twitterLink,
            googleLink: googleLink,
            privacyPolicy: privacyPolicy,
            AboutUs: AboutUs,
            mobileNumber: mobileNumber,
            emailId: emailId,
            appStoreUrl: appStoreUrl,
            playStoreUrl: playStoreUrl,
            workingTime: workingTime
        }]
        const responseData = {
            success: "1",
            footerLink: footerLink,
            successMessage: "Data fetched successfully.",
            errorMessage: ""
        }
        callback(responseData);
    });
};
module.exports = methods;