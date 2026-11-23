const aws = require("aws-sdk");
const nodemailer = require('nodemailer');
const ses = new aws.SES();
const s3 = new aws.S3();
const queryExecution = require('../queryExecution');
const methods = {};
methods.enquiryMail = function(client, jsonObj,event, callback) {
    let configQry = " SELECT  ( " + "select c.config_value as configValue " +
        " from configuration as c " +
        " where c.config_key = 'emailUserName' " + ") AS emailUserName "
    queryExecution.queryExecution(client, jsonObj, event, configQry,[], function(queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        let emailUserName = 'MyyShopp Support <' + results[0].emailUserName + '>'
        let messageText = "Hi , <br><br>" +
                        " Name : " + event.name + " <br>"+
                        " Contact Number : " + event.contactNumber + " <br>"+
                        " Email ID : " + event.emailId + " <br><br>"+
                        " Thank you,<br>" 
                            
        let mailOptions = {
            from: emailUserName,
            subject: "Seller registration enquiry.",
            html: messageText,
            to:emailUserName
        };
        var transporter = nodemailer.createTransport({
            SES: ses
        });

        // send email
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                const response = {
                    success: "0",
                    errorMessage: err,
                    successMessage: "Email not sent ",
                };
                callback(response);
            } else {
                const response = {
                    success: "1",
                    errorMessage: "",
                    successMessage: "Email sent successfully",
                };
                callback(response);
            }
        });
    })

}
module.exports = methods;