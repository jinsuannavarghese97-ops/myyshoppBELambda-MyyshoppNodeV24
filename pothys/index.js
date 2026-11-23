const orderManagementMain = require('./orderManagement/orderManagementMain');
const orderManagementSub = require('./orderManagement/orderManagementSub');
const storeList = require('./orderManagement/storeList');
const orderSummary = require('./orderManagement/total');
const orderManagementSubnew = require('./orderManagement/orderManagementSub');
const saveOrderReview = require('./orderManagement/saveOrderReview');
const changeStatus = require('./orderManagement/changeStatus');
const ChangeOndcStatus = require('./orderManagement/ChangeOndcStatus');
const OndcIssueStatus = require('./orderManagement/OndcIssueStatus');
const ondcRaiseIssueReport = require('./orderManagement/ondcRaiseIssueReport');
const ondcUpdateCall = require('./orderManagement/ondcUpdateCall')
const ondcCustomerIssueReport = require('./orderManagement/ondcCustomerIssueReport')
const getCountLocationGroupType =require('./orderManagement/getCountLocationGroupType')
const decryptUrl = require('./orderManagement/decryptUrl.js')
const encryptUrl = require('./orderManagement/encryptUrl.js')
let queryExecution = require('../queryExecution');
const smsSettings = require('../smsSettings.js');
const methods = {};

methods.index = function(client, jsonObj, event, callback) {

    if (event.functionName == 'orderManagementMain') {
        orderManagementMain.orderManagementMain(client, jsonObj, event, queryExecution, function(response) {
            //console.log("response....orderManagementMain..", response)
            callback(response)
        });
    }
    else if (event.functionName == 'orderManagementSub') {
        orderManagementSub.orderManagementSub(client, jsonObj, event, queryExecution, function(response) {
            console.log("response....orderManagementSub..", response)
            callback(response)
        });
    }
    else if (event.functionName == 'storeList') {
        storeList.storeList(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'orderSummary') {
        orderManagementSub.orderManagementSub(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }

    else if (event.functionName == 'orderManagementSubnew') {
        orderManagementSubnew.orderManagementSubnew(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'saveOrderReview') {
        var orderReviewResults = event.orderReviewResults;
        saveOrderReview.saveOrderReview(client, jsonObj, event, orderReviewResults, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'changeStatus') {
        jsonObj.orderId = event.orderId;
        jsonObj.comments = event.comments;
        jsonObj.orderStatusId = event.orderStatusId;
        jsonObj.userId = event.userId
        jsonObj.ondcStatus = event.ondcStatus
         jsonObj.ondcCancellReasonId = event.ondcCancellReasonId
        // console.log("event....",event)
        changeStatus.changeStatus(client, jsonObj, event, queryExecution, smsSettings, function(response) {
            callback(response)
        });
    }
    
    else if (event.functionName == 'ChangeOndcStatus') {
        jsonObj.ondcFullfilmentStatusId = event.ondcFullfilmentStatusId;
        jsonObj.saleOrderItemId = event.saleOrderItemId;

        // console.log("event....",event)
        console.log("enter.....index")
        ChangeOndcStatus.ChangeOndcStatus(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'OndcIssueStatus') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        OndcIssueStatus.OndcIssueStatus(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
     else if (event.functionName == 'ondcRaiseIssueReport') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcRaiseIssueReport.ondcRaiseIssueReport(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
     else if (event.functionName == 'ondcRaiseIssueStatusUpdate') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcRaiseIssueReport.ondcRaiseIssueStatusUpdate(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'ondcRaiseIssueItemDetails') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcRaiseIssueReport.ondcRaiseIssueItemDetails(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
     else if (event.functionName == 'ondcIssuelog') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcRaiseIssueReport.ondcIssuelog(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'ondcUpdateCall') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcUpdateCall.ondcUpdateCall(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
       else if (event.functionName == 'cancelOndcItem') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcRaiseIssueReport.cancelOndcItem(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
    else if (event.functionName == 'ondcRaiseIssueCountSummeryReport') {
        jsonObj = event


        // console.log("event....",event)
        console.log("enter.....index")
        ondcRaiseIssueReport.ondcRaiseIssueCountSummeryReport(client, jsonObj, event, queryExecution, function(response) {
            callback(response)
        });
    }
     else if (event.functionName == 'ondcCustomerIssueReport') {
        jsonObj = event

        ondcCustomerIssueReport.ondcCustomerIssuesReport(client, jsonObj, event, queryExecution, function(response) {
            console.log("response....",response)
            callback(response)
        });
    }
    
    else if (event.functionName == 'getCountLocationGroupType') {
        jsonObj = event

        getCountLocationGroupType.getCountLocationGroupType(client, jsonObj, event, queryExecution, function(response) {
            console.log("response....",response)
            callback(response)
        });
    }
      else if (event.functionName == 'updateSaleOrderItemCancel') {
        jsonObj = event

        getCountLocationGroupType.updateSaleOrderItemCancel(client, jsonObj, event, queryExecution, function(response) {
            console.log("response....",response)
            callback(response)
        });
    }
    
       else if (event.functionName == 'decryptUrl') {
        jsonObj = event

        decryptUrl.decryptUrl(client, jsonObj, event, queryExecution, function(response) {
            console.log("response....",response)
            callback(response)
        });
    }
      else if (event.functionName == 'encryptUrl') {
        jsonObj = event

        encryptUrl.encryptUrl(client, jsonObj, event, queryExecution, function(response) {
            console.log("response....",response)
            callback(response)
        });
    }
    else {  
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data)
    }
};
module.exports = methods;
