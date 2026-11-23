
let methods = {};
let queryExecution = require('../queryExecution');
methods.themeList = function(client,jsonObj,event,callback) {
 
     
    let queryString = " SELECT if(tp.image is not null,concat((select config_value from configuration where config_key = 'cdnImagePath'),'/', "+
                      " (select config_value from configuration where config_key = 'bucketSubFolder'),'/themes/', "+
                      " tp.image),'') as parentImage , ts.id as sectionId,ts.name as sectionName,tp.id as parentId,tp.name as parentName,tp.url as parentUrl,tp.sub_title as parentSubTitle "+
                        " FROM theme_section as ts "+
                        " INNER JOIN theme_parent as tp on tp.theme_section_id = ts.id and tp.is_active is true "+
                        " where ts.is_active is true and tp.site_id = ? and tp.theme_id = ?"+
                        " AND (CASE WHEN  tp.from_date IS NOT NULL THEN date(NOW()) >= tp.from_date and date(NOW()) <= tp.to_date  ELSE TRUE END) "+
                        " order by tp.sort_order ;" +
                        
                        
                      " SELECT if(tc.description is null,'',tc.description) as childDescription,if(tc.image is not null, concat((select config_value from configuration where config_key = 'cdnImagePath'),'/', "+
                      " (select config_value from configuration where config_key = 'bucketSubFolder'),'/themes/', "+
                      " tc.image),'') as childImage, "+ 
                      " ts.id as sectionId, "+
                      " if(tc.url is null,'',tc.url) as childUrl,tc.sub_title as childSubtitle,tc.name as childName "+
                      " FROM theme_parent as tp "+
                      " INNER JOIN theme_child as tc on tc.theme_parent_id = tp.id and tc.is_active is true "+
                      " INNER JOIN theme_section as ts on ts.id =tp.theme_section_id and ts.is_active is true "+
                      " where tp.is_active is true and tp.site_id =? and tp.theme_id = ?"+
                      " order by tp.sort_order,tc.sort_order ;"

    //connection.query(queryString, function (error, results, fields) {
    queryExecution.queryExecution(client, jsonObj, event, queryString,[event.siteId,event.themeId,event.siteId,event.themeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        let Comments=[],Steps= [],Video= [],Text= [],Parallax= [],Banner= [],BannerLogo= [],About= [],Category= [],Advertisement= [],ContactDetails= [],FooterBanner= [],AppLink= [],FooterAdvertisement = []
        
            let sectionData = []
            let arrayName
            for(let i=0;i<results[0].length;i++){
                let sectionList = []
                for(let j=0;j<results[1].length;j++){
                    if(results[0][i].sectionId == results[1][j].sectionId){
                        sectionList.push(results[1][j])
                    }
                }
                arrayName = results[0][i].sectionName
                const dataList = {
                    sectionId:results[0][i].sectionId,
                    sectionName:results[0][i].sectionName,
                    parentId:results[0][i].parentId,
                    parentName:results[0][i].parentName,
                    parentUrl:(results[0][i].parentUrl) ? results[0][i].parentUrl : "",
                    parentImage:results[0][i].parentImage,
                    parentSubTitle:(results[0][i].parentSubTitle) ? results[0][i].parentSubTitle:'',
                    sectionList:sectionList
                }
                console.log("....",dataList.sectionList)
                //sectionData.push(dataList)
                if(arrayName=='Text'){
                    Text.push(dataList)
                }
                else if(arrayName=='Comments'){
                    Comments.push(dataList)
                }
                else if(arrayName=='Parallax'){
                    Parallax.push(dataList)
                }
                else if(arrayName=='Video'){
                    Video.push(dataList)
                }
                else if(arrayName=='Steps'){
                    Steps.push(dataList)
                }
                else if(arrayName=='Banner'){
                    //console.log(dataList)
                    Banner.push(dataList)
                }
                else if(arrayName=='BannerLogo'){
                    BannerLogo.push(dataList)
                }
                else if(arrayName=='About'){
                    About.push(dataList)
                }
                else if(arrayName=='Category'){
                    Category.push(dataList)
                }
                else if(arrayName=='Advertisement'){
                    Advertisement.push(dataList)
                }
                else if(arrayName=='ContactDetails'){
                    ContactDetails.push(dataList)
                }
                else if(arrayName=='FooterBanner'){
                    FooterBanner.push(dataList)
                }
                else if(arrayName=='AppLink'){
                    AppLink.push(dataList)
                }
                else if(arrayName=='FooterAdvertisement'){
                    FooterAdvertisement.push(dataList)
                }
                
            }
            const responseData = {
                success:"1",
                Text:Text,
                Steps:Steps,
                Video:Video,
                Comments:Comments,
                Parallax:Parallax,
                Banner:Banner,
                BannerLogo:BannerLogo,
                About:About,
                Category:Category,
                Advertisement:Advertisement,
                ContactDetails:ContactDetails,
                FooterBanner:FooterBanner,
                AppLink:AppLink,
                FooterAdvertisement:FooterAdvertisement,
                successMessage:"Success",
                errorMessage:""
            }
            callback(responseData);
        });
}  
module.exports = methods;