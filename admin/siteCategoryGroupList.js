const queryExecution = require('../queryExecution')
let methods = {};


methods.siteCategoryGroupList = function (client, jsonObj, event, callback) {
	let wquery = "", fieldList = "", idQry = "", categoryQry = ""
	let params = []
	const removeQuotes = (str) => {
		return str.split("'").join('');
	};
	if (event.cmbStatus != "" && event.cmbStatus != null && event.cmbStatus != "0") {
		if (event.cmbSelect == "1") {
			wquery = " where group_name like ? and is_active= ?"
			params.push(removeQuotes("'%" + event.txtInput + "%'"), removeQuotes(event.cmbStatus))

		}
		else if (event.cmbSelect == "2") {
			event.cmbStatus = event.cmbStatus == 'true' ? true : false
			wquery = " where contact_email like ? and is_active= ? "
			params.push(removeQuotes("'%" + event.txtInput + "%'"), removeQuotes(event.cmbStatus))

		}
		else if (event.cmbSelect == "") {
			wquery = " where is_active= ?"
			params.push(event.cmbStatus)
		}
	}
	else {
		if (event.cmbSelect == "1") {
			wquery = " where group_name like ? "
			params.push(removeQuotes("'%" + event.txtInput + "%'"))
		}
		else if (event.cmbSelect == "2") {
			wquery = " where contact_email like ? "
			params.push(removeQuotes("'%" + event.txtInput + "%'"))
		}
	}
	if (event.siteCategoryGroupId) {
		event.offset = 0
		event.max = 10
		fieldList = " ,bannerbutton_text as bannerButtonText, button_colour as bannerButtonColor, fb_client_id as fbClientId,google_client_id as googleClientid,si.id as siteId,(select id from site_sub_domain where site_id = si.id limit 1) as siteSubDomainId, " +
			" if(scg.has_home_banner is true,'true','false') as hasBanner,(select site_url from site_sub_domain where site_id = si.id limit 1) as siteUrl,si.id as siId,si.google_analytics_script as googleSiteAnalytics,if(scg.has_category_selection is true,'true','false') AS hasCatSelect, " +
			" bannerbutton_text as bannerButtonText, button_colour as bannerButtonColor, fb_client_id as fbClientId,google_client_id as googleClientid,if(show_contact_details is true,'true','false') as showContactDetails,if(scg.has_contact_us_form is true,'true','false') AS hasContactUsForm, " +
			" if(show_whatsapp_link is true,'true','false') showWhatsappLink,if(display_city is true,'true','false') displayCity,if(has_registration_form is true,'true','false') as hasRegistrationForm, " +
			" scg.alternate_contact_no AS altContacts, scg.home_page_html AS homePageHtml,scg.logo_path AS StoreLogo, " +
			" scg.seo_description AS SeoDesc, scg.seo_keyword AS seoKey,scg.seo_title AS SeTitle, scg.slug AS SlugName,scg.theme AS ThemeName, " +
			" scg.whats_app_description AS WhatDesc,scg.sec_user_id AS sGSecId,sec.id AS secUserId,sec.display_name AS secDisplayName, " +
			" CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/',(SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
			"	   (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
			"	   (SELECT config_value FROM configuration WHERE config_key = 'siteCategoryLogoPath'),'/') AS imagePath, " +
			" scg.logo_path AS imageName,scg.email_host as emailHost,scg.email_password as emailPassword,scg.email_port as emailPort,scg.email_user_id as emailUserId,si.has_global_delivery,si.isPincodeBased "
		//idQry = //" INNER JOIN site_category_group_category as scgc on scgc.site_category_group_id = scg.id and scgc.site_category_group_id = "+event.siteCategoryGroupId+
		//" INNER JOIN main_category AS mc ON mc.id = scgc.main_category_id "+
		//" INNER JOIN sec_user AS sec ON sec.id = scg.sec_user_id "//+
		//" LEFT JOIN site as si on si.site_category_group = scg.id "+
		//" LEFT JOIN site_category_group_footer_links AS scgfs ON scgfs.site_category_group_id = scg.id "+
		//" LEFT JOIN site_category_group_banner AS scgb ON scgb.site_category_group_id = scg.id "+
		//" LEFT JOIN theme AS thm ON thm.id = scg.master_theme_id "

		idQry = " INNER JOIN sec_user AS sec ON sec.id = scg.sec_user_id " +
			" INNER JOIN site as si on si.site_category_group = scg.id and si.site_category_group = ? "

		categoryQry = " select scgc.id as siteCategoryGroupCategoryId, mc.id as id, mc.name as name " +
			" from site_category_group_category as scgc " +
			" inner join main_category as mc on mc.id = scgc.main_category_id  and mc.is_active is true " +
			" where scgc.site_category_group_id =? ;"
		params.push(event.siteCategoryGroupId, event.siteCategoryGroupId)

	}
	else {
		idQry = " INNER JOIN site as si on si.site_category_group = scg.id "
		fieldList = " ,si.id as SiteId,si.has_global_delivery,si.isPincodeBased "
	}
	let dQuery = " SELECT scg.id " +
		" FROM site_category_group as scg " + idQry + wquery + "; " +

		" SELECT scg.id AS siteCategoryGroupId, if(scg.is_active is true,'true','false') AS isActive, scg.group_name AS groupName, scg.contact_no AS contacts, scg.contact_email AS emailId,if(scg.has_seller_registration is true,1,0) AS hasSellerRegisteration ,if(has_global_search is true,'true','false') as hasGlobalSearch, " +
		// " (SELECT config_value FROM configuration WHERE config_key = 's3bucketAccessKey') as accessKey, " +
		// " (SELECT config_value FROM configuration WHERE config_key = 's3bucketSecretKey') as secretKey " +
		 fieldList +
		" FROM site_category_group as scg " + idQry + wquery +
		" ORDER BY scg.id DESC " +
		" limit ?,?; "

	dQuery = dQuery + categoryQry
	console.log("dQuery....", dQuery,params,parseInt(event.offset), parseInt(event.max))

	queryExecution.queryExecution(client, jsonObj, event, dQuery, [...params, parseInt(event.offset), parseInt(event.max), ...params], function (queryStringResult) {
		 console.log("queryStringResult....",queryStringResult);
		 
		if (queryStringResult.success == '0') {
			callback(queryStringResult);
		}
		let results = queryStringResult.result
		console.log("results....", results)
		if (results[1].length > 0) {
			if (event.siteCategoryGroupId) {
				results[1][0].thumbImage = results[1][0].imagePath + 'thumb/' + results[1][0].imageName
				results[1][0].smallImage = results[1][0].imagePath + 'thumb/SML_' + results[1][0].imageName
				results[1][0].midImage = results[1][0].imagePath + 'thumb/MID' + results[1][0].imageName
				results[1][0].image = results[1][0].imagePath + results[1][0].imageName

			}
			const response = {
				success: "1",
				successMessage: "Success.",
				result: results[1],
				count: results[0].length,
				categoryList: categoryQry ? results[2] : [],
				errorMessage: ""
			}
			console.log("response.....", response)
			callback(response)
		}
		else {
			const response = {
				success: "0",
				successMessage: "",
				result: [],
				errorMessage: "No data found."
			}
			callback(response)
		}
	})
}
module.exports = methods;