const queryExecution = require('../queryExecution');
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const methods = {};

// Visitor enquiry -> e-mail to the seller. Called as functionName "common/sellerEnquiry" with
// { seller_id, firstname, lastname, emailid, message }. Same behaviour and response as the original
// /myshopp Lambda function (the seller's address is looked up from sec_user and the mail is sent through SES).
//
// Differences from the original, on purpose:
//  - the visitor's text is HTML-escaped before it goes into the mail body (it used to be inserted raw, so a
//    visitor could put their own HTML / links into an e-mail that comes from support@myyshopp.com)
//  - CR/LF are stripped from the subject (header injection)
//  - an unknown seller_id returns an error instead of crashing on result[0].email_id
//  - the SES client gets its region directly instead of through the global aws.config.update(), which would
//    change the default region of every other AWS client in this Lambda
const FROM_EMAIL = 'support@myyshopp.com';
const SES_REGION = 'ap-south-1';

const escapeHtml = (value) => String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const oneLine = (value) => String(value === undefined || value === null ? '' : value).replace(/[\r\n]+/g, ' ').trim();

methods.sellerEnquiry = function (client, event, callback) {
    const failure = {
        success: "0",
        successMessage: "",
        errorMessage: "Something went wrong"
    };
    const sellerQuery = 'SELECT email_id FROM sec_user where id = ? ';

    queryExecution.queryExecution(client, "", event, sellerQuery, [event.seller_id], function (dbResponse) {
        if (dbResponse.success == "0" || !dbResponse.result || dbResponse.result.length === 0 || !dbResponse.result[0].email_id) {
            return callback(failure);
        }

        const firstName = escapeHtml(event.firstname);
        const html = " Hi, <br><br>" +
            " You have an enquiry from " + firstName + ", please find the below details: <br><br> " +
            "<b>First Name</b> : " + firstName + " <br><br> " +
            " <b>Last Name</b> : " + escapeHtml(event.lastname) + " <br><br> " +
            " <b>Email</b> : " + escapeHtml(event.emailid) + " <br><br> " +
            " <b>Comment</b> : " + escapeHtml(event.message).replace(/\r?\n/g, '<br>') + " <br><br><br> " +
            " Thanks, <br> " +
            firstName;

        const mailOptions = {
            from: FROM_EMAIL,
            subject: "Enquiry from " + oneLine(event.firstname),
            html: html,
            to: String(dbResponse.result[0].email_id)
        };

        const transporter = nodemailer.createTransport({
            SES: new aws.SES({ region: SES_REGION })
        });
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return callback(failure);
            }
            return callback({
                success: "1",
                successMessage: "Success",
                errorMessage: ""
            });
        });
    });
};
module.exports = methods;
