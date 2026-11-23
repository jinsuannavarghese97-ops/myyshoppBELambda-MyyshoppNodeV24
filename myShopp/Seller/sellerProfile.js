var mysql = require('mysql');
var methods = {};

methods.sellerProfile = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    })
    pool.getConnection(function (err, connection) {

        var sellerId = jsonObj.sellerId
        var profileDetails = []

        var queryString = " select s.aadhar_no,s.id,c.id as cId,st.id as sid, s.retail_group_name as rtlgrpName,s.is_embed_code_enabled as isEmbed,s.first_name,s.last_name,sec.mobile_number,sec.email_id,sec.password,s.telephone_number,s.description,s.is_active,s.is_approved,  " +
            " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',s.logo_path) as imageName,s.logo_path as logoPath, " +
            " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/thumb/',s.logo_path) as thumbName,s.has_buy_option as BuyOption,s.has_contact_us_form as emailContact,s.has_location as Global,s.has_home_page as chkHomePage,s.is_singlelevel_menu as SingleLevel,has_wallet as Wallet, " +
            " s.home_page_html as HomeText,s.is_rental as Rental,s.is_rental_home as RentalHome,s.is_trial_room_enabled as TrialRoom,reg.id as RegionId, " +
            " s.has_blog as HasBlog,s.blog_name as BlogName,s.is_service_provider as ServiceProvider,s.has_home_theme as HomeTheme " +
            " from seller as s " +
            " inner join city as c on c.id = s.city_id " +
            " inner join state as st on st.id = c.state_id " +
            " left join region as reg on reg.id=s.region_id " +
            " inner join sec_user as sec on sec.id = s.id and s.id= ?";

        connection.query(queryString, [sellerId], function (error, queryStringResult, fields) {

            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting seller profile details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {

                for (var j = 0; j < queryStringResult.length; j++) {

                    profileDetails[j] = {
                        aadharNo: queryStringResult[j].aadhar_no == null ? '' : queryStringResult[j].aadhar_no,
                        sellerId: queryStringResult[j].id == null ? '' : queryStringResult[j].id,
                        sellerId: queryStringResult[j].cId == null ? '' : queryStringResult[j].cId,
                        stateId: queryStringResult[j].sid == null ? '' : queryStringResult[j].sid,
                        retailGrpName: queryStringResult[j].rtlgrpName == null ? '' : queryStringResult[j].rtlgrpName,
                        isEmbed: queryStringResult[j].isEmbed == null ? '' : queryStringResult[j].isEmbed,
                        firstName: queryStringResult[j].first_name == null ? '' : queryStringResult[j].first_name,
                        lastName: queryStringResult[j].last_name == null ? '' : queryStringResult[j].last_name,
                        mobileNumber: queryStringResult[j].mobile_number == null ? '' : queryStringResult[j].mobile_number,
                        emailId: queryStringResult[j].email_id == null ? '' : queryStringResult[j].email_id,
                        password: queryStringResult[j].password == null ? '' : queryStringResult[j].password,
                        telephoneNumber: queryStringResult[j].telephone_number == null ? '' : queryStringResult[j].telephone_number,
                        description: queryStringResult[j].description == null ? '' : queryStringResult[j].description,
                        isActive: queryStringResult[j].is_active == null ? '' : queryStringResult[j].is_active,
                        isApproved: queryStringResult[j].is_approved == null ? '' : queryStringResult[j].is_approved,
                        firstName: queryStringResult[j].first_name == null ? '' : queryStringResult[j].first_name,
                        logoPath: queryStringResult[j].logoPath == null ? '' : queryStringResult[j].logoPath,
                        imageName: queryStringResult[j].imageName == null ? '' : queryStringResult[j].imageName,
                        thumbName: queryStringResult[j].thumbName == null ? '' : queryStringResult[j].thumbName,
                        buyOption: queryStringResult[j].BuyOption == null ? '' : queryStringResult[j].BuyOption,
                        emailContact: queryStringResult[j].emailContact == null ? '' : queryStringResult[j].emailContact,
                        global: queryStringResult[j].Global == null ? '' : queryStringResult[j].Global,
                        hasHomePage: queryStringResult[j].chkHomePage == null ? '' : queryStringResult[j].chkHomePage,
                        singleLevelMenu: queryStringResult[j].SingleLevel == null ? '' : queryStringResult[j].SingleLevel,
                        hasWallet: queryStringResult[j].Wallet == null ? '' : queryStringResult[j].Wallet,
                        homePageHtml: queryStringResult[j].HomeText == null ? '' : queryStringResult[j].HomeText,
                        isRental: queryStringResult[j].Rental == null ? '' : queryStringResult[j].Rental,
                        isRentalHome: queryStringResult[j].RentalHome == null ? '' : queryStringResult[j].RentalHome,
                        isTrialRoom: queryStringResult[j].TrialRoom == null ? '' : queryStringResult[j].TrialRoom,
                        regionId: queryStringResult[j].RegionId == null ? '' : queryStringResult[j].RegionId,
                        hasBlog: queryStringResult[j].HasBlog == null ? '' : queryStringResult[j].HasBlog,
                        blogName: queryStringResult[j].BlogName == null ? '' : queryStringResult[j].BlogName,
                        isServiceProvider: queryStringResult[j].ServiceProvider == null ? '' : queryStringResult[j].ServiceProvider,
                        hasHomeTheme: queryStringResult[j].HomeTheme == null ? '' : queryStringResult[j].HomeTheme


                    }
                }
                // console.log(profileDetails)
                const response = {
                    success: "1",
                    result: profileDetails,
                    errorMessage: "",
                    successMessage: "success"
                }
                return callback(response);

            }
            else {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "No Data Found"
                };
                return callback(response);
            }

        });
    });
}
module.exports = methods;