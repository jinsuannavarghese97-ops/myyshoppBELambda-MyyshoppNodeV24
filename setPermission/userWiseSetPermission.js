let queryExecution = require('../queryExecution');
let methods = {};

methods.userWiseSetPermissionList = function (client, jsonObj, event, callback) {
    console.log("event.....", event);
    let userWiseListquery = '';
    let queryParams = [];
    if (event.store_id) {
        userWiseListquery = `SELECT sttmm.id as storetopMenuMainMainId,sttmm.top_menu_main_id,if(sttm.is_active=1,true,false)  as is_active,tmm.url,tmm.display_name,
            tmm.name,tmm.sort_order,tmm.image_name  
            from store_top_menu_main as sttmm 
            inner join top_menu_main as tmm on tmm.id = sttmm.top_menu_main_id 
            where sttmm.store_id = ? ;

            SELECT stlmm.id as storeLeftMenuMain,stlmm.left_menu_main_id,if(stlmm.is_active=1,true,false) as is_active,lmm.url,lmm.display_name,lmm.name,lmm.role_id,
            lmm.sort_order,lmm.description,lmm.top_menu_main_id,lmm.image_name
            FROM store_left_menu_main AS stlmm 
            inner join left_menu_main as lmm on lmm.id = stlmm.left_menu_main_id
            where stlmm.store_id = ?  ;
            
            SELECT stlms.id as storeLeftMenuSubId,stlms.left_menu_sub_id ,if(stlms.is_active=1,true,false) as is_active,lms.left_menu_main_id,lms.display_name,
            lms.name ,lms.sort_order,lms.image_name
            FROM store_left_menu_sub as stlms 
            inner join left_menu_sub lms on lms.id = stlms.left_menu_sub_id       
            where stlms.store_id = ? ; `;
        queryParams = [event.store_id, event.store_id, event.store_id];
    } else if (event.seller_id) {
        userWiseListquery = `SELECT stmm.id as sellerTopMenuMain,stmm.top_menu_main_id,if(stmm.is_active=1,true,false) as is_active, tmm.url,tmm.display_name,
            tmm.name,tmm.sort_order,tmm.image_name 
            FROM seller_top_menu_main as stmm 
            inner join top_menu_main as tmm on tmm.id = stmm.top_menu_main_id 
            where stmm.seller_id = ? ;
            
            SELECT slmm.id as sellerLeftMenuMainId,slmm.left_menu_main_id,if(slmm.is_active=1,true,false) as is_active ,lmm.url,lmm.display_name,lmm.name,lmm.role_id,
            lmm.sort_order,lmm.description,lmm.top_menu_main_id,lmm.image_name
            from seller_left_menu_main as slmm 
            inner join left_menu_main as lmm on lmm.id = slmm.left_menu_main_id 
            where slmm.seller_id = ? ; 
            
            SELECT slms.id as sellerLeftMenuSubId,slms.left_menu_sub_id , if(slms.is_active=1,true,false) as is_active,lms.left_menu_main_id,lms.display_name,
            lms.name ,lms.sort_order,lms.image_name
            FROM seller_left_menu_sub as slms 
            inner join left_menu_sub as lms on lms.id = slms.left_menu_sub_id 
            where slms.seller_id = ? ;`;
        queryParams = [event.seller_id, event.seller_id, event.seller_id];


    } else if (event.site_id) {
        userWiseListquery = `SELECT stmm.id as siteTopMenuMain,stmm.top_menu_main_id,if(stmm.is_active=1,true,false)  as is_active ,tmm.url,tmm.display_name,
        tmm.name,tmm.sort_order,tmm.image_name 
        FROM site_top_menu_main as stmm 
        inner join top_menu_main as tmm on tmm.id = stmm.top_menu_main_id 
        where stmm.site_id = ? ;
        
        SELECT slmm.id as siteLeftMenuMainId,slmm.left_menu_main_id,if(slmm.is_active=1,true,false) as is_active ,lmm.url,lmm.display_name,lmm.name,lmm.role_id,
        lmm.sort_order,lmm.description,lmm.top_menu_main_id,lmm.image_name
        FROM site_left_menu_main AS slmm 
        inner join left_menu_main as lmm on lmm.id = slmm.left_menu_main_id 
        where slmm.site_id = ? ;
        
        SELECT slms.id as siteLeftMenuMainId ,slms.left_menu_sub_id,if(slms.is_active=1,true,false) as is_active,lms.left_menu_main_id,lms.display_name,
        lms.name ,lms.sort_order,lms.image_name
        FROM site_left_menu_sub as slms 
        inner join left_menu_sub as lms on lms.id = slms.left_menu_sub_id 
        where slms.site_id = ? ;`;
        queryParams = [event.site_id, event.site_id, event.site_id];
    }
    queryExecution.queryExecution(client, jsonObj, event, userWiseListquery, queryParams, function (response) {
        console.log("response.....", response);
        if (response.success == '0') {
            callback(response);
        } else {
            let topMenuMain = response.result[0]
            let leftMenuMain = response.result[1]
            for (let i = 0; i < leftMenuMain.length; i++) {
                let leftMenuSub = []
                for (let j = 0; j < response.result[2].length; j++) {
                    if (leftMenuMain[i].left_menu_main_id == response.result[2][j].left_menu_main_id) {
                        leftMenuSub.push(response.result[2][j])
                    }
                    leftMenuMain[i].leftMenuSub = leftMenuSub
                }

            }
            let responses = {
                topMenuMain: topMenuMain,
                leftMenuMain: leftMenuMain
            }
            console.log("responses.....", responses);
            response.result = responses
            callback(response);
        }
    })

}
module.exports = methods;