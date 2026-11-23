const queryExecution = require('../queryExecution')
const methods = {};
let aws = require("aws-sdk");
let nodemailer = require('nodemailer');
let ses = new aws.SES();
let s3 = new aws.S3();
methods.sellerRegistrationSendMail = function (client, jsonObj, event, callback) {
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
        //console.log('results....1...', results)

        console.log('response....2...')
        let subscriptionSellerQuery = " SELECT ssd.email_id, ifnull(ssd.mobile_number,'') as mobile_number, ssd.name,ifnull(ssd.sales_person,'') as sales_person,ifnull(ssd.location,'') as location,ifnull(ssd.store_name,'') as store_name " +
            " from subscription_seller_details as ssd " +
            " where ssd.id = ?; "


        //    " SELECT email_id, mobile_number, name,sales_person,location,store_name from subscription_seller_details where id = " + event.subscriptionSellerDetailsId + ";"
        console.log('subscriptionSellerQuery.......', subscriptionSellerQuery)
        queryExecution.queryExecution(client, jsonObj, event, subscriptionSellerQuery, [event.subscriptionSellerDetailsId], function (response) {

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
                    "Sales Person : " + response.result[0].sales_person + "<br><br>" +
                    "Thank you!"
                console.log('response....6...', EMAIL_TEXT)
                console.log('results[3][0].config_value....', results[3][0].config_value)
                let mailOptions = {
                    from: results[3][0].config_value,
                    subject: 'Seller Registration Data Received',
                    html: EMAIL_TEXT,
                    to: results[3][0].config_value,
                    //bcc: detailsResult[4][0].bccStoreDigEmail,
                    cc: results[2][0].config_value
                };
                let transporter = nodemailer.createTransport({
                    SES: ses
                });
                console.log('response....7...')
                // send email
                transporter.sendMail(mailOptions, function (err, info) {

                });

                let EMAIL_TEXT1 = "Thank You for signing up on Lokal.<br><br>" +
                    "Our Customer Support Team will reach out to you to take your store online.<br><br>" +
                    "Have a great day!"
                console.log('response....8...', EMAIL_TEXT1)
                console.log('response....response.result[0].email_id...', response.result[0].email_id)
                let mailOptions1 = {
                    from: results[3][0].config_value,
                    subject: 'Seller Registration Data Received',
                    html: EMAIL_TEXT1,
                    to: response.result[0].email_id,
                    //bcc: detailsResult[4][0].bccStoreDigEmail,
                    // cc: results[2][0].config_value
                };
                let transporter1 = nodemailer.createTransport({
                    SES: ses
                });
                console.log('response....9...')
                // send email
                transporter1.sendMail(mailOptions1, function (err, info) {
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
                            successMessage: "Success",
                            errorMessage: ""
                        };
                        callback(response);
                    }
                });


            }
        });

    });

}
module.exports = methods;
