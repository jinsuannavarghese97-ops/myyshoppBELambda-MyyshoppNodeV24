let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
let crypto = require('crypto');
const encryptUrl = require('../pothys/orderManagement/encryptUrl.js')

methods.getBuyerOrder = function (client, jsonObj, event, callback) {

    let pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { let bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    });
    pool.getConnection(function (err, connection) {
        let wquery = " ";
        let wqueryParams = [];
        let textId = jsonObj.textId
        let orderId = jsonObj.orderId
        let fromDateQuery = jsonObj.fromDateQuery
        let toDateQuery = jsonObj.toDateQuery
        let statusQuery = jsonObj.statusQuery
        let currentUserId = jsonObj.currentUserId
        let cmbselect = jsonObj.cmbselect;
        let txtInputId = jsonObj.txtInputId;
        let cmbstatus = jsonObj.cmbstatus;
        if (cmbselect != "" && cmbselect != null && cmbselect != "0") {
            if (cmbselect == "id") {
                //console.log("we,,,,,,,,"+cmbselect)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "
                wquery = wquery + " and so.id like ?"
                wqueryParams.push(txtInputId + "%");
                //console.log("wquery.nnn..."+wquery)

            }
            if (cmbselect == "name") {
                wquery = wquery + " and st.name like ? "
                wqueryParams.push(txtInputId + "%");
                //	wquery=	wquery+ " and so.id =" + txtInputId 
                //console.log("txt...2."+txtInputId)
                //console.log("2m....."+wquery)
            }


        }

        if (cmbstatus != "" && cmbstatus != null && cmbstatus != "0") {
            if (cmbstatus == "1") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }

            if (cmbstatus == "2") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                console.log("wquery.nncmbstatusn..." + wquery)

            }
            if (cmbstatus == "3") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }
            if (cmbstatus == "4") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }
            if (cmbstatus == "5") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }
            if (cmbstatus == "6") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }
            if (cmbstatus == "8") {
                //console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }
            if (cmbstatus == "9") {
                // console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }
            if (cmbstatus == "10") {
                // console.log("we,,,,,nnnn,,,"+cmbstatus)
                //wquery = wquery+ " and st.name like '" + txtInputId + "%' "

                wquery = wquery + " and os.id = ? "
                wqueryParams.push(cmbstatus);
                //wquery= wquery +" and os.name like '" +statusQuery+"%'"
                //console.log("wquery.nncmbstatusn..."+wquery)

            }

        }

        if (fromDateQuery != "" && fromDateQuery != null) {
            //console.log("fromDateQuery")
            wquery = wquery + " and date(s.sale_date) =? "
            wqueryParams.push(fromDateQuery);
        }
        if (toDateQuery != "" && toDateQuery != null) {
            //console.log("toDateQuery")
            wquery = wquery + " and date(s.sale_date)= ? "
            wqueryParams.push(toDateQuery);
        }
        if (fromDateQuery != "" && fromDateQuery != null && toDateQuery != "" && toDateQuery != null) {
            wquery = wquery + " and date(s.sale_date) between ? and ? ";
            wqueryParams.push(fromDateQuery, toDateQuery);
        }

        let orderData = [];
        let orderReportQuery = " select mc.main_group_category_id as mainCategoryGroupId,c.symbol AS currencySymbol,so.id as orderId,os.id as statusId,so.main_category_id as mainCategoryId, date_format(s.sale_date, '%d %M %Y') as orderDate," +
            " st.name as storeName,st.locality as locality,os.name as orderStatus, so.gross_amount as orderAmount,s.buyer_id as buyerId,if(st.`is_myyshopp_invoice` is true,'1','0') as isMyyshoppInvoice, " +
            " (select date_format(status_date, '%d %M %Y') from sale_order_status where sale_order_id = orderId  and is_current_status is true limit 1) as deliveredDate,if(st.logo_path is null,'default.jpg',st.logo_path) AS storeLogoPath " +
            " from sale_order as so  " +
            " inner join main_category as mc on mc.id = so.main_category_id " +
            "  inner join sale as s ON s.id = so.sale_id " +
            " inner join store as st ON st.id = so.store_id " +
            " INNER JOIN currency AS c ON c.id = st.`currency_id` " +
            " inner join  sale_order_status as sos ON so.id = sos.sale_order_id " +
            " inner join  order_status as os ON os.id = sos.order_status_id and sos.is_current_status is true " +
            " where s.is_active = true " +
            " and s.is_draft = false " +
            " and s.buyer_id = ? " +
            " and sos.is_current_status = true " + wquery +
            " group by so.id " +
            " ORDER BY s.created_on desc; " +
            " SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'; " +
            " SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'; " +
            " SELECT config_value FROM configuration WHERE config_key = 's3Address'; " +
            " SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'; " +
            " SELECT config_value FROM configuration WHERE config_key = 'siteCategoryLogoPath'; " +
            " SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder';"
        //connection.query(orderReportQuery, function (error, orderResults, fields) {
        console.log("orderReportQuery....", orderReportQuery)
        queryExecution.queryExecution(client, jsonObj, event, orderReportQuery, [currentUserId, ...wqueryParams], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let orderResults = response.result;
            //  console.log("orderResults.....", orderResults)
            let imagePath = orderResults[3][0].config_value + '/' + orderResults[4][0].config_value + '/' + orderResults[2][0].config_value + '/' + orderResults[6][0].config_value + '/'
            let loginKeyQuery = `SELECT config_value AS loginKey FROM configuration where config_key = 'loginKey' ;`
            queryExecution.queryExecution(client, jsonObj, event, loginKeyQuery,[], function (response) {
                console.log("response....loginKeyQuery..", response)
                if (response.success == '0') {
                    console.log("222222")
                    callback(response);
                }
                let key = response.result[0].loginKey;
                let algorithm = 'aes256';

                for (let i = 0; i < orderResults[0].length; i++) {
                    let orderDetails = [];
                    let cipher = crypto.createCipher(algorithm, key);
                    let encryptedorderId = cipher.update(orderResults[0][i].orderId.toString(), 'utf8', 'hex') + cipher.final('hex');
                    //    console.log("----------------orderResults[0][i].orderId----", orderResults[0][i].orderId)
                    // encryptUrl.encryptUrl(client, jsonObj, orderIdParams, queryExecution, event, function(data) {

                    // console.log("data----", data)
                    orderDetails = {
                        mainCategoryGroupId: orderResults[0][i].mainCategoryGroupId,
                        storeLogoPath: imagePath + orderResults[0][i].storeLogoPath,
                        orderNumber: orderResults[0][i].orderId,
                        storeName: orderResults[0][i].storeName,
                        orderDate: orderResults[0][i].orderDate,
                        isMyyshoppInvoice: orderResults[0][i].isMyyshoppInvoice,
                        deliveryDate: orderResults[0][i].deliveredDate,
                        orderStatus: orderResults[0][i].orderStatus,
                        amount: parseFloat(orderResults[0][i].orderAmount).toFixed(2),
                        encryptedorderId: encryptedorderId,
                        currencySymbol: orderResults[0][i].currencySymbol
                    }
                    //  orderDetails.encryptedOrderId = data
                    orderData.push(orderDetails)
                    //  })

                }
                console.log('orderData......', orderData)
                const data = {
                    success: "1",
                    result: {
                        "getBuyerOrder": orderData
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(data)
            })
        })
    })
}
module.exports = methods;
