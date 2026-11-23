const queryExecution = require('../queryExecution');
const methods = {};
methods.saveAndMapItem = function (client, jsonObj, event, callback) {
  if (event.timeZone) {
    let num = event.timeZone.slice(1);
    let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
    let hours = (num / 60);
    let rhours = Math.floor(hours);
    rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    event.timeZone = symbol + rhours + ':' + rminutes
    event.time = symbol + num
  }
  event.time = event.time ? event.time : '+330'
  event.timeZone = event.timeZone ? event.timeZone : '+05:30'

  event.itemName = event.itemName ? event.itemName.replace(/'/g, "\\'") : "";
  event.brandName = event.brandName ? event.brandName.replace(/'/g, "\\'") : "";

  /*" UPDATE seller_item set item_id = "+event.itemId+", item_name = '"+event.itemName+"', is_active = true, is_approved = true, modified_by = "+event.userId+", modified_on = CONVERT_TZ (now(), '+00:00','"+event.timeZone+"') where id = "+event.sellerItemId+"; "+
            " UPDATE store_item_stock set item_name = '"+event.itemName+"', modified_by = "+event.userId+", modified_on = CONVERT_TZ (now(), '+00:00','"+event.timeZone+"') where seller_item_id = "+event.sellerItemId+"; "+ */
  let qry = `
        SELECT 
          i.name AS itemName, 
          p.name AS packName, 
          IF(b.name IS NULL, '', b.name) AS brandName, 
          IF(i.is_storedig_item_name = true, 'true', 'false') AS isStoreDigItemName 
        FROM 
          item AS i 
        INNER JOIN 
          pack AS p ON i.pack_id = p.id 
        LEFT JOIN 
          brand AS b ON i.brand_id = b.id 
        WHERE 
          i.id = ?;
      
        SELECT 
          GROUP_CONCAT(item_name SEPARATOR ' ') AS itemName 
        FROM 
          seller_item 
        WHERE 
          (id = ? OR item_id = ?);
      
        SELECT 
          item_id AS itemId 
        FROM 
          seller_item 
        WHERE 
          id = ?;
      `;

  let qryParams = [
    event.itemId,
    event.sellerItemId,
    event.itemId,
    event.sellerItemId
  ];

  queryExecution.queryExecution(client, jsonObj, event, qry, qryParams, function (response) {
    if (response.success == '0') {
      callback(response);
    }
    let resultData = response.result
    event.packName = resultData[0][0].packName
    event.isStoreDigItemName = resultData[0][0].isStoreDigItemName
    event.sellerItemItemId = resultData[2][0].itemId
    let itemName = resultData[0][0].itemName
    let itemNameChange = ""
    if (event.brandName) {
      itemNameChange = event.brandName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
        event.itemName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
        event.packName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
        event.brandName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') +
        event.itemName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') +
        event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') + " " +
        event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '')
    }
    else {
      itemNameChange = event.itemName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
        event.packName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
        event.itemName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') +
        event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') + " " +
        event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '')
    }
    let itemNameToBeUpdated = itemNameChange
    let sellerItemNames = resultData[1][0].itemName

    let sellerItemNameSplit = sellerItemNames.split(' ')
    let itemNameSplit = itemNameChange.split(' ')
    for (let i = 0; i <= sellerItemNameSplit.length; i++) {
      if (sellerItemNameSplit.length > 0 && i < sellerItemNameSplit.length) {
        let matchCount = 0
        for (let j = 0; j < itemNameSplit.length; j++) {
          if ((sellerItemNameSplit[i].replace(/[^\w]/gi, '').replace(/_/gi, '') != (itemNameSplit[j]))) {
            matchCount = matchCount + 1
          }
        }
        if (matchCount == itemNameSplit.length) {
          itemNameToBeUpdated = itemNameToBeUpdated + " " + sellerItemNameSplit[i].toString().toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '')
        }
      }
      else if (sellerItemNameSplit.length > 0 && i == sellerItemNameSplit.length) {
        let subQry = "";
        let subQryParams = [];
        event.displayName = event.isStoreDigItemName == true ? itemName.replace(/'/g, "\\'") : event.itemName
        if (event.sellerItemItemId) {
          subQry = `
            UPDATE store_item_stock 
            SET 
              is_active = false, 
              modified_by = ?, 
              modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
            WHERE 
              seller_item_id = ?;
          `;

          subQryParams = [
            event.userId,
            event.timeZone,
            event.sellerItemId
          ];

        }

        let query = `
          UPDATE seller_item 
          SET 
            display_name = ?, 
            item_id = ?, 
            item_name = ?, 
            is_active = true, 
            is_approved = true, 
            modified_by = ?, 
            modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
          WHERE 
            id = ?;

          UPDATE item_names 
          SET 
            name = ?, 
            modified_by = ?, 
            modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
          WHERE 
            item_id = ?;
          
          ${subQry}
        `;

        let queryParams = [
          event.displayName,
          event.itemId,
          event.itemName,
          event.userId,
          event.timeZone,
          event.sellerItemId,

          itemNameToBeUpdated.replace(/'/g, "\\'"),
          event.userId,
          event.timeZone,
          event.itemId,
          ...subQryParams
        ];


        queryExecution.queryExecution(client, jsonObj, event, query, queryParams, function (response) {
          if (response.success == '0') {
            callback(response);
          }
          else {
            response.result = []
            response.successMessage = "Item name updated successfully."
            callback(response);
          }
        });
      }
      else {
        const responseData = {
          success: "1",
          result: [],
          successMessage: "Item name updated successfully.",
          errorMessage: ""
        }
        callback(responseData);
      }
    }
  });
}
module.exports = methods;