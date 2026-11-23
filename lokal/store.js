const moment =require('moment-timezone');
const methods = {};
const queryExecution = require('../queryExecution');
methods.store = function(client,jsonObj,event,callback) {
 
    let storeResults = [];
    let mayCategoryId = jsonObj.myCategoryId
    let listQuery = " SELECT scgs.`store_id` "+
                    " FROM `site_category_group` AS scg "+
                    " INNER JOIN `site_category_group_stores` AS scgs ON scg.id = scgs.`site_category_group_id` "+
                    " INNER JOIN site_category_group_category as scgc on scg.id =scgc.`site_category_group_id` and scgc.main_category_id = ?"+
                    " where scg.id = ?"
   let listQueryval = [jsonObj.categoryId,mayCategoryId]
                    /*queryExecution.queryExecution(client, jsonObj, event, listQuery, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let listResults = response.result*/
        let myCategoryStoreQuery = " and st.id in ("+listQuery+")"
        let mainCategoryQuery1 = "";
        let mainCategoryQuery2 = ""
         let mainCategoryQuery1val = [];
        let mainCategoryQuery2val =[]
        let locationQuery1 = ""
        let locationQuery2 = ""
        let locationQuery3 = ""
        let locationQuery1val = []
        let locationQuery2val =[]
        let locationQuery3val = []
        let limitQuery1 = " LIMIT 1"
        let limitQuery2 = " LIMIT 10 "
        if(jsonObj.categoryId){
            mainCategoryQuery1 = " and mc.id = ? "
            mainCategoryQuery2 = " and smc.main_category_id = ?"
            mainCategoryQuery1val.push(jsonObj.categoryId)
            mainCategoryQuery2val.push(jsonObj.categoryId)
        }
        if(jsonObj.locationId){
            locationQuery1 = " AND lt.`location_id` = ? " 
            locationQuery2 = " and lgt.location_id = ?" 
            locationQuery3 = " and sl.location_id = ?"
            limitQuery1 = " LIMIT 1"
            limitQuery2 = " "
            locationQuery1val.push(jsonObj.locationId)
             locationQuery2val.push(jsonObj.locationId)
             locationQuery3val.push(jsonObj.locationId)
        }
        let storeQuery =""
        let storeQueryval =""
        if((jsonObj.locationId)&&(jsonObj.locationId!=null)){
            console.log("..Inside if.......")
          storeQuery = " (select concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)) as timming, " +
                            " c.id as cityId,mc.id as categoryId,mc.name as categoryName,mc.main_group_category_id as mainGroupCategory, "+
                            " st.name as storeName,c.name as cityName,st.id as storeId,st.locality as locality,st.slug as slug,st.delivery_slot1 as deliverySlot1,st.delivery_slot2 as deliverySlot2,st.delivery_slot3 as deliverySlot3,st.cut_of_time as cutOfTime, " +
                            " IFNULL(concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',if(st.logo_path is null,'default.png',st.logo_path)), " +
                            " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',if(st.logo_path is null,'default.png',st.logo_path))) as imageName, " +
                            " (SELECT GROUP_CONCAT(gt.`delivery_slot` SEPARATOR ',') " +  
                            " FROM `location_group_type` AS lt " +
                            " INNER JOIN `group_type` AS g ON g.id = lt.`group_type_id` and g.is_active is true " +
                            " INNER JOIN `group_type_delivery_slot` AS gt ON gt.`group_type_id` = lt.group_type_id " +  
                            " WHERE lt.`store_id` = st.id  "+locationQuery1+
                            " AND lt.`is_active` = TRUE AND gt.is_active = TRUE " +
                            " GROUP BY lt.id "+limitQuery1+") as deliverySlot, " +
                            "( SELECT if(gt.cm_delivers_in_from_days=gt.cm_delivers_in_to_days,concat(gt.cm_delivers_in_to_days,' days'),concat(gt.cm_delivers_in_from_days,' to ',gt.cm_delivers_in_to_days,' days')) " +
        					" FROM `location_group_type` AS lgt " +
        					" INNER JOIN `group_type` AS gt ON gt.id = lgt.`group_type_id` and gt.is_active is true " +
        					" WHERE lgt.store_id = st.id "+locationQuery2+" group by lgt.store_id) as cmDelivery "+
        					" ,( SELECT concat(gt.rt_delivery_opening_timeam,' ',gt.rt_delivery_closing_timeam,' ',gt.rt_delivery_opening_timepm,' ',gt.rt_delivery_closing_timepm) " +
        					" FROM `location_group_type` AS lgt " +
        					" INNER JOIN `group_type` AS gt ON gt.id = lgt.`group_type_id` and gt.is_active is true " +
        					" WHERE lgt.store_id = st.id "+locationQuery2+" group by lgt.store_id) as rtDelivery, "+
        					
        					" CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                            "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                            "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/' " + 
                            " ) AS logoPath, "+
                            
                            " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                            " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                            " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/' " + 
                            " ) AS logoPathData, "+
                          
                            " if(s.logo_path is null,'default.png',s.logo_path) as sellerLogo,if(st.logo_path is null,'default.png',st.logo_path) as stImage, "+
        					" su.mobile_number as storeMobileNumber,su.email_id as storeEmailId  "+
                            " from store as st " +
                            " inner join sec_user as su on st.sec_user_id = su.id "+
                            " inner join location_group_type as sl on sl.store_id = st.id " +
                            " inner join group_type as gts on sl.group_type_id = gts.id and gts.is_active is true " +
                            " inner join city as c on c.id = st.city_id " +
                            " inner join location as l on l.id = sl.location_id " +
                            " inner join seller as s on s.id = st.seller_id " +
                            " inner join store_main_category as smc ON smc.store_id = st.id "+
                            " inner join main_category as mc ON mc.id = smc.main_category_id "+
                            " where l.is_active = true and l.is_approved = true and sl.is_active = true and st.is_active = true and"+
                            " st.is_approved = true and s.is_active = true "+
                            " and s.is_approved = true "+mainCategoryQuery1+locationQuery3 + " AND s.has_location = true " +myCategoryStoreQuery+" and "+
                            " (( " +
                            " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) " +
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) "+
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) "+
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) "+
                            " OR "+
                            " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
                            " ) "+
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE) " +
                            " )) "+
                            " group by st.id  order by st.ranking asc "+limitQuery2+")"
              storeQueryval = [...locationQuery1val,...locationQuery2val,...locationQuery2val,...mainCategoryQuery1val,...locationQuery3val,...listQueryval]
        }
        else
        {
            console.log("..Inside else.......")
            storeQuery=storeQuery = " (select concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)) as timming, " +
                            " '' as cityId,mc.id as categoryId,mc.name as categoryName,mc.main_group_category_id as mainGroupCategory, "+
                            " st.name as storeName,'' as cityName,st.id as storeId,st.locality as locality,st.slug as slug,st.delivery_slot1 as deliverySlot1,st.delivery_slot2 as deliverySlot2,st.delivery_slot3 as deliverySlot3,st.cut_of_time as cutOfTime, " +
                            " IFNULL(concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',if(st.logo_path is null,'default.png',st.logo_path)), " +
                            " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',if(st.logo_path is null,'default.png',st.logo_path))) as imageName, " +
                            " '' as deliverySlot, " +
                            " '' as cmDelivery, "+
        					" '' rtDelivery, "+
        					" CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                            "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                            "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/' " + 
                            " ) AS logoPath, "+
                            
                            " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                            " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                            " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/' " + 
                            " ) AS logoPathData, "+
                          
                            " if(s.logo_path is null,'default.png',s.logo_path) as sellerLogo,if(st.logo_path is null,'default.png',st.logo_path) as stImage, "+
        					" su.mobile_number as storeMobileNumber,su.email_id as storeEmailId  "+
                            " from store as st " +
                            " inner join sec_user as su on st.sec_user_id = su.id "+
                            
                            " inner join seller as s on s.id = st.seller_id " +
                            " inner join store_main_category as smc ON smc.store_id = st.id "+
                            " inner join main_category as mc ON mc.id = smc.main_category_id where "+
    
                            "  st.is_active = true and st.is_approved = true and s.is_active = true and s.is_approved = true "+mainCategoryQuery1 + " AND s.has_location = true " +myCategoryStoreQuery+" and "+
                            " (( " +
                            " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) " +
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) "+
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) "+
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) "+
                            " OR "+
                            " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
                            " ) "+
                            " OR " +
                            " (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE) " +
                            " )) "+
                            " group by st.id  order by st.ranking asc "+limitQuery2+")"
                            storeQueryval = [...mainCategoryQuery1val,...listQueryval]
        }
                           console.log([...storeQueryval],"storeQuery.1111.."+storeQuery)
        //connection.query(storeQuery, function (error, storeResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, storeQuery,[...storeQueryval], function (response) {
            if (response.success == '0') {
                console.log("entererrrrrrrrrrrrr1")
                callback(response);
            }
            let storeResults = response.result
            
            let storeQueryGlobal = "( select concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)) as timming,c.id as cityId,st.name as storeName,c.name as cityName,st.id as storeId,st.locality as locality,st.slug as slug,st.delivery_slot1 as deliverySlot1,st.delivery_slot2 as deliverySlot2,st.delivery_slot3 as deliverySlot3,st.cut_of_time as cutOfTime, " +
                                    " mc.id as categoryId,mc.name as categoryName,mc.main_group_category_id as mainGroupCategory,IFNULL(concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                                    " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',if(st.logo_path is null,'default.png',st.logo_path)), " +
                                    " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                                    " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',if(st.logo_path is null,'default.png',st.logo_path))) as imageName, " +
                                    
                                    " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                                    "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                                    "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',s.logo_path " + 
                                    ") AS logoPath, "+
                                    
                                    " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                                    "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                                    "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/' " + 
                                    " ) AS logoPathData, "+
                          
                                    " if(s.logo_path is null,'default.png',s.logo_path) as sellerLogo,if(st.logo_path is null,'default.png',st.logo_path) as stImage "+
                                    " ,su.mobile_number as storeMobileNumber,su.email_id as storeEmailId "+
                                    " from store as st " +
                                    " inner join sec_user as su on st.sec_user_id = su.id "+
                                    " inner join city as c on c.id = st.city_id " +
                                    " inner join seller as s on s.id = st.seller_id " +
                                    " inner join store_main_category as smc ON smc.store_id = st.id "+
                                    " inner join main_category as mc ON mc.id = smc.main_category_id "+
                                    " where  st.is_active = true and st.is_approved = true and s.is_active = true and s.is_approved = true "+mainCategoryQuery2+" AND s.has_location = FALSE  "+myCategoryStoreQuery+" and "+
                                    " (( " +
                                    " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) " +
                                    " OR " +
                                    " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) "+
                                    " OR " +
                                    " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) "+
                                    " OR " +
                                    " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
                                    " OR " +
                                    " (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) "+
                                    " OR "+
                                    " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
                                    " ) "+
                                    " OR " +
                                    " (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE) " +
                                    " )) "+
                                    " group by st.id order by st.ranking asc )"
            //connection.query(storeQueryGlobal, function (error, storeGlobalResults, fields) {
            console.log("storeQueryGlobal ",storeQueryGlobal)
            queryExecution.queryExecution(client, jsonObj, event, storeQueryGlobal,[...mainCategoryQuery2val,...listQueryval], function (response) {
                if (response.success == '0') {
                     console.log("entererrrrrrrrrrrrr2")
                    callback(response);
                }
                let storeGlobalResults = response.result
                //console.log("storeResults.length..."+storeResults.length)
                for(let i = 0;i<storeResults.length;i++){    
                    
                    let deliveryResults = storeResults[i].deliverySlot
                    if(deliveryResults){
                        deliveryResults = deliveryResults.split(',')
                    }
                    //console.log("deliveryResults..."+deliveryResults)
                    deliveryResults = deliveryResults ? deliveryResults : []
                    let deliverySlotFlag = 0
                    let storeCutofTimeVal;  
                    let deliverySlot
                    //flag 0 : cut of time less than 1 day and slot outside the day
                    //flag 1 : cut of time less than 1 day and slot inside the day
                    //flag 2 : cut of time greater than 1 day   
                    let slotCount = 0
                   
                    if(deliveryResults){
                        for(let m=0;m<deliveryResults.length;m++){
                            //console.log("deliveryResults.length..."+deliveryResults.length)
                            //console.log(" deliveryResults[m]..."+deliveryResults[m])
                            //console.log("m.............................",m)
                            deliverySlot = deliveryResults[m]
                            let currentTime
                            let show1="no"
                            let show2="no"
                            let show3="no"
                            let storeCutofTime = 15;
                            let ONE_MINUTE_IN_MILLIS = 60000;
                            storeCutofTimeVal = storeCutofTime;
                            let mydate =moment().valueOf();
                            let mydate11 =moment(mydate).utcOffset(330).valueOf();
                            let mydate12 =parseInt(mydate11)+parseInt(storeCutofTime * ONE_MINUTE_IN_MILLIS)
                            currentTime = moment(mydate12)
                            //console.log("currentTime111111...",currentTime)
                            if(storeCutofTimeVal < 1440){  
                                if(deliverySlot != null && deliverySlot != '')
                                {
                                    let time1 = parseInt(deliveryResults[m].split("To")[0].split(' ')[0])
                                    let ampm1=deliveryResults[m].split("To")[0].split(' ')[1]
                                    let timeslot1
                                    if(ampm1=="PM" && time1!=12 )
                                    timeslot1=parseInt(time1)+12
                                    else if(ampm1=="AM" && time1==12)
                                    timeslot1=parseInt(time1)+12
                                    else
                                    timeslot1=time1
                                    let cal1=moment().toDate();
                                    
                                    //console.log("cal1....1....",cal1)
                                    //console.log("timeslot1..........",timeslot1)
                                    cal1.setHours(timeslot1);
                                    //console.log("cal1...2.....",cal1)
                                    cal1.setMinutes(0);
                                    cal1.setSeconds(0);
                                    if(currentTime<cal1.getTime()){
                                        deliverySlotFlag = 1
                                    }
                                    else{
                                        deliverySlotFlag = 0
                                    }
                                }
                                if(deliverySlotFlag == 1){
                                    deliverySlot = 'Today '+deliveryResults[m]
                                    break;
                                }
                                else{
                                    slotCount++
                                }
                                if(slotCount == deliveryResults.length){
                                    deliverySlot = 'Tomorrow '+deliveryResults[m]
                                    break;
                                }
                            }
                            
                            else{
                                slotCount++
                                let dayCount = storeCutofTimeVal/1440
                                let currentDate1 = new Date();
                                currentDate1.setDate(currentDate1.getDate() + dayCount); 
                                let currentDatePlusOne = currentDate1//.getTime();
                                
                                let currentDate2 = new Date();
                                currentDate2.setDate(currentDate2.getDate() + parseInt(dayCount)+1); 
                                let currentDatePlusTwo = currentDate2//.getTime();
                
                                if(deliverySlot != null && deliverySlot != '')
                                {
                                    let time1 = parseInt(deliveryResults[m].split("To")[0].split(' ')[0])
                                    let ampm1=deliveryResults[m].split("To")[0].split(' ')[1]
                                    let timeslot1
                                    if(ampm1=="PM" && time1!=12 )
                                    timeslot1=parseInt(time1)+12
                                    else if(ampm1=="AM" && time1==12)
                                    timeslot1=parseInt(time1)+12
                                    else
                                    timeslot1=time1
                                    let cal1 = currentDate1
                                    cal1.setHours(timeslot1)
                                    cal1.setMinutes(0)
                                    cal1.setSeconds(0)
                                    if(currentTime < cal1.getTime()){
                                        deliverySlotFlag = 1
                                    }
                                    else{
                                        deliverySlotFlag = 0
                                    }
                                }
                                let months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                let dd = currentDatePlusOne.getDate();
                                let mm = currentDatePlusOne.getMonth();
                                let yyyy = currentDatePlusOne.getFullYear();
                                if (dd < 10) {
                                    dd = '0' + dd;
                                } 
                                if (mm < 10) {
                                    mm = mm;
                                } 
                                currentDatePlusOne = dd + '/' + months[mm] + '/' + yyyy;
                
                                let dd1 = currentDatePlusTwo.getDate();
                                let mm1 = currentDatePlusTwo.getMonth();
                                let yyyy1 = currentDatePlusTwo.getFullYear();
                                if (dd1 < 10) {
                                    dd1 = '0' + dd1;
                                } 
                                if (mm1 < 10) {
                                    mm1 = mm1;
                                } 
                                currentDatePlusTwo = dd1 + '/' + months[mm1] + '/' + yyyy1;
                
                                if(deliverySlotFlag == 1){
                                    deliverySlot = currentDatePlusOne+' '+deliveryResults[m]
                                    break;
                                }
                                if(slotCount == deliveryResults.length){
                                    deliverySlot = currentDatePlusTwo+' '+deliveryResults[m]
                                    break;
                                }
                            }
                        }
                    }
                    if(storeResults[i].mainGroupCategory=='8'){
                        deliverySlot = storeResults[i].cmDelivery
                    }
                    //console.log("storeResults[i].storeName ",storeResults[i].mainCategory)
                    storeResults[i] = {
                        categoryId : storeResults[i].categoryId,
                        categoryName : storeResults[i].categoryName,
                        mainGroupCategory : storeResults[i].mainGroupCategory,
                        storeName : storeResults[i].storeName,
                        cityId : storeResults[i].cityId,
                        cityName : storeResults[i].cityName,
                        storeId : storeResults[i].storeId,
                        locality : storeResults[i].locality,
                        slug : storeResults[i].slug ? storeResults[i].slug : "",
                        imageName : storeResults[i].imageName!=null ? storeResults[i].imageName : "",
                        sellerLogoPath: storeResults[i].sellerLogo ? storeResults[i].logoPathData+storeResults[i].sellerLogo : storeResults[i].logoPathData+'default.png',
                        deliverySlot:deliverySlot,
                        timming:storeResults[i].timming,
                        mobileNumber:storeResults[i].storeMobileNumber,
                        emailId:storeResults[i].storeEmailId
                    }
                    
                }    
                let resultData ={
                    "storeData": storeResults,
                    "storeGlobalResults":storeGlobalResults
                }
                const data = {
                success: "1",
                result:resultData,
                errorMessage: "",
                successMessage: "Success"
            };
            
                callback(data);
            });    
        });
    //});       

}  
module.exports = methods;