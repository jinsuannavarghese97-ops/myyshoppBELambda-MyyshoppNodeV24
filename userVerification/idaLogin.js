const jwt = require('jsonwebtoken');
const request = require("request");
let methods = {};
let queryExecution = require('../queryExecution');
methods.idaLogin = function (client, jsonObj, event, callback) {
	let decoded = jwt.decode(event.token, {
		complete: true
	});
	let userDetails = {
	    username: decoded.payload.username,
        password: decoded.payload.password
	}
	//decoded = event;
    let username = Math.floor((Math.random() * 1000000) + 1);
	let customerNumber = Math.floor((Math.random() * 1000000) + 1);
	let userData = []
	request({
			uri: event.authenticationApi,
			method: "POST",
			json: userDetails,
		},
		function (error, body) {
			if (error) {
				const response = {
					success: "0",
					errorMessage: "Something went wrong.",
					successMessage: ""
				};
				callback(response);
			} else {
			    if (body.body.status == 'failed') {
			    	let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey';"
			    	queryExecution.queryExecution(client, jsonObj, event, queryConfigKey, function (response) {
				        if (response.success == '0') {
				            callback(response);
				        }
				        let results = response.result
				        let crypto = require('crypto');
				        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
				        let key = results[0].config_value;
				        let text = userDetails.password;
				        
				        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
				        let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
				        let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
				        userDetails.password = encryptedPassword
				        
						let userQrys = " SELECT su.site_id AS siteId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,sr.authority as role, " +
							" (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,su.id as sellerId  " +
							" FROM sec_user as su " +
							" INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 3 " +
							" INNER JOIN sec_role as sr on sr.id = susr.sec_role_id " +
							" where su.email_id = ? and su.site_id = ? and su.react_password = ?; " +
	
							" select mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId " +
							" FROM site as s " +
							" INNER JOIN store as st on s.seller_id = st.seller_id " +
							" INNER JOIN store_main_category as smc on smc.store_id = st.id " +
							" INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
							" where s.id = ?; "+
							
							" SELECT si.id AS siteId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,sr.authority as role,s.seller_id as sellerId " +
	                        " FROM store AS s " +
	                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
	                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 4 " +
	                        " INNER JOIN sec_role as sr on sr.id = susr.sec_role_id " +
	                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
	                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
	                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
	                        " INNER JOIN site AS si ON si.seller_id = sl.id  " +
	                        " where su.email_id =? and si.id = ? and su.react_password = ?  and enabled is true ;"
						queryExecution.queryExecution(client, jsonObj, event, userQrys,[userDetails.username,event.siteId,userDetails.password,event.siteId,userDetails.username,event.siteId,userDetails.password ], function (response) {
							if (response.success == '0') {
								callback(response);
							}
							let resultExist = response.result[0].length>0 ? response.result[0] : response.result[2]
							if (resultExist.length > 0) {
								resultExist[0].mainCategoryId = resultExist[0].mainCategoryId ? resultExist[0].mainCategoryId : response.result[1][0].mainCategoryId
								resultExist[0].mainGroupCategoryId = resultExist[0].mainGroupCategoryId ? resultExist[0].mainGroupCategoryId : response.result[1][0].mainGroupCategoryId
							
								/*const responseData = {
									success: "1",
									result: {
										userData: resultExist
									},
									errorMessage: "",
									successMessage: "Success"
								};
								callback(responseData);*/
								jwt.sign({userData : resultExist}, key, (err, token) => {
		                            if(err){
		                                console.log("err ",err)
		                            }
		                            else{
		                                resultExist[0].token = token
		                                const response = {
		                                    success: "1",
		                                    result: {
		                                        userData: resultExist
		                                    },
		                                    errorMessage: "",
		                                    successMessage: "Sucess"
		                                };
		                                callback(response)
		                    
		                            }
		                        })
							} else {
								const responseData = {
									success: "0",
									result: {
										userData: []
									},
									errorMessage: "Invalid Username/Password",
									successMessage: ""
								};
								callback(responseData);
							}
						});
			    	});
				} else {
				    let userDetails = body.body.data
				    userDetails.MobilePhone = userDetails.MobilePhone ? userDetails.MobilePhone : '9744955056'
				    userDetails.username = userDetails.Email
				    let existChecking = " SELECT su.id as userId " +
						" FROM sec_user as su " +
						" where su.email_id = ? and su.site_id = ?; " +

						"SELECT config_value FROM configuration WHERE config_key = 'loginKey';"+
						
						" select mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId " +
						" FROM site as s " +
						" INNER JOIN store as st on s.seller_id = st.seller_id " +
						" INNER JOIN store_main_category as smc on smc.store_id = st.id " +
						" INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
						" where s.id = ?; "
						
					queryExecution.queryExecution(client, jsonObj, event, existChecking,[userDetails.username,event.siteId, event.siteId], function (response) {
						if (response.success == '0') {
							callback(response);
						}
						let results = response.result
						let crypto = require('crypto');
						let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
						let key = results[1][0].config_value;
						var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
						let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
						let encryptedPassword = cipher.update(decoded.payload.password, 'utf8', 'hex') + cipher.final('hex');
						let query = ''
						if (results[0].length > 0) {
							query = "UPDATE sec_user set mobile_number = ?,react_password= ? where id =?;" 

								/*" SELECT su.site_id AS siteId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId," + userDetails.MobilePhone + " AS mobileNumber,sr.authority as role, " +
								" (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,if(sr.id = 3,su.id,'') as sellerId,if(sr.id = 4,(SELECT st.id FROM store as st where st.id = su.id) ,'') as storeId  " +
								" FROM sec_user as su " +
								" INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id " +
								" INNER JOIN sec_role as sr on sr.id = susr.sec_role_id " +
								" where su.email_id = '" + decoded.username + "' and su.site_id = " + event.siteId + "; "*/
							queryExecution.queryExecution(client, jsonObj, event, query,[userDetails.MobilePhone,encryptedPassword,results[0][0].userId], function (response) {
								if (response.success == '0') {
									callback(response);
								} else {
									userData[0] = {
										userId: results[0][0].userId,
										firstName: userDetails.FirstName,
										lastName: userDetails.LastName ? userDetails.LastName : "",
										displayName: userDetails.FirstName + ' ' + userDetails.LastName ? userDetails.LastName : "",
										emailId: userDetails.Email,
										mobileNumber: userDetails.MobilePhone,
										role: 'ROLE_BUYER',
										isBuyer: '1',
										mainCategoryId : results[2][0].mainCategoryId,
										mainGroupCategoryId : results[2][0].mainGroupCategoryId
									}
									jwt.sign({userData : userData}, key, (err, token) => {
			                            if(err){
			                                console.log("err ",err)
			                            }
			                            else{
			                                userData[0].token = token
			                                const response = {
			                                    success: "1",
			                                    result: {
			                                        userData: userData
			                                    },
			                                    errorMessage: "",
			                                    successMessage: "Sucess"
			                                };
			                                callback(response)
			                    
			                            }
			                        })
								}
							});
						} else {
							try {
								let sql1 = "INSERT INTO sec_user (version,account_expired,account_locked,enabled,is_verified,display_name,email_id,mobile_number,react_password,password_expired,username,site_id,password) VALUES ('0',0,0,1,1,?,?,?,?,0,?,?,'5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8')";
								queryExecution.queryExecution(client, jsonObj, event, sql1,[userDetails.FirstName,userDetails.username,userDetails.MobilePhone,encryptedPassword,username,event.siteId], function (response) {
									if (response.success == '0') {
										callback(response);
									}
									let result4 = response.result;
									let sql2 = " INSERT INTO buyer (id,created_by,created_on,customer_number,is_active,is_married,is_opt_in,is_terms_accepted,first_name,gender,number_of_kids,points,preferred_store_id,rank,rating,site_id) VALUES (?,?, NOW() ,?,1,0,1,1,?,2,1,0,0,0,0,?);" +
										" INSERT INTO sec_user_sec_role (sec_role_id,sec_user_id) VALUES ('2',?);"
									queryExecution.queryExecution(client, jsonObj, event, sql2,[ result4.insertId ,result4.insertId,customerNumber,userDetails.FirstName,event.siteId,result4.insertId], function (response) {
										if (response.success == '0') {
											callback(response);
										}
										userData[0] = {
											userId: result4.insertId,
											firstName: userDetails.FirstName,
											lastName: userDetails.LastName ? userDetails.LastName : "",
											displayName: userDetails.FirstName + ' ' + userDetails.LastName ? userDetails.LastName : "",
											emailId: userDetails.Email,
											mobileNumber: userDetails.MobilePhone,
											role: 'ROLE_BUYER',
											isBuyer: '1',
											mainCategoryId : results[2][0].mainCategoryId,
											mainGroupCategoryId : results[2][0].mainGroupCategoryId
										}
										jwt.sign({userData : userData}, key, (err, token) => {
				                            if(err){
				                                console.log("err ",err)
				                            }
				                            else{
				                                userData[0].token = token
				                                const response = {
				                                    success: "1",
				                                    result: {
				                                        userData: userData
				                                    },
				                                    errorMessage: "",
				                                    successMessage: "Sucess"
				                                };
				                                callback(response)
				                    
				                            }
				                        })

									});
								});
							} catch (e) {
								const response = {
									success: "0",
									result: {
										userData: userData
									},
									errorMessage: "Something went wrong.",
									successMessage: ""
								};
								callback(response);
							}
						}
					});
				}

			}

		});
}
module.exports = methods;

