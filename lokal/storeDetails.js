let methods = {};
let queryExecution = require('../queryExecution');
methods.storeDetails = function(client,jsonObj,event,callback) {

        let storeResults = [];
         let storeId = jsonObj.storeId
         let storeQuery = "SELECT concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)) as timming,c.id as cityId,st.id AS storeId,st.name AS storeName,s.id AS sellerId,mc.main_group_category_id as mainCategoryId, "+
                          "c.name as cityName, st.alternate_number2 as alternateNumber2,st.alternate_number1 as alternateNumber1,st.alternate_email as alternateEmail, "+
                          "st.whatsapp_description as whatsappDescription, st.locality as locality,st.footer_description as footerDescription, "+
                          "sc.mobile_number as mobileNumber,st.telephone_number as telephoneNumber, if(st.has_reservation_option is true,'1','0') as hasReservationOption, "+
                          " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                          "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/', " + 
                          " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPath,if(st.has_gallery is true,'1','0') as hasGallery, "+
                          " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                          "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/SML_', " + 
                          " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPathSmall, "+
                          
                          " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                          "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', " + 
                          " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPathLarge, "+
                          
                          " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                          "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/' " + 
                          " ) AS logoPath, "+
                          
                          " if(s.logo_path is null,'default.png',s.logo_path) as sellerLogo, "+
                          
                          " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                          " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          " (SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) as imagePath, "+
                          " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                          " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          " (SELECT  config_value FROM configuration WHERE config_key = 's3PathRestaurant')) as restaurantImagePath ,"+
                          " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                          " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                          " (SELECT  config_value FROM configuration WHERE config_key = 's3PathCommonItem'),'/clothing/') as cmImagePath, "+
                      //  " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/clothing/')as cmImagePath"+
                          "  (SELECT config_value  FROM configuration WHERE config_key = 'solarPath') as solarPath,  "+
                          " st.seo_title as seo_title, st.seo_description as seo_description ,st.seo_keywords as seo_keywords,st.slug as slug " +
                          "FROM store AS st "+
                          "INNER JOIN seller AS s ON s.id = st.seller_id "+
                          " inner join store_main_category as smc on smc.store_id=st.id " +
                          " inner join main_category as mc on mc.id=smc.main_category_id "+
                          "INNER JOIN city AS c ON st.city_id = c.id "+
                          "INNER JOIN sec_user as sc on st.sec_user_id = sc.id "+
                         // " left join theme as th on th.id = smc.theme_id "+
                          "WHERE s.is_active =TRUE AND s.is_approved = TRUE "+
                          " AND st.id= ?" +
                          " group by st.id; "+
                          
                          " SELECT bt.id as bannerTypeId,bt.name as bannerType,CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
                          " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                          " (SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', " +
                          " if(b.image_path is null,'default.jpg',b.image_path)) AS image_path " +
                          " FROM banner AS b " +
                          " INNER JOIN banner_type as bt on bt.id = b.banner_type_id "+
                          " inner join store as st on b.store_id = st.id " +
                          " LEFT JOIN banner_url_coordinates AS buc ON b.id = buc.banner_id " +
                          " WHERE b.is_active = TRUE AND b.is_approved = TRUE AND b.store_id = ?" +
                          " AND bt.id = 2 AND b.rank>0 AND (CURDATE() BETWEEN DATE(b.from_date) AND DATE(b.to_date)) " +
                          " GROUP BY b.id " + 
                          " ORDER BY b.banner_type_id asc,b.rank ASC "
        //connection.query(storeQuery, function (error, results3, fields) {
        queryExecution.queryExecution(client, jsonObj, event, storeQuery,[storeId,storeId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let results3 = response.result    
            let storeData = [{
                            storeId: results3[0][0].storeId,
                            cityId:results3[0][0].cityId,
                            storeName: results3[0][0].storeName,
                            sellerId: results3[0][0].sellerId,
                            locality: results3[0][0].locality,
                            cityName: results3[0][0].cityName,
                            alternateNumber2: results3[0][0].alternateNumber2,
                            alternateNumber1: results3[0][0].alternateNumber1,
                            alternateEmail:results3[0][0].alternateEmail, 
                            mainCategoryId:results3[0][0].mainCategoryId, 
                            whatsappDescription: results3[0][0].whatsappDescription,
                            footerDescription:results3[0][0].footerDescription,
                            mobileNumber: results3[0][0].mobileNumber,
                            telephoneNumber:results3[0][0].telephoneNumber,
                            storeLogoPath: results3[0][0].storeLogoPath,
                            storeLogoPathLarge:results3[0][0].storeLogoPathLarge,
                            storeLogoPathSmall: results3[0][0].storeLogoPathSmall,
                            sellerLogoPath: results3[0][0].logoPath+'thumb/'+results3[0][0].sellerLogo,
                            sellerLogoPathLarge:results3[0][0].logoPath+results3[0][0].sellerLogo,
                            sellerLogoPathSmall: results3[0][0].logoPath+'thumb/SML_'+results3[0][0].sellerLogo,
                            hasGallery:results3[0][0].hasGallery,
                            imagePath:results3[0][0].imagePath,
                            restaurantImagePath:results3[0][0].restaurantImagePath,
                            cmImagePath:results3[0][0].cmImagePath,
                            hasReservationOption:results3[0][0].hasReservationOption,
                             solarPath:results3[0][0].solarPath,
                             seoTitle:results3[0][0].seo_title,
                             seoDescription:results3[0][0].seo_description,
                             seoKeywords:results3[0][0].seo_keywords,
                             slug:results3[0][0].slug,
                             banner:results3[1],
                             timming:results3[0][0].timming
                        }]
            
            //console.log("storeData..........."+storeData[0].slug)
                            const responseData = {
                                   "storeData": storeData
                                }
                                const data = {
                                    success: "1",
                                    result:responseData,
                                    errorMessage: "",
                                    successMessage: "Success"
                                };
            
                                callback(data);
            
            
        });     
            
        
}  
module.exports = methods;