let mysql = require('mysql');
let methods = {};
methods.ondcCustomerIssuesReport = function (client, jsonObj, event, queryExecution, callback) {
    let whereQry = "";
    let whereQryParams = [];
    let storeQry = "";
    let storeQryParams = [];
    let limitQry = "";
    let limitQryParams = [];
    if (event.searchText) {
        whereQry = " where igm.ondc_order_number like ?";
        whereQryParams.push("%" + event.searchText + "%");
    }
    if (event.storeId) {
        if (whereQry) {
            whereQry = whereQry + " and so.store_id = ? ";
            whereQryParams.push(event.storeId);
        }
        else {
            storeQry = " where so.store_id = ? ";
            storeQryParams.push(event.storeId);
        }
    }
    if (event.max) {
        limitQry = " limit ?,? ";
        limitQryParams.push(parseInt(event.offset), parseInt(event.max));
    }

    let orderQry = " ORDER BY FROM_UNIXTIME(FLOOR(igm.created_on / 1000)) + INTERVAL (igm.created_on % 1000) MICROSECOND DESC "

    console.log("enter ....................")
    let queryString = " select igm.id as igmId,igm.ondc_issue_id as IssueId,igm.ondc_order_number as ondcOrderNumber,igm.ondc_issue_json as issueJson, " +
        " igm.created_on AS ticketCreationDateTime,igm.issue_status_id as issueStatusId ,so.id as saleOrderId,oic.category,ois.sub_category_name as subcategoryName ,igm.modified_on,igm.closure_on " +
        " from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id " + whereQry + storeQry + " group by igm.ondc_issue_id " + orderQry + limitQry + ";"

    let countQry = " select count(*) as totalCount from (select igm.id from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id " + whereQry + storeQry + " group by igm.ondc_issue_id " + orderQry + " ) as a"
    console.log("queryString......", queryString);
    const params = [...whereQryParams, ...storeQryParams, ...limitQryParams, ...whereQryParams, ...storeQryParams];
    queryExecution.queryExecution(client, jsonObj, event, queryString + countQry, params, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result[0];
        let countResults = response.result[1];
        // console.log("countResults........", countResults)
        let issueListing = [];
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let ticketId = ""
                let buyerNpName = ""
                let sellerNpName = ""
                let orderCategory = "Grocery"
                /////////////////////////////////////
                let logisticsNpName = ""
                let ticketStatus = ""
                let ticketRelayDateTime = ""
                ////////////////////////////////////////
                if (results[i].issueJson) {
                    let issueJson = JSON.parse(results[i].issueJson);
                    ticketId = issueJson.message.issue.id
                    buyerNpName = issueJson.context.bap_id
                    sellerNpName = issueJson.context.bpp_id
                }

                let issueObjectList = {
                    igmId: results[i].igmId,
                    ticketId: ticketId,
                    networkOrderId: results[i].ondcOrderNumber,
                    orderId: results[i].saleOrderId,
                    buyerNpName: buyerNpName,
                    sellerNpName: sellerNpName,
                    ticketCreationDateTime: results[i].ticketCreationDateTime,
                    issueJson: JSON.parse(results[i].issueJson),
                    issueStatusId: results[i].issueStatusId,
                    issueCategory: results[i].category,
                    issueSubCategory: results[i].subcategoryName,
                    logisticsNpName: logisticsNpName,
                    orderCategory: orderCategory,
                    ticketStatus: ticketStatus,
                    ticketClosureDateTime: results[i].closure_on ? results[i].closure_on : '',
                    ticketRelayDateTim: ticketRelayDateTime,
                    ticketLastUpdateDateTime: results[i].modified_on ? results[i].modified_on : '',
                }
                issueListing.push(issueObjectList)
            }
        }

        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "results": issueListing,
            "count": countResults[0].totalCount,
            "errorMessage": ""
        }
        callback(responseData)
    });
}



module.exports = methods;
