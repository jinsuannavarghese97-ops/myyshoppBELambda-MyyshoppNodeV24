const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
let aws = require("aws-sdk");
let nodemailer = require('nodemailer');
let ses = new aws.SES();
let s3 = new aws.S3();
methods.saveRazorPaymentDetails = function (client, jsonObj, event, callback) {
    if (event.timeZone) {
        let num = event.timeZone.slice(1);
        let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        event.timeZone = symbol + rhours + ':' + rminutes
        event.time = symbol + num
    }
    //console.log("event.time ",event.time)
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    let razorPayConfigQuery = " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeyid'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeysecret'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'SellerRegistrationCcEmail'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'adminStoreDigEmail'; "


    console.log('razorPayConfigQuery.......', razorPayConfigQuery)
    queryExecution.queryExecution(client, jsonObj, event, razorPayConfigQuery, [], function (response) {
        // console.log('response....1...',response)
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        console.log('results....1...', results)
        let razorKey
        let razorkeysecret
        razorKey = results[0][0].config_value;
        razorkeysecret = results[1][0].config_value
        console.log('response....2...')
        request({
            method: 'GET',
            url: "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/payments/" + event.paymentId
        },
            function (error, response, body) {
                //  console.log('response....3...',response)
                if (error) {
                    const response = {
                        success: "0",
                        successMessage: "",
                        errorMessage: "Something went wrong"
                    };
                    callback(response);
                }
                else {
                    console.log('response....4...')
                    let responseData = JSON.parse(body)
                    let saveRazorDetailsQuery = "INSERT INTO subscription_razorpay_details (amount,amount_refunded,contact,created_at,currency,description,email,entity,error_code,error_description,fee,method,paymentid,refund_status,service_tax,status,subscription_plan_details_id,subscription_seller_details_id) VALUES (?,?,?,CONVERT_TZ (now(), '+00:00',?),?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
                    console.log('saveRazorDetailsQuery....4...', saveRazorDetailsQuery)
                    queryExecution.queryExecution(client, jsonObj, event, saveRazorDetailsQuery, [responseData.amount, responseData.amount_refunded, responseData.contact, event.timeZone, responseData.currency, responseData.description, responseData.email, responseData.entity, responseData.error_code, responseData.error_description, responseData.fee, responseData.method, responseData.id, responseData.refund_status, responseData.tax, responseData.status, event.subscriptionPlanDetailsId, event.subscriptionSellerDetailsId], function (responses) {
                        console.log('responses.result.insertId....4...', responses.result.insertId)
                        responseData.paymentId = responses.result.insertId
                        if (responses.success == '0') {
                            callback(responses);
                        }
                        else {
                            let razorPayConfigQuery = " SELECT ssd.email_id, ssd.mobile_number, ssd.name,ssd.sales_person,ssd.location,ssd.store_name, srd.amount , spd.plan_name " +
                                " from subscription_seller_details as ssd " +
                                " inner join subscription_razorpay_details as srd on ssd.id = srd.subscription_seller_details_id " +
                                " inner join subscription_plan_details as spd on spd.id = srd.subscription_plan_details_id " +
                                " where ssd.id = ?; "


                            //    " SELECT email_id, mobile_number, name,sales_person,location,store_name from subscription_seller_details where id = " + event.subscriptionSellerDetailsId + ";"
                            console.log('razorPayConfigQuery.......', razorPayConfigQuery)
                            queryExecution.queryExecution(client, jsonObj, event, razorPayConfigQuery, [event.subscriptionSellerDetailsId], function (response) {

                                if (response.success == '0') {
                                    callback(response);
                                }
                                else {
                                    console.log('response....5...')
                                    let EMAIL_TEXT = "Hi ,<br><br>" +
                                        "Name : " + response.result[0].name + "<br>" +
                                        "Contact Number : " + response.result[0].mobile_number + "<br>" +
                                        "Email ID : " + response.result[0].email_id + "<br>" +
                                        "Store Name : " + response.result[0].store_name + "<br>" +
                                        "Location : " + response.result[0].location + "<br>" +
                                        "Sales Person : " + response.result[0].sales_person + "<br>" +
                                        "<b>Plan Amount : " + parseFloat(response.result[0].amount / 100).toFixed(2) + "</b><br>" +
                                        "<b>Plan Option : </b><br>" + response.result[0].plan_name + "<br><br>" +
                                        "Thank you!"
                                    console.log('response....6...')
                                    let mailOptions = {
                                        from: results[3][0].config_value,
                                        subject: 'Seller Registration Payment Received',
                                        html: EMAIL_TEXT,
                                        to: results[3][0].config_value,
                                        //bcc: detailsResult[4][0].bccStoreDigEmail,
                                        cc: results[2][0].config_value
                                    };
                                    /*let transporter = nodemailer.createTransport({
                                        SES: ses
                                    });
                                    console.log('response....6...')
                                    // send email
                                    transporter.sendMail(mailOptions, function(err, info) {

                                    });*/

                                    let EMAIL_TEXT1 = "Thank You for signing up on Lokal.<br><br>" +
                                        "We have received the subscription fee of INR " + parseFloat(response.result[0].amount / 100).toFixed(2) + ", and our Customer Support Team will reach out to you to take your store online.<br><br>" +
                                        "Have a great day!"
                                    console.log('response....6...')
                                    let mailOptions1 = {
                                        from: results[3][0].config_value,
                                        subject: 'Seller Registration Payment Received',
                                        html: EMAIL_TEXT1,
                                        to: response.result[0].email_id,
                                        //bcc: detailsResult[4][0].bccStoreDigEmail,
                                        // cc: results[2][0].config_value
                                    };
                                    /*let transporter1 = nodemailer.createTransport({
                                        SES: ses
                                    });*/
                                    console.log('response....6...')
                                    // send email
                                    /*transporter1.sendMail(mailOptions1, function(err, info) {
                                        if (err) {
                                            const response = {
                                                success: "0",
                                                errorMessage: err,
                                                successMessage: "Email not sent ",
                                            };
                                            callback(response);
                                        }
                                        else {*/
                                    const response1 = {
                                        success: "1",
                                        razorPayData: responseData,
                                        mailOptions: mailOptions,
                                        mailOptions1: mailOptions1,
                                        successMessage: "Success",
                                        errorMessage: ""
                                    };
                                    callback(response1);




                                }
                            });
                        }
                    });
                }
            });
    });

}



methods.sendMailRazorPaymentDetails = function (client, jsonObj, event, callback) {

    let transporter = nodemailer.createTransport({
        SES: ses
    });
    console.log('response....6...')
    // send email
    transporter.sendMail(event.mailOptions, function (err, info) {

    });
    let transporter1 = nodemailer.createTransport({
        SES: ses
    });
    transporter1.sendMail(event.mailOptions1, function (err, info) {
        if (err) {
            const response = {
                success: "0",
                errorMessage: err,
                successMessage: "Email not sent ",
            };
            callback(response);
        }
        else {
            const response = {
                success: "1",
                //razorPayData: responseData,
                successMessage: "Mail Send Successfully",
                errorMessage: ""
            };
            callback(response);
        }
    });

}
module.exports = methods;
