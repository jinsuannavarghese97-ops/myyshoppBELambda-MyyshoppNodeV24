let queryExecution = require('../queryExecution');
let methods = {};

methods.setPermissionList = function (client, jsonObj, event, callback) {
    let top_menu_mainQry = `SELECT id as topMenuMainId,display_name as topMenuMainName,if(is_active=1,true,false) as is_active   FROM top_menu_main where role_id = ? ;`
    let leftMenuMainQry = `SELECT  id as leftMenuMainId,display_name as leftMenuMainName, if(is_active=1,true,false) as is_active FROM left_menu_main where role_id = ? ;`
    let leftMenuSubQry = `SELECT id as leftMenuSubId , display_name as leftMenuSubName,left_menu_main_id as leftMenuMainId ,if(is_active=1,true,false) as is_active  FROM left_menu_sub where role_id = ? ; `

    queryExecution.queryExecution(client, jsonObj, event, top_menu_mainQry + leftMenuMainQry + leftMenuSubQry, [event.roleId, event.roleId, event.roleId], function (response) {
        console.log("response.....", response);
        if (response.success == '0') {
            callback(response);
        } else {
            let leftMenuMain = response.result[1]

            if (response.result[2].length > 0) {
                for (let i = 0; i < response.result[1].length; i++) {
                    let leftMenuSub = []
                    for (let j = 0; j < response.result[2].length; j++) {
                        if (response.result[1][i].leftMenuMainId == response.result[2][j].leftMenuMainId) {
                            // let a = {
                            //     leftMenuSubId: response.result[2][j].leftMenuSubId,
                            //     leftMenuSubName: response.result[2][j].leftMenuSubName,
                            //     leftMenuMainId: response.result[2][j].leftMenuMainId,
                            //     is_active: response.result[2][j].is_active
                            // }
                            leftMenuSub.push(response.result[2][j])

                        }
                        leftMenuMain[i].leftMenuSub = leftMenuSub
                    }
                }
            }
            let responses = {
                topMenuMainDetails: response.result[0],
                leftMenuMainDetails: leftMenuMain  
            }
            response.result = responses
            console.log("responses....",responses);
            callback(response);
        }
    })

}
module.exports = methods;