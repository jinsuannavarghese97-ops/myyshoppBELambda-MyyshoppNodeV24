const queryExecution = require('../queryExecution');
let methods = {};


methods.subscriptionReport = function (client, jsonObj, event, callback) {
    let subQry = ""
    let subQryValues = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    if (event.cmbSelect == 'name') {
        subQry = subQry + " ssd.name like ? "
        subQryValues.push(removeQuotes("'" + event.searchKeyword + "%'"))
    }
    else if (event.cmbSelect == 'emailId') {
        subQry = subQry + " ssd.email_id like ? "
        subQryValues.push(removeQuotes("'" + event.searchKeyword + "%'"))
    }
    else if (event.cmbSelect == 'mobileNumber') {
        subQry = subQry + " ssd.mobile_number like ? "
        subQryValues.push(removeQuotes("'" + event.searchKeyword + "%'"))

    }
    if (event.fromDate && event.toDate) {
        subQry = subQry ? (subQry + " and (DATE(ssd.created_on) between ? and ?) ") : (subQry + " (ssd.created_on between ? and ?) ")
        subQryValues.push(event.fromDate, event.toDate)

    }
    else if (event.fromDate && !event.toDate) {
        subQry = subQry ? (subQry + " and DATE(ssd.created_on) >=? ") : (subQry + " DATE(ssd.created_on) >=? ")
        subQryValues.push(event.fromDate)

    }
    else if (!event.fromDate && event.toDate) {
        subQry = subQry ? (subQry + " and DATE(ssd.created_on) <= ? ") : (subQry + " DATE(ssd.created_on) <= ? ")
        subQryValues.push(event.toDate)

    }
    if (event.isApproved) {
        subQry = subQry ? (subQry + " and ssd.is_approved = ?") : (subQry + " ssd.is_approved = ?")
        subQryValues.push(event.isApproved)

    }
    if (event.paymentType) {
        subQry = subQry ? (subQry + " and if((srd.status is null),'Not Paid' ,if(srd.status = 'Captured','Paid','Pending')) = ?") : (subQry + " if((srd.status is null),'Not Paid' ,if(srd.status = 'Captured','Paid','Pending')) = ?")
        subQryValues.push(event.paymentType)

    }
    subQry = subQry ? " where " + subQry : ""
    let dQuery = " Select ssd.id as totalCount " +
        " from subscription_seller_details as ssd " +
        " left join subscription_razorpay_details as srd on ssd.id = srd.subscription_seller_details_id " +
        " left join subscription_plan_details as spd on spd.id = srd.subscription_plan_details_id " + subQry +
        " order by ssd.id desc; " +

        " select ssd.id as sellerDetailsId, if(srd.id is null,'',srd.id) as razorPayId, ssd.email_id as email, ssd.mobile_number as mobile, ssd.name as name, if(ssd.status is true,'1','0') as status, " +
        " date_format(ssd.created_on, '%d-%b-%Y') as dates, if((srd.status is null),'Not Paid' ,if(srd.status = 'Captured','Paid','Pending')) as paymentStatus, if(spd.id is null,'',spd.id) as planId, " +
        " if(spd.plan_amount is null,0,spd.plan_amount) as planAmount, if(ssd.is_approved is true,'1','0') as isApproved " +
        " from subscription_seller_details as ssd " +
        " left join subscription_razorpay_details as srd on ssd.id = srd.subscription_seller_details_id " +
        " left join subscription_plan_details as spd on spd.id = srd.subscription_plan_details_id " + subQry +
        " order by ssd.id desc " +
        " limit ?, ?;"
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [...subQryValues, ...subQryValues, parseInt(event.offset), parseInt(event.max)], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results[0].length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: results[1],
                count: results[0].length,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                count: 0,
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}

methods.subscriptionStatusChange = function (client, jsonObj, event, callback) {
    let dQuery = "update subscription_seller_details set is_approved = ? where id = ?;"
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.isApproved, event.sellerDetailsId], function (queryStringResult) {
        queryStringResult.result = []
        callback(queryStringResult);
    })
}


module.exports = methods;