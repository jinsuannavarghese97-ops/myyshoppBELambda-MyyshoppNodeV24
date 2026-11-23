let moment =require('moment');
let methods = {};
let queryExecution = require('../queryExecution');
methods.storesBySellerIdNonLocation = function(client,jsonObj,event,callback) {

    let storeResults = [];
    let myCategoryStoreQuery = " and st.id in (Select GROUP_CONCAT(s.`id` SEPARATOR ',') storeList from store as s where s.is_active = true and s.seller_id = ? group by s.seller_id ) "
        
         let storeQuery = " (select concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)) as timming, c.id as cityId, " +
                        " (select group_concat(mc1.name separator ', ') from main_category as mc1 " +
                        "     inner join store_main_category as smc1 on smc1.main_category_id = mc1.id " +
                        "     where smc1.store_id = st.id  group by smc1.store_id " +
                        "     ) as mainCategory, " +
                        " st.name as storeName,c.name as cityName,st.id as storeId,st.locality as locality,st.slug as slug,st.delivery_slot1 as deliverySlot1,st.delivery_slot2 as deliverySlot2,st.delivery_slot3 as deliverySlot3,st.cut_of_time as cutOfTime, " +
                        " IFNULL(concat((select config_value from configuration where config_key = 'cdnImagePath'),'/', " +
                        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                        " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',st.logo_path), " +
                        " concat((select config_value from configuration where config_key = 'cdnImagePath'),'/', " +
                        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                        " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',st.logo_path)) as imageName, " +
                        " '' as deliverySlot, " +
                        " '' as deliverySlotCommon, st.seller_id as sellerId, " +
                        " st.alternate_number2 as alternateNumber2,st.alternate_number1 as alternateNumber1,st.alternate_email as alternateEmail " +
                        " ,mc.main_group_category_id as mainCategoryId,sc.mobile_number as mobileNumber,st.telephone_number as telephoneNumber, " +
                        " st.whatsapp_description as whatsappDescription, st.footer_description as footerDescription, "+
                         " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                         "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                         "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/', " + 
                         " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPath,if(st.has_gallery is true,'1','0') as hasGallery, "+
                         " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                         "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                         "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/SML_', " + 
                         " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPathSmall, "+
                          " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                         " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                        " (SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) as imagePath, "+
                        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                         " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                        " (SELECT  config_value FROM configuration WHERE config_key = 's3PathRestaurant')) as restaurantImagePath ,"+
                        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                         " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                        " (SELECT  config_value FROM configuration WHERE config_key = 's3PathCommonItem'),'/clothing/') as cmImagePath, "+
                        " if(st.has_reservation_option is true,'1','0') as hasReservationOption, " +
                         " st.seo_title as seo_title, st.seo_description as seo_description ,st.seo_keywords as seo_keywords " +
                        " from store as st " +
                        " inner join location_group_type as sl on sl.store_id = st.id " +
                        " inner join city as c on c.id = st.city_id " +
                        " inner join location as l on l.id = sl.location_id " +
                        " inner join seller as s on s.id = st.seller_id " +
                        " inner join store_main_category as smc ON smc.store_id = st.id "+
                        " inner join main_category as mc ON mc.id = smc.main_category_id "+
                        " inner JOIN sec_user as sc on st.sec_user_id = sc.id "+
                        " where l.is_active = true and l.is_approved = true and sl.is_active = true and st.is_active = true and st.is_approved = true and s.is_active = true and s.is_approved = true AND s.has_location = true " +myCategoryStoreQuery+" and "+
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
                       console.log("storeQuery......."+storeQuery) 
        //connection.query(storeQuery, function (error, storeResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, storeQuery,[jsonObj.sellerId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let storeResults = response.result    
           
                console.log("storeResults.length..."+storeResults.length)
                for(let i = 0;i<storeResults.length;i++){    
                    
                    
                    
                    
                    
                    
                    
                    let deliverySlot
                    if(storeResults[i].deliverySlot != 'null' && storeResults[i].deliverySlot != null){
                        let deliveryResults = storeResults[i].deliverySlot
                        if(deliveryResults){
                            deliveryResults = deliveryResults.split(',')
                        }
                        console.log("deliveryResults..."+deliveryResults)
                        let deliverySlotFlag = 0
                        let storeCutofTimeVal;  
                        
                        //flag 0 : cut of time less than 1 day and slot outside the day
                        //flag 1 : cut of time less than 1 day and slot inside the day
                        //flag 2 : cut of time greater than 1 day   
                        let slotCount = 0
                       
                       
                       
                       
                        // console.log("deliveryResults.length..."+deliveryResults.length)
                        for(let m=0;m<deliveryResults.length;m++){
                            console.log("deliveryResults.length..."+deliveryResults.length)
                            console.log(" deliveryResults[m]..."+deliveryResults[m])
                            console.log("m.............................",m)
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
                            console.log("currentTime111111...",currentTime)
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
                                    
                                    console.log("cal1....1....",cal1)
                                    console.log("timeslot1..........",timeslot1)
                                    cal1.setHours(timeslot1);
                                    console.log("cal1...2.....",cal1)
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
                    else{
                        deliverySlot = storeResults[i].deliverySlotCommon
                    }
                    
                    
                
                    storeResults[i] = {
                        storeName : storeResults[i].storeName,
                        cityName : storeResults[i].cityName,
                        storeId : storeResults[i].storeId,
                        locality : storeResults[i].locality,
                        slug : storeResults[i].slug,
                        imageName : storeResults[i].imageName,
                        deliverySlot:deliverySlot,
                        sellerId : storeResults[i].sellerId,
                         alternateNumber2: storeResults[i].alternateNumber2,
                        alternateNumber1: storeResults[i].alternateNumber1,
                        alternateEmail:storeResults[i].alternateEmail, 
                        mainCategoryId:storeResults[i].mainCategoryId, 
                         whatsappDescription: storeResults[i].whatsappDescription,
                        footerDescription:storeResults[i].footerDescription,
                        mobileNumber: storeResults[i].mobileNumber,
                         telephoneNumber:storeResults[i].telephoneNumber,
                         storeLogoPath: storeResults[i].storeLogoPath,
                        storeLogoPathSmall: storeResults[i].storeLogoPathSmall,
                          hasGallery:storeResults[i].hasGallery,
                          imagePath:storeResults[i].imagePath,
                        restaurantImagePath:storeResults[i].restaurantImagePath,
                        cmImagePath:storeResults[i].cmImagePath,
                           hasReservationOption:storeResults[i].hasReservationOption,
                          seoTitle:storeResults[i].seo_title,
                         seoDescription:storeResults[i].seo_description,
                         seoKeywords:storeResults[i].seo_keywords,
                        timming:storeResults[i].timming,
                        cityId:storeResults[i].cityId
                        
                       
                        
                    }
                }    
                let resultData ={
                    "storeData": storeResults
                }
                const data = {
                    success: "1",
                    result:resultData,
                    errorMessage: "",
                    successMessage: "Success"
                };
            
                callback(data);
            });    
}  
module.exports = methods;