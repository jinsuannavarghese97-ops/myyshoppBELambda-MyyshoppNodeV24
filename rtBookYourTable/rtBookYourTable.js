let moment = require('moment-timezone');
let sendSms = require('./sendSms.js')
let aws = require("aws-sdk");
let nodemailer = require('nodemailer');
let ses = new aws.SES();
let s3 = new aws.S3();
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let bookYourTableData = [];
    let bookYourTableQuery
    let bookingDate = new Date(event.bookingDate)
    let bookingTime = moment(event.bookingTime).tz("Asia/Kolkata").format("HH:mm");
    let day = bookingDate.getDate() + "";
    let month = (bookingDate.getMonth() + 1) + "";
    let year = bookingDate.getFullYear() + "";
    bookingDate = year + "/" + month + "/" + day
    event.bookingDate = bookingDate
    event.bookingTime = bookingTime
    let createdBy = event.createdBy
    //let createdOn=event.createdOn
    let email = event.email
    let message = event.message
    let mobileNumber = event.mobileNumber
    let name = event.name
    let seatCount = event.seatCount
    let storeId = event.storeId
    //let bookTableStatus=event.bookTableStatus
    bookYourTableQuery = `
        INSERT INTO rt_book_table 
        (version, booking_date, booking_time, created_by, created_on, email, message, mobile_number, name, seat_count, store_id, rt_book_table_status_id)
        VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, '1');

        SELECT s.id, s.name AS storeName, sec.mobile_number AS mobileNumber, sec.email_id AS emailId,
        (SELECT config_value FROM configuration WHERE config_key = 'adminStoreDigEmail') AS bccMail
        FROM store AS s
        INNER JOIN sec_user AS sec ON sec.id = s.sec_user_id
        WHERE s.id = ?;
        `;

    const bookYourTableQueryParams = [
        0, bookingDate, bookingTime, createdBy, email, message, mobileNumber, name, seatCount, storeId, storeId
    ];
    queryExecution.queryExecution(client, jsonObj, event, bookYourTableQuery, bookYourTableQueryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let bookYourTableResults = response.result;
        event.storeName = bookYourTableResults[1][0].storeName
        event.storeEmail = bookYourTableResults[1][0].emailId
        event.message = " You have a request for booking a table from " + event.name + " mobile number " + event.mobileNumber + " on " + event.bookingDate + " " + event.bookingTime + " for " + event.seatCount + " people."
        let emailSubject = " Reservation for book a table "
        let EMAIL_TEXT = " Dear " + event.storeName + ",<br><br>" +
            " You have a request for booking a table from " + event.name + "<br>" +
            " Contact :" + mobileNumber + ".<br>" +
            " Booking Date :" + event.bookingDate + ".<br>" +
            " Booking Time :" + event.bookingTime + ".<br>" +
            " No Of Seats :" + event.seatCount + ".<br><br>" +
            " Thank you,<br>" +
            " Team MyyShopp<br>" +
            " Support@myyshopp.com<br>" +
            " <a href=https://www.facebook.com/gotomyy.shopp> Like us on FB </a> "

        let mailOptions = {
            from: "MyyShopp Support <suport@myyshopp.com>",
            subject: " Reservation for book a table ",
            html: EMAIL_TEXT,
            to: event.storeEmail,
            bcc: bookYourTableResults[1][0].bccMail,
            //cc: userResult[2][0].adminStoreDigEmail
        };
        let transporter = nodemailer.createTransport({
            SES: ses
        });

        // send email
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                const response = {
                    success: "1",
                    result: {},
                    errorMessage: "",
                    successMessage: ""
                };
                callback(null, response)
            }
            else {
                sendSms.sendSms(event, function (err, result) {
                    if (err) {
                        const response = {
                            success: "1",
                            result: {},
                            errorMessage: "",
                            successMessage: ""
                        };
                        callback(null, response)
                    }
                    else {
                        const response = {
                            success: "1",
                            result: {},
                            errorMessage: "",
                            successMessage: ""
                        };
                        callback(null, response)
                    }
                });
            };
        });
    });
};

module.exports = methods;
