let methods = {};

methods.newGroceryItemStockSaveUpdate = function (connection, jsonObj, callback) {
    console.log("Inside newGroceryItemStockSaveUpdate...");
    myshopNewItemSaveAndStockUpdate()
    async function myshopNewItemSaveAndStockUpdate() {
        try {
            console.log("1...", new Date().getSeconds());
            let saveUpdateSellerItemQuery = ``
            let itemStatus = ``
            let sellerItemId = 0


            let brandId = jsonObj.brandId ? jsonObj.brandId : null
            jsonObj.packId = jsonObj.packId ? jsonObj.packId : null
            jsonObj.packName = jsonObj.packName ? jsonObj.packName : ""
            let categoryLevel1Id = jsonObj.categoryLevel1 ? jsonObj.categoryLevel1 : null
            let categoryLevel2Id = jsonObj.categoryLevel2 ? jsonObj.categoryLevel2 : null
            let categoryLevel3Id = jsonObj.categoryLevel3 ? jsonObj.categoryLevel3 : null

            jsonObj.itemName = jsonObj.itemName ? jsonObj.itemName.replace(/'/g, "\\'") : "";
            jsonObj.storeName = jsonObj.storeName ? jsonObj.storeName.replace(/'/g, "\\'") : "";
            jsonObj.sellerItemDisplayName = jsonObj.sellerItemDisplayName ? jsonObj.sellerItemDisplayName.replace(/'/g, "\\'") : "";
            jsonObj.brandName = jsonObj.brandName ? jsonObj.brandName.replace(/'/g, "\\'") : "";
            jsonObj.itemDescription = jsonObj.itemDescription ? jsonObj.itemDescription.replace(/'/g, "\\'") : "";
            let image = jsonObj.imagePath
            let imageThumb = jsonObj.imageThumbPath

            jsonObj.nutritionalInfo = jsonObj.nutritionalInfo ? jsonObj.nutritionalInfo.replace(/'/g, "\\'") : ""
            jsonObj.addictiveInfo = jsonObj.addictiveInfo ? jsonObj.addictiveInfo.replace(/'/g, "\\'") : ""
            jsonObj.manufacturerOrPackerAddress = jsonObj.manufacturerOrPackerAddress ? jsonObj.manufacturerOrPackerAddress.replace(/'/g, "\\'") : ""
            jsonObj.manufacturerOrPackerName = jsonObj.manufacturerOrPackerName ? jsonObj.manufacturerOrPackerName.replace(/'/g, "\\'") : ""
            jsonObj.backImage = jsonObj.backImage ? jsonObj.backImage.replace(/'/g, "\\'") : ""
            jsonObj.commonOrGenericNameOfCommodity = jsonObj.commonOrGenericNameOfCommodity ? jsonObj.commonOrGenericNameOfCommodity.replace(/'/g, "\\'") : ""
            jsonObj.importedProductCountryOfOrigin = jsonObj.importedProductCountryOfOrigin ? jsonObj.importedProductCountryOfOrigin.replace(/'/g, "\\'") : ""
            jsonObj.isVeg = jsonObj.isVeg ? jsonObj.isVeg.replace(/'/g, "\\'") : ""


            if (jsonObj.offerText) {
                if (jsonObj.dateFlag == 'false') {
                    jsonObj.isOffer = false
                    jsonObj.netAmount = jsonObj.itemPrice
                }
                else {
                    jsonObj.isOffer = true
                }
                if (jsonObj.isOffer == true && jsonObj.offerPrice && jsonObj.offerPrice > 0) {
                    jsonObj.netAmount = jsonObj.offerPrice
                }
                else {
                    jsonObj.netAmount = jsonObj.itemPrice
                    jsonObj.offerPrice = jsonObj.itemPrice
                }
            }

            else if (!jsonObj.offerText) {
                if (!jsonObj.itemPrice) {
                    jsonObj.itemPrice = jsonObj.mrp
                }
                jsonObj.netAmount = jsonObj.mrp
            }

            let itemNameBrand = ""
            if (brandId != null) {
                itemNameBrand = jsonObj.brandName + " " + jsonObj.itemName + " " + jsonObj.packName + " " + jsonObj.brandName + " " + jsonObj.itemName + "" + jsonObj.packName + "" + jsonObj.packName
            }
            else if (brandId == null) {

                itemNameBrand = jsonObj.itemName + " " + jsonObj.packName + " " + jsonObj.itemName + "" + jsonObj.packName + "" + jsonObj.packName
            }
            let getMasterDataQuery = `select c.id ,name as cityName,(select name from state where id=c.state_id ) as stateName,
        (select region_id from country where id in(select country_id from state where id=c.state_id)) as regionId,
        (select config_value FROM configuration WHERE config_key = 'swapPercentage') as swapPercentage,
        (select name from store where id=?) as storeName,
        (select locality from store where id=?) as locality,
        (select address1 from store where id=?) as storeAddress1,
        (select address2 from store where id=?) as storeAddress2,
        (select unit from pack where id=?) as unit,
        (select unit_type from pack where id=?) as unitType
        from city as c where id =(select city_id from store where id=?);`
            // console.log("getMasterDataQuery.....",getMasterDataQuery)
            let getMasterDataQueryResult = await query(connection, getMasterDataQuery, [jsonObj.storeId, jsonObj.storeId, jsonObj.storeId, jsonObj.storeId, jsonObj.packId, jsonObj.packId, jsonObj.storeId])
            // console.log("getMasterDataQueryResult.....",getMasterDataQueryResult)

            jsonObj.cityId = getMasterDataQueryResult.length > 0 ? getMasterDataQueryResult[0].id : 0
            jsonObj.cityName = getMasterDataQueryResult[0].cityName ? getMasterDataQueryResult[0].cityName : ""
            jsonObj.stateName = getMasterDataQueryResult[0].stateName ? getMasterDataQueryResult[0].stateName : ""
            jsonObj.locality = getMasterDataQueryResult[0].locality ? getMasterDataQueryResult[0].locality : ""
            jsonObj.regionId = getMasterDataQueryResult[0].regionId ? getMasterDataQueryResult[0].regionId : null
            jsonObj.storeName = getMasterDataQueryResult[0].storeName ? getMasterDataQueryResult[0].storeName : ""
            jsonObj.address1 = getMasterDataQueryResult[0].storeAddress1 ? getMasterDataQueryResult[0].storeAddress1 : ""
            jsonObj.address2 = getMasterDataQueryResult[0].storeAddress2 ? getMasterDataQueryResult[0].storeAddress2 : ""
            jsonObj.unit = getMasterDataQueryResult[0].unit ? getMasterDataQueryResult[0].unit : null
            jsonObj.unitType = getMasterDataQueryResult[0].unitType ? getMasterDataQueryResult[0].unitType : ""
            jsonObj.swapPercentage = getMasterDataQueryResult[0].swapPercentage > 0 ? getMasterDataQueryResult[0].swapPercentage : 0
            let regionId = jsonObj.regionId ? jsonObj.regionId : null
            if (jsonObj.itemId) {
                let updateItemQuery = `update item set category_level1_id=?,category_level2_id=?
                    ,category_level3_id=?,brand_id=?,pack_id=?
                     , region_id=?,modified_by= ?,modified_on=now(),
                    name=?,search_names=?,description=?,
                    is_storedig_item_name=?,is_loose_item=?
                     , denomination =?,variation=?,logo_path=?,
                     logo_path_thumb=?,is_approved=true,
                     is_veg=?,nutritional_info=?,addictive_info=?,
                     back_image=?,manufacturer_or_packer_name=?,
                     manufacturer_or_packer_address=?,common_or_generic_name_of_commodity=?,
                     imported_product_country_of_origin=? where id=?;
                     update item_category_group set category_group_id=?,item_id=?,is_active=1 where item_id=?;
                     update item_names set item_id=?,name=?,modified_by=?,modified_on=now() where item_id=?;`
                let val = [categoryLevel1Id, categoryLevel2Id, categoryLevel3Id, brandId, jsonObj.packId, regionId, jsonObj.userId, jsonObj.itemName, jsonObj.searchNames, jsonObj.itemDescription, jsonObj.isMyyShoppItemName,
                    jsonObj.isLoose, jsonObj.denomination, jsonObj.variation, image, imageThumb, jsonObj.isVeg, jsonObj.nutritionalInfo, jsonObj.addictiveInfo, jsonObj.backImage, jsonObj.manufacturerOrPackerName,
                    jsonObj.manufacturerOrPackerAddress, jsonObj.commonOrGenericNameOfCommodity, jsonObj.importedProductCountryOfOrigin, jsonObj.itemId, jsonObj.categoryGroup, jsonObj.itemId, jsonObj.itemId,
                    jsonObj.itemId, itemNameBrand, jsonObj.userId, jsonObj.itemId
                ]
                let updateItemQueryResult = await query(connection, updateItemQuery, val)

            }
            else {
                let wQuery = ``
                let wQueryVal = []
                if (categoryLevel3Id) {
                    wQuery = ` level3.id = ? `
                    wQueryVal.push(categoryLevel3Id)
                }
                else {

                    wQuery = `level3.id is NULL or  level3.id='' `
                }
                console.log("wQuery...", wQuery);
                var checkItemExistQuery = ` select it.id,it.name  
             from item as it 
            inner join brand as b on b.id = ?
            inner join category_level1 as level1 on level1.id = ?
            inner join category_level2 as level2 on level2.id = ?
            inner join category_level3 as level3 on ${wQuery}
            inner join region as re on re.id = ?
            where it.name = ?;`
                // console.log("checkItemExistQuery.....",checkItemExistQuery)
                let checkItemExistQueryResult = await query(connection, checkItemExistQuery, [brandId, categoryLevel1Id, categoryLevel2Id, ...wQueryVal, regionId, jsonObj.itemName])
                // console.log("checkItemExistQueryResult.....",checkItemExistQueryResult)
                if (checkItemExistQueryResult.length > 0) {
                    jsonObj.itemId = checkItemExistQueryResult[0].id
                }
                else {
                    itemStatus = "newItem";
                    let itemSaveQuery = `insert into item(version,category_level1_id,category_level2_id,category_level3_id,brand_id,pack_id,region_id,created_by,created_on,
                name,search_names,description,is_storedig_item_name,is_loose_item,denomination,variation,logo_path,logo_path_thumb,is_approved,is_active,
                is_veg, nutritional_info, addictive_info, back_image, manufacturer_or_packer_name, manufacturer_or_packer_address, common_or_generic_name_of_commodity, imported_product_country_of_origin)
                values(0,?,?,?,?,?,
                 ?,1,now(),?,?,?,?,?,?,
                ?,?,?,1,1,?,?,?,?,?,
                ?,?,?)`
                    console.log("itemSaveQuery....", itemSaveQuery)
                    let itemSaveQueryVal = [categoryLevel1Id, categoryLevel2Id, categoryLevel3Id, brandId, jsonObj.packId, regionId, jsonObj.itemName, jsonObj.searchNames, jsonObj.description, jsonObj.isMyyShoppItemName,
                        jsonObj.isLoose, jsonObj.denomination, jsonObj.variation, image, imageThumb, jsonObj.isVeg, jsonObj.nutritionalInfo, jsonObj.addictiveInfo, jsonObj.backImage, jsonObj.manufacturerOrPackerName,
                        jsonObj.manufacturerOrPackerAddress, jsonObj.commonOrGenericNameOfCommodity, jsonObj.importedProductCountryOfOrigin
                    ]
                    let itemSaveQueryResult = await query(connection, itemSaveQuery, itemSaveQueryVal);
                    console.log("itemSaveQueryResult....", itemSaveQueryResult)
                    jsonObj.itemId = itemSaveQueryResult.insertId

                    var itemCategoryGroupSaveQuery = `insert into item_category_group(version,category_group_id,is_active,item_id)
                values(0,?,1,?);
                insert into item_names(version,item_id,created_by,created_on,name)
                values(0,?,1,now(),?);`
                    //console.log("itemCategoryGroupSaveQuery....",itemCategoryGroupSaveQuery)
                    let itemCategoryGroupSaveQueryResult = await query(connection, itemCategoryGroupSaveQuery, [jsonObj.categoryGroup, jsonObj.itemId, jsonObj.itemId, itemNameBrand]);
                    //console.log("itemCategoryGroupSaveQueryResult....",itemCategoryGroupSaveQueryResult)

                }
            }
            console.log("jsonObj.itemId....", jsonObj.itemId)
            let sellerItemUpdateWhereQuery = ``
            let sellerItemUpdateQuery = `update seller_item set item_id = ${jsonObj.itemId},item_code='${jsonObj.itemCode}',is_active = true, is_approved = true,
        item_name = '${jsonObj.itemName}', modified_on = now(), modified_by =${jsonObj.userId}`
            if (jsonObj.sellerItemId) {
                console.log("if sellerItemId.......");
                sellerItemUpdateWhereQuery = `  where id = ${jsonObj.sellerItemId};`
                saveUpdateSellerItemQuery = sellerItemUpdateQuery + sellerItemUpdateWhereQuery

            }
            else {
                let sellerId = jsonObj.sellerId ? jsonObj.sellerId : `(select seller_id from store where id = ${jsonObj.storeId})`
                console.log("sellerId...", sellerId)
                let checkSellerItemExistQuery = `select id from seller_item where is_active=true and item_id=? and seller_id=? order by id asc limit 1;`
                // console.log("checkSellerItemExistQuery...",checkSellerItemExistQuery)
                let checkSellerItemExistQueryResult = await query(connection, checkSellerItemExistQuery, [jsonObj.itemId, sellerId]);
                //console.log("checkSellerItemExistQueryResult...",checkSellerItemExistQueryResult)
                if (checkSellerItemExistQueryResult.length > 0) {
                    sellerItemId = checkSellerItemExistQueryResult[0].id

                }

                if (sellerItemId > 0) {
                    jsonObj.sellerItemId = sellerItemId;
                    sellerItemUpdateWhereQuery = `  where id = ${jsonObj.sellerItemId};`
                    saveUpdateSellerItemQuery = sellerItemUpdateQuery + sellerItemUpdateWhereQuery
                    console.log("else sellerItemId..with exist.....");
                }
                else {
                    console.log("not exist sellerItemId.......");
                    saveUpdateSellerItemQuery = `insert into seller_item(version, category, city_id, created_by, created_on, is_active, 
                    is_approved, item_id, item_code, item_name, 
                    seller_id, brand, display_name, pack) values 
                    ('0','${jsonObj.sellerItemCategory}',(select city_id from seller where id=${jsonObj.sellerId}),
                    ${jsonObj.userId},now(),1,1,${jsonObj.itemId},'${jsonObj.itemCode}','${jsonObj.itemName}',${jsonObj.sellerId},
                    '${jsonObj.brandName}','${jsonObj.sellerItemDisplayName}','${jsonObj.packName}');`
                }
                // console.log("saveUpdateSellerItemQuery....",saveUpdateSellerItemQuery)
                let saveUpdateSellerItemQueryResult = await query(connection, saveUpdateSellerItemQuery);
                // console.log("saveUpdateSellerItemQueryResult....",saveUpdateSellerItemQueryResult)
                if (itemStatus == "newItem") {
                    sellerItemId = saveUpdateSellerItemQueryResult.insertId
                    jsonObj.sellerItemId = sellerItemId;
                }
            }

            console.log("jsonObj.sellerItemId....", jsonObj.sellerItemId)

            let storeItemStockSaveQuery = ``
            let storeItemStockUpdateWhereQuery = ``
            let subQryField = ``
            if (jsonObj.offerText) {
                jsonObj.offerText = jsonObj.offerText.toString().replace(/'/g, "''")
                subQryField = `,offer_text='${jsonObj.offerText}',offer_price=${parseFloat(jsonObj.offerPrice).toFixed(2)} `
            }
            if (jsonObj.offerFrom) {
                subQryField = subQryField + `,offer_from='${jsonObj.offerFrom}' `
            }
            if (jsonObj.offerTo) {
                subQryField = subQryField + `,offer_to='${jsonObj.offerTo}' `
            }
            let storeItemStockUpdateQuery = `UPDATE store_item_stock set 
        version = version + 1,city_id= ${jsonObj.cityId},is_active = true,is_offer=${jsonObj.isOffer}, 
        item_code='${jsonObj.itemCode}',item_id=${jsonObj.itemId},item_name='${jsonObj.itemName}',item_price ='${jsonObj.itemPrice}'
        ,modified_by=${jsonObj.userId},modified_on=now(),mrp=${jsonObj.mrp},net_amount=${jsonObj.netAmount}, 
        ranking=${jsonObj.rank},seller_item_id=${jsonObj.sellerItemId},stock_quantity=${jsonObj.stockQuantity},
        stock_updated_on = now(),store_id=${jsonObj.storeId},unit='${jsonObj.unit}',unit_type='${jsonObj.unitType}' ,
        is_cancellable =${jsonObj.isCancellable} ,is_returnable=${jsonObj.isReturnable} ,return_window_id='${jsonObj.returnWindow_id}',
        time_to_ship_id='${jsonObj.timeToShipId}' ${subQryField}`

            let newStoreItem = 0
            if (jsonObj.storeItemStockId) {
                console.log("if storeItemStockId.......");

                storeItemStockUpdateWhereQuery = `where id = ${jsonObj.storeItemStockId};`
                storeItemStockSaveQuery = storeItemStockUpdateQuery + storeItemStockUpdateWhereQuery
            }
            else {

                //     let checkStockAlreadyExistQuery = `select id from store_item_stock where city_id=${jsonObj.cityId} 
                // and item_id=${jsonObj.itemId} and seller_item_id=${jsonObj.sellerItemId} and store_id=${jsonObj.storeId} and is_active=true limit 1`
                let checkStockAlreadyExistQuery = `select id from store_item_stock where city_id=? 
            and item_id=? and seller_item_id=? and store_id=? order by id desc limit 1`

                console.log("...checkStockAlreadyExistQuery..", checkStockAlreadyExistQuery)

                let checkStockAlreadyExistQueryResult = await query(connection, checkStockAlreadyExistQuery, [jsonObj.cityId, jsonObj.itemId, jsonObj.sellerItemId, jsonObj.storeId]);

                if (checkStockAlreadyExistQueryResult.length > 0) {
                    jsonObj.storeItemStockId = checkStockAlreadyExistQueryResult[0].id
                    console.log("else storeItemStockId...with exist....", jsonObj.storeItemStockId);
                    storeItemStockUpdateWhereQuery = `where id = ${jsonObj.storeItemStockId};`
                    storeItemStockSaveQuery = storeItemStockUpdateQuery + storeItemStockUpdateWhereQuery


                }
                else {
                    console.log("else storeItemStockId.......", jsonObj.storeItemStockId);
                    let subQueryStoreItemStock = ``
                    if (jsonObj.offerText) {
                        jsonObj.offerText = jsonObj.offerText.toString().replace(/'/g, "''")
                        subQryField = ",offer_text,offer_price "
                        subQueryStoreItemStock = `,'${jsonObj.offerText}',${parseFloat(jsonObj.offerPrice).toFixed(2)} `
                    }
                    if (jsonObj.offerFrom) {
                        subQryField = subQryField + ",offer_from "
                        subQueryStoreItemStock = subQueryStoreItemStock + `,'${jsonObj.offerFrom}' `
                    }
                    if (jsonObj.offerTo) {
                        subQryField = subQryField + ",offer_to "
                        subQueryStoreItemStock = subQueryStoreItemStock + `,'${jsonObj.offerTo}' `
                    }

                    newStoreItem = 1
                    storeItemStockSaveQuery = `INSERT INTO store_item_stock 
                (version,city_id,created_by,created_on,is_active,is_offer,item_code,item_id,
                item_name,item_price,mrp,net_amount,ranking,seller_item_id,stock_quantity,stock_updated_on,
                store_id,unit,unit_type,is_cancellable,is_returnable,return_window_id,time_to_ship_id ${subQryField})
                values
                (0,${jsonObj.cityId},${jsonObj.userId},now(),true,${jsonObj.isOffer}
                ,'${jsonObj.itemCode}',${jsonObj.itemId},'${jsonObj.itemName}',${jsonObj.itemPrice}
                ,${jsonObj.mrp},${jsonObj.netAmount},${jsonObj.rank},${jsonObj.sellerItemId}
                ,${jsonObj.stockQuantity},now(),${jsonObj.storeId},'${jsonObj.unit}','${jsonObj.unitType}' ,
                ${jsonObj.isCancellable},${jsonObj.isReturnable} ,'${jsonObj.returnWindow_id}' , '${jsonObj.timeToShipId}'
                 ${subQueryStoreItemStock}); `

                }

            }
            //  console.log("storeItemStockSaveQuery....",storeItemStockSaveQuery)

            let storeItemStockSaveQueryResult = await query(connection, storeItemStockSaveQuery);
            // console.log("storeItemStockSaveQueryResult....",storeItemStockSaveQueryResult)
            if (newStoreItem == "1") {
                jsonObj.storeItemStockId = storeItemStockSaveQueryResult.insertId
            }
            console.log("jsonObj.storeItemStockId...", jsonObj.storeItemStockId)

            ///////////////////////SWAP ITEM FUNCTION 
            let swapItemMap = " select if((SELECT fn_GetIsSwapItem(0,?,?,?,?,?,?)as a)=true,'true','false') as swapItem; "
            let swapItemMapResult = await query(connection, swapItemMap, [jsonObj.storeItemStockId, jsonObj.cityId, jsonObj.storeId, jsonObj.itemId, jsonObj.netAmount, jsonObj.swapPercentage]);
            console.log("swapItemMap.....", swapItemMap);
            console.log("swapItemMapResult.....", swapItemMapResult);
            let swapItem = swapItemMapResult[0].swapItem == 'true' ? true : false;

            ////////////////STORE ITEM STOK UPDATION (SWAP ITEM)
            let updateQry = `UPDATE store_item_stock set is_swap_item =${swapItem},modified_by=${jsonObj.userId},modified_on=now() where id = ${jsonObj.storeItemStockId};`
            let subQuery = ``
            let subVal = []
            if (jsonObj.categoryLevel3) {
                subQuery = `AND i.category_level3_id = ?`
                subVal.push(jsonObj.categoryLevel3)
            }
            else {
                subQuery = `AND (category_level3_id is NULL or  category_level3_id='')`
            }
            ////////////FIND SWAP ITEMS
            let swapQuery = `select sis.id as storeItemStockId,sis.net_amount AS netAmount,sis.item_id as itemId, 
             if((SELECT fn_GetIsSwapItem(0,sis.id,sis.city_id,sis.store_id,i.id,sis.net_amount,?))=true,'true','false') as swapItemMap 
             FROM item as i 
             INNER JOIN store_item_stock as sis ON sis.item_id = i.id and sis.store_id = ? and sis.city_id = ?
             WHERE i.name = ?
             AND i.category_level1_id = ?
             AND i.category_level2_id = ?
             ${subQuery}`

            /////////////////STORE CATEGORIES
            let storeCategoryQry = `SELECT count(id) as total from store_categories as i 
          WHERE i.store_id = ? and i.category_level1_id = ?
         AND i.category_level2_id = ?
          and i.city_id = ? ${subQuery}`
            let swapQueryVal = [jsonObj.swapPercentage, jsonObj.storeId, jsonObj.cityId, jsonObj.itemName, jsonObj.categoryLevel1, jsonObj.categoryLevel2, ...subVal, jsonObj.storeId, jsonObj.categoryLevel1, jsonObj.categoryLevel2, jsonObj.cityId, ...subVal]

            let swapStoreCategoriesQuery = swapQuery + ";" + storeCategoryQry;

            let swapStoreCategoriesQueryResult = await query(connection, swapStoreCategoriesQuery, [...swapQueryVal]);

            let swapQueryResult = swapStoreCategoriesQueryResult[0]
            let storeCategoryResult = swapStoreCategoriesQueryResult[1]
            for (let i = 0; i < swapQueryResult.length; i++) {
                updateQry = updateQry + `update store_item_stock set is_swap_item = ${swapQueryResult[i].swapItemMap},modified_by=${jsonObj.userId},modified_on=now() where id = ${swapQueryResult[i].storeItemStockId};`
            }

            let storeCategoryInsertQry = ''
            if (storeCategoryResult[0].total == 0) {

                let subQueryField = "",
                    subQueryData = ""
                if (jsonObj.categoryLevel3) {
                    subQueryField = ",category_level3_id "
                    subQueryData = "," + jsonObj.categoryLevel3
                }
                storeCategoryInsertQry = `INSERT INTO store_categories (version, is_active, store_id, category_level1_id, category_level2_id, city_id ${subQueryField}) 
                 values 
                 (0, true, ${jsonObj.storeId}, ${jsonObj.categoryLevel1}, ${jsonObj.categoryLevel2}, ${jsonObj.cityId} ${subQueryData}); `

            }
            else {

            }

            jsonObj.categoryLevel3 = jsonObj.categoryLevel3 ? jsonObj.categoryLevel3 : null

            let seoSlug = `SELECT fn_GetSeoSlug(?,?,?,?,?) as slug;`
            let seoSlugVal = [jsonObj.storeItemStockId, jsonObj.sellerItemDisplayName, jsonObj.brandName, jsonObj.storeName, jsonObj.packName]

            let seoTitle = `SELECT fn_GetSeoTitle(?,?,?,?,?,
        ?,?,?) as title;`
            let seoTitleVal = [jsonObj.sellerItemDisplayName, jsonObj.brandName, jsonObj.packName, jsonObj.netAmount, jsonObj.storeName, jsonObj.locality, jsonObj.cityName, jsonObj.stateName]

            let seoDescription = `SELECT fn_GetSeoDescription(?,?,?,?,
        ?,?,?,?,?,
         ?,?,?,?,?) as description;`
            let seoDescriptionVal = [jsonObj.sellerItemDisplayName, jsonObj.brandName, jsonObj.packName, jsonObj.storeName, jsonObj.itemDescription, jsonObj.netAmount, jsonObj.locality,
            jsonObj.cityName, jsonObj.stateName, jsonObj.categoryLevel1, jsonObj.categoryLevel2, jsonObj.categoryLevel3, jsonObj.address1, jsonObj.address2
            ]
            let deleteQry = `delete from store_item_stock_seo where store_item_stock_id = ?;`
            let deleteQryVal = [jsonObj.storeItemStockId]

            let finalQuery = seoSlug + seoTitle + seoDescription + deleteQry + updateQry + storeCategoryInsertQry;

            let storeItemSeoResult = await query(connection, finalQuery, [...seoSlugVal, ...seoTitleVal, ...seoDescriptionVal, ...deleteQryVal]);


            let storeItemStockSeoQry = `insert into store_item_stock_seo 
        (version,city_id,seo_description,seo_keywords,seo_title,slug,store_item_stock_id) values
        (0,? ,?,'',?,?,?);`
       //   console.log('...storeItemStockSeoQry...',storeItemStockSeoQry,jsonObj.cityId, storeItemSeoResult[2][0].description.replace(/'/g, "\\'"), storeItemSeoResult[1][0].title.replace(/'/g, "\\'"), storeItemSeoResult[0][0].slug.replace(/'/g, "\\'"), jsonObj.storeItemStockId)
          
            let storeItemStockSeoQryResult = await query(connection, storeItemStockSeoQry, [jsonObj.cityId, storeItemSeoResult[2][0].description.replace(/'/g, "\\'"), storeItemSeoResult[1][0].title.replace(/'/g, "\\'"), storeItemSeoResult[0][0].slug.replace(/'/g, "\\'"), jsonObj.storeItemStockId]);
          //  console.log('...storeItemStockSeoQryResult...',storeItemStockSeoQryResult)
          

            const response = {
                success: "1",
                successMessage: "Success",
                errorMessage: ""
            };

            console.log("response....", response);
            callback(response)

            function query(con, sql, params) {
                return new Promise((resolve, reject) => {
                    con.query(sql, params, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }
        }
        catch (error) {
            console.log("error...", error);
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "Something went wrong"
            };
            console.log("response...", response);
            callback(response)
        }

    }

}
module.exports = methods;
