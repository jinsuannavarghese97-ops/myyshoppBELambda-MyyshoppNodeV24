var mysql = require('mysql');
var request = require("request");
//var smsSettings = require('./smsSettings.js');
const smsSettings = require('../smsSettings.js');
var methods = {};
let queryExecution = require('../queryExecution');
methods.sms = function (client, jsonObj, event, callback) {
	console.log('jsonObj...123..', jsonObj)
	var url;
	var smsSender;
	var message
	var siteUrl;
	var site;
	var randomInt = Math.floor((Math.random() * 1000000) + 1);
	var date = new Date();
	var createdOn = Date.parse(date);
	var mobileNumber = jsonObj.mobileNumber
	var siteId = jsonObj.siteId;
	var mysqlTimestamp = new Date();
	var type = jsonObj.type
	var otp = jsonObj.otp
	jsonObj.randomInt = randomInt
	event.randomInt = randomInt
	if (otp == "" || otp == null || otp == 'null') {
		console.log(" enter.....if")
		if (type == "Forgot Password") {
			event.smsEmailType = 11
			message = "OTP is " + randomInt + " for Forgot Password. Please enter the OTP to complete the process."
		} else if (type == "SignUp") {
			event.smsEmailType = 10
			message = "OTP is " + randomInt + " for registration. Please enter the OTP to complete the process."
		} else {
			event.smsEmailType = 9
			message = "OTP is " + randomInt + " for login. Do not share the OTP with anyone for security reasons."
		}
		event.mobileNumber = jsonObj.mobileNumber
		event.siteId = jsonObj.siteId
		var queryString = "SELECT  ( " +
			"select c.config_value as configValue " +
			"from configuration as c " +
			"where c.config_key = 'smsLoginName' " +
			") AS smsLoginName, " +
			"( " +
			"select c.config_value as configValue " +
			"from configuration as c " +
			"where c.config_key = 'smsApiPassword' " +
			") AS smsApiPassword, " +
			"( " +
			"select c.config_value as configValue " +
			"from configuration as c " +
			"where c.config_key = 'smsSender' " +
			") AS smsSender "
        console.log("...queryString....",queryString)
		queryExecution.queryExecution(client, jsonObj, event, queryString,[], function (response) {
			if (response.success == '0') {
				callback(response);
			}
			let results = response.result;
			if (!siteId) {
				smsSender = results.length > 0 ? results[0].smsSender : ""

				if (mobileNumber) {
					console.log("mobileNumber............", mobileNumber)
					var userExist = "SELECT * FROM `sec_user` WHERE `mobile_number` = ?"
					queryExecution.queryExecution(client, jsonObj, event, userExist,  [jsonObj.mobileNumber], function (response) {
					console.log("....response...",response)
						if (response.success == '0') {
							callback(response);
						}
						let userExistData = response.result;
						if (userExistData.length > 0) {
							console.log("1.....",userExistData)
							//	event.userId=userExist[0].id
							var otpExistQuery = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
								" where usrMobOtp.mobile_number = ? "
							console.log("otpExistQuery........", otpExistQuery)
							queryExecution.queryExecution(client, jsonObj, event, otpExistQuery,  [jsonObj.mobileNumber], function (response) {
								if (response.success == '0') {
									callback(response);
								}
								let mobileExistData = response.result;
								console.log("......mobileExistData.....",mobileExistData)
								if (mobileExistData.length > 0) {
									var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
									console.log("sqlUpdate........", sqlUpdate)
									queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
										if (response.success == '0') {
											callback(response);
										}
										let sqlUpdateResult = response.result;

										smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
											callback(response)
										});

									});
								} else {
									var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
									queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [mysqlTimestamp, mobileNumber, randomInt], function (response) {
										if (response.success == '0') {
											callback(response);
										}
										let sqlInsertData = response.result;

										smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
											callback(response)
										});


									});
								}
							});

						} else {

							if (type == "SignUp") {
								console.log("enter..........signUp")
								var otpExistQuery = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
									" where usrMobOtp.mobile_number = ? ";
								queryExecution.queryExecution(client, jsonObj, event, otpExistQuery,  [jsonObj.mobileNumber], function (response) {
									if (response.success == '0') {
										callback(response);
									}
									let mobileExistData = response.result;
									if (mobileExistData.length > 0) {
										var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
										queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
											if (response.success == '0') {
												callback(response);
											}
											let sqlUpdateResult = response.result;

											smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
												callback(response)
											});

										});
									} else {
										var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
										queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [mysqlTimestamp, mobileNumber, randomInt], function (response) {
											if (response.success == '0') {
												callback(response);
											}
											let sqlInsertData = response.result;

											smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
												callback(response)
											});


										});
									}
								});


							} else {
								const response = {
									success: "0",
									errorMessage: "InValid",
									successMessage: ""
								};
								callback(response);

							}
						}
					});
				}
			} else {
				var queryString1 = " select s.site_url as siteUrl, s.seller_id as sellerId,s.site_category_group as siteCategoryGroup " +
					" from site as s " +
					" where s.id = ? ";
				console.log("queryString1.........", queryString1)
				queryExecution.queryExecution(client, jsonObj, event, queryString1,  [siteId], function (response) {
					console.log("response.....", response)
					if (response.success == '0') {
						callback(response);
					}
					let results1 = response.result;
					//	console.log("results1.....",results1)
					if (0 != results1[0].sellerId && null != results1[0].sellerId) {
						var queryString2 = " select sl.id as sellerId, ssd.sms_sender as smsSender " +
							" from seller as sl " +
							" inner join store as st ON st.seller_id = sl.id " +
							" inner join store_sms_details as ssd ON ssd.store_id = st.id " +
							" where sl.id = ?";
						queryExecution.queryExecution(client, jsonObj, event, queryString2,  [results1[0].sellerId], function (response) {
							if (response.success == '0') {
								callback(response);
							}
							let results2 = response.result;
							smsSender = results2.length > 0 ? results2[0].smsSender : ""

							if (mobileNumber) {
								var userExist = `
									SELECT b.id AS buyerId 
									FROM buyer AS b 
									INNER JOIN sec_user AS secUsr ON secUsr.id = b.id  
									WHERE secUsr.mobile_number = ? AND secUsr.site_id = ?;

									SELECT 
										si.id AS siteSellerId,
										slr.first_name AS firstName,
										slr.last_name AS lastName,
										su.display_name AS displayName,
										su.id AS userId,
										su.email_id AS emailId,
										su.mobile_number AS mobileNumber, 
										(SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL 
									FROM seller AS slr 
									INNER JOIN sec_user AS su ON su.id = slr.id 
									INNER JOIN site AS si ON si.seller_id = slr.id 
									WHERE su.mobile_number = ? AND si.id = ?;

									SELECT 
										si.id AS siteStoreId,
										su.display_name AS displayName,
										su.id AS userId,
										su.email_id AS emailId,
										su.mobile_number AS mobileNumber,  
										(SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL  
									FROM store AS s 
									INNER JOIN sec_user AS su ON su.id = s.sec_user_id 
									INNER JOIN seller AS sl ON sl.id = s.seller_id 
									INNER JOIN site AS si ON si.seller_id = sl.id  
									WHERE su.mobile_number = ? AND si.id = ?;
								`;

								var userExistParams = [
									jsonObj.mobileNumber, siteId,
									jsonObj.mobileNumber, siteId,
									jsonObj.mobileNumber, siteId
								];

								console.log("userExist........", userExist)
								queryExecution.queryExecution(client, jsonObj, event, userExist,  userExistParams, function (response) {
									if (response.success == '0') {
										callback(response);
									}
									let userExistData = response.result;
										console.log("userExistData........",userExistData)
									if (userExistData[0].length > 0 || userExistData[1].length || userExistData[2].length) {
										if(userExistData[0].length > 0){
											event.userId=userExistData[0][0].buyerId
										}
										else if(userExistData[1].length>0)
										{
										event.userId=userExistData[1][0].userId	
										}
											else if(userExistData[2].length>0)
										{
										event.userId=userExistData[2][0].userId	
										}
											console.log("buyerrrrrrrrrid....",event.userId)
										var mobileExistSite = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
											" where usrMobOtp.mobile_number = ? "
										queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,  [jsonObj.mobileNumber], function (response) {
											if (response.success == '0') {
												callback(response);
											}
											let mobileExistData = response.result;
											if (mobileExistData.length > 0) {
												var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
												queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
													if (response.success == '0') {
														callback(response);
													}
													let sqlUpdateResult = response.result;

													smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
														callback(response)
													});

												});
											} else {
												var mobileExistSite = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
													" where usrMobOtp.mobile_number = ? ";
												queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,  [jsonObj.mobileNumber], function (response) {
													if (response.success == '0') {
														callback(response);
													}
													let mobileExistData = response.result;
													if (mobileExistData.length > 0) {
														var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
														queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
															if (response.success == '0') {
																callback(response);
															}
															let sqlUpdateResult = response.result;

															smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
																callback(response)
															});

														});
													} else {
														var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
														queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [createdOn, mobileNumber, randomInt], function (response) {
															if (response.success == '0') {
																callback(response);
															}
															let sqlInsertData = response.result;
															smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
																callback(response)
															});

														});
													}
												});
											}
										});

									} else {
										console.log('else..q...')
										if (type == "SignUp") {
											var mobileExistSite = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
												" where usrMobOtp.mobile_number = ? ";
											queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,  [jsonObj.mobileNumber], function (response) {
												if (response.success == '0') {
													callback(response);
												}
												let mobileExistData = response.result;
												if (mobileExistData.length > 0) {
													var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
													queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
														if (response.success == '0') {
															callback(response);
														}
														let sqlUpdateResult = response.result;
														smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
															callback(response)
														});

													});
												} else {
													var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
													queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [createdOn, mobileNumber, randomInt], function (response) {
														if (response.success == '0') {
															callback(response);
														}
														let sqlInsertData = response.result;

														smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
															callback(response)
														});

													});
												}
											});


										} else {
											const response = {
												success: "0",
												errorMessage: "Invalid",
												successMessage: ""
											};
											callback(response);

										}
									}
								});
							}
						});
					} else if (0 != results1[0].siteCategoryGroup && null != results1[0].siteCategoryGroup) {
						var myCategoryQuery = " select s.site_url as siteUrl, s.seller_id as sellerId,s.site_category_group as siteCategoryGroup " +
							" from site as s " +
							" where s.id = ? "

						queryExecution.queryExecution(client, jsonObj, event, myCategoryQuery,  [siteId], function (response) {
							if (response.success == '0') {
								callback(response);
							}
							let myCategoryResult = response.result;

							smsSender = myCategoryResult.length > 0 ? myCategoryResult[0].smsSender : ""

							if (mobileNumber) {

								var userExist = "SELECT * FROM `sec_user` WHERE `mobile_number` = ? and site_id= ?";
							
								queryExecution.queryExecution(client, jsonObj, event, userExist,  [jsonObj.mobileNumber, siteId], function (response) {
									if (response.success == '0') {
										callback(response);
									}
									let userExistData = response.result;

									if (userExistData.length > 0) {
											event.userId=userExistData[0].id
										var mobileExistSite = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
											" where usrMobOtp.mobile_number = ? "

										queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,  [jsonObj.mobileNumber], function (response) {
											if (response.success == '0') {
												callback(response);
											}
											let mobileExistData = response.result;

											if (mobileExistData.length > 0) {
												var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?"
												queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
													if (response.success == '0') {
														callback(response);
													}
													let sqlUpdateResult = response.result;

													smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
														callback(response)
													});

												});
											} else {
												var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
												queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [createdOn, mobileNumber, randomInt], function (response) {
													if (response.success == '0') {
														callback(response);
													}
													let sqlInsertData = response.result;
													smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
														callback(response)
													});

												});
											}
										});
									} else {
										if (type == "SignUp") {
											var mobileExistSite = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
												" where usrMobOtp.mobile_number = ? ";
											queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,  [jsonObj.mobileNumber], function (response) {
												if (response.success == '0') {
													callback(response);
												}
												let mobileExistData = response.result;
												if (mobileExistData.length > 0) {
													var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
													//connection.query(sqlUpdate, [randomInt, jsonObj.mobileNumber], function(err, sqlUpdateResult) {
													queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, jsonObj.mobileNumber], function (response) {
														if (response.success == '0') {
															callback(response);
														}
														let sqlUpdateResult = response.result;
														smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
															callback(response)
														});

													});
												} else {
													var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
													queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [createdOn, mobileNumber, randomInt], function (response) {
														if (response.success == '0') {
															callback(response);
														}
														let sqlInsertData = response.result;
														smsSettings.smsSettings(client, jsonObj, event, queryExecution, function (response) {
															callback(response)
														});

													});
												}
											});
										} else {
											const response = {
												success: "0",
												errorMessage: "Invalid ",
												successMessage: ""
											};
											callback(response);

										}
									}
								});
							}
						});
					}
				});
			}
		})
	} else {
		var otpQuery = "SELECT mobile_number FROM `user_mobile_otp` WHERE `mobile_number` = ? AND `otp` = ?";
		console.log('otpQuery....', otpQuery)
		queryExecution.queryExecution(client, jsonObj, event, otpQuery,  [mobileNumber, jsonObj.otp], function (response) {
			if (response.success == '0') {
				callback(response);
			}
			let otpData = response.result;
			console.log("....otpData....",otpData)
			if (otpData.length > 0) {
				var buyerSite = " Select su.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
					" from buyer as b " +
					" Inner join sec_user as su on su.id = b.id " +
					" where su.mobile_number = ? and su.site_id = ?;" +
					" Select si.id as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
					" (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL " +
					" from seller as slr " +
					" inner join sec_user as su on su.id = slr.id " +
					" Inner join site as si on si.seller_id = slr.id " +
					" WHERE su.mobile_number = ? AND si.id = ?;" +
					" SELECT si.id AS siteStoreId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL  " +
					" FROM store AS s " +
					" INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
					" INNER JOIN seller AS sl ON sl.id = s.seller_id " +
					" INNER JOIN site AS si ON si.seller_id = sl.id  " +
					" WHERE su.mobile_number = ? AND si.id = ?;"
				const buyerSiteParams = [otpData[0].mobile_number, siteId, otpData[0].mobile_number, siteId, otpData[0].mobile_number, siteId];
				console.log("..buyerSite...",buyerSite,buyerSiteParams)
				queryExecution.queryExecution(client, jsonObj, event, buyerSite,buyerSiteParams, function (response) {
				console.log("..response...",response)
					if (response.success == '0') {
						callback(response);
					}
					let result3 = response.result;
					var userData = []
					if (result3[1].length > 0) {
						let data = result3[1][0].userId + '-ROLE_SELLER-' + siteId;
						let buff = new Buffer(data);
						let base64data = buff.toString('base64');
						userData[0] = {
							userId: result3[1][0].userId,
							firstName: result3[1][0].firstName,
							lastName: result3[1][0].lastName,
							displayName: result3[1][0].displayName,
							emailId: result3[1][0].emailId,
							mobileNumber: result3[1][0].mobileNumber,
							otpFlag: "true",
							redirectUrl: result3[1][0].redirectURL + '?token=' + base64data,
							isBuyer: '0',
							role: "ROLE_SELLER"
						}
						const response = {
							success: "1",
							result: {
								userData: userData
							},
							errorMessage: "",
							successMessage: "Sucess"
						};
						callback(response);
					} else if (result3[2].length > 0) {
						let data = result3[2][0].userId + '-ROLE_STORE-' + siteId;
						let buff = new Buffer(data);
						let base64data = buff.toString('base64');
						userData[0] = {
							userId: result3[2][0].userId,
							firstName: result3[2][0].displayName,
							lastName: '',
							displayName: result3[2][0].displayName,
							emailId: result3[2][0].emailId,
							mobileNumber: result3[2][0].mobileNumber,
							otpFlag: "true",
							redirectUrl: result3[2][0].redirectURL + '?token=' + base64data,
							isBuyer: '0',
							role: "ROLE_STORE"
						}
						const response = {
							success: "1",
							result: {
								userData: userData
							},
							errorMessage: "",
							successMessage: "Sucess"
						};
						callback(response);
					} else if (result3[0].length > 0) {
						userData[0] = {
							userId: result3[0][0].userId,
							firstName: result3[0][0].firstName,
							lastName: result3[0][0].lastName,
							displayName: result3[0][0].displayName,
							emailId: result3[0][0].emailId,
							mobileNumber: result3[0][0].mobileNumber,
							redirectUrl: '',
							isBuyer: '1',
							role: "ROLE_BUYER",
							otpFlag: "true"
						}
						const response = {
							success: "1",
							result: {
								userData: userData
							},
							errorMessage: "",
							successMessage: "Sucess"
						};
						callback(response);

					} else {
						userData[0] = {
							userId: "",
							firstName: "",
							lastName: "",
							displayName: "",
							emailId: "",
							mobileNumber: "",
							otpFlag: "true"
						}
						const response = {
							success: "1",
							result: {
								userData: userData
							},
							errorMessage: "",
							successMessage: "Sucess"
						};
						callback(response);

					}

				});
			} else {
				const response = {
					success: "0",
					errorMessage: "Invalid OTP.",
					successMessage: ""
				};
				callback(response);

			}
		});
	}
}
module.exports = methods;