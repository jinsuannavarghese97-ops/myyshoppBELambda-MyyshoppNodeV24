var AWS = require('aws-sdk');

const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

var methods = {};

methods.pushNotification = async function(client, jsonObj, callback) {
  let awsAcessKeyId = ""
  let awsSecretKey = ""
  const clientNew = new SecretsManagerClient();
  const response = await clientNew.send(
    new GetSecretValueCommand({
      SecretId: 'dev/key',
    }),
  );
  let SecretString = response.SecretString

  const secretObject = JSON.parse(SecretString);

  if (response.SecretString) {
    awsAcessKeyId = secretObject.access
    awsSecretKey = secretObject.secret

  }
  AWS.config.update({
    accessKeyId: awsAcessKeyId,
    secretAccessKey: awsSecretKey,
    region: 'us-east-1',

  });
  var params = {
    Name: "test",
    Platform: "GCM", //or APNS (Apple ) or ADM (Amazon)
    Attributes: { // required
      PlatformCredential: 'AIzaSyDMspbRUN1WD0eDXinVxXEtS5jxOicIQNE' // API key which is used to register your app in play store
      //http://docs.aws.amazon.com/sns/latest/api/API_SetPlatformApplicationAttributes.html => for more info about Attributes
    }
  };
  console.log("222222222222222222222")
  /*
      Create PlatformApplication Where you can register users mobile endpoints .
  */
  var sns = new AWS.SNS();

  console.log("333333333333333333")
  params = {
    PlatformApplicationArn: "arn:aws:sns:us-east-1:196395329624:app/GCM/OrthopodOnlinePatientAndroid-1554447324688", // your PlatformApplication ARN    STRING
    Token: "dsog-GdcYuI:APA91bHvw-UIvTit6GbZ644xmlyCS7CKUDJG3HNXWC5KOTgOupR66Umbt7x7mwtN6-x1xXEEilNep5SCsltpSB0fw0JCTB_UiJ3esfO0nzZLmQ_j-EW3XbiA246YiudfcBIw3ew-KPru", // every phone is given token when phone download and register to your app.   STRING
    CustomUserData: "String_value", // you can write any thing about user so that you can identify him
    Attributes: {
      //optional
      //http://docs.aws.amazon.com/sns/latest/api/API_SetEndpointAttributes.html => for more info
    }
  }
  console.log("444444444444444444444")
  /*
      It will register mobile to platform application so that 
      if we send notification to platform application it 
      will send notifications to all mobile endpoints registered
  */


  //creates topics where users can subscribe to the topics

  // publish to particular topic ARN or to endpoint ARN

  var payload = {
    default: 'Hello World',
    APNS: {
      aps: {
        alert: 'Hello World',
        sound: 'default',
        badge: 1
      }
    }
  };


  // params = {
  //     Message: payload, /* required */
  //      MessageAttributes: {
  //         someKey: {
  //             DataType: 'STRING_VALUE', /* required */
  //             BinaryValue: new Buffer('...') || 'STRING_VALUE',
  //             StringValue: 'STRING_VALUE'
  //         },
  //     },
  //     //Message: payload, 
  //     MessageStructure: 'json',
  //     TargetArn: 'arn:aws:sns:us-east-1:196395329624:endpoint/GCM/OrthopodOnlinePatientAndroid-1554447324688/2348f3e1-f4ac-3340-8361-3d28a5e70045',
  //     TopicArn: 'STRING_VALUE'
  // };
  var message = {
    "success": "1",
    "result": {
      "notifications": [{
        "appDetailsId": "1",
        "customData": {
          "orderId": "180878",
          "sellerId": "3644",
          "deleverySlot": "03/24/2020",
          "timeStamp": "24 Mar 2020 08:43 PM",
          "type": "orderConfirmation"
        },
        "dateTime": "24 Mar 2020 08:43 PM",
        "id": "4587",
        "isRead": "1",
        "notificationImage": "https://someImage.png",
        "title": "Order Number 123 has been shipped",
        "message": "You Order Id: 123 has been shipped today at 8:00 pm",
        "type": "orderConfirmation"
      }]
    },
    "errorMessage": "",
    "successMessage": "Notification fetched successfully"
  }
  console.log('sending push');
  sns.publish({
    Message: message.toString(), // Required
    //MessageStructure: 'json',
    TargetArn: 'arn:aws:sns:us-east-1:196395329624:endpoint/GCM/OrthopodOnlinePatientAndroid-1554447324688/2348f3e1-f4ac-3340-8361-3d28a5e70045' // Required
  }, function(err, data) {
    if (err) {
      console.log(err, ' err push');
      return err;
    }

    console.log('push sent');
    console.log(data);
    callback(null, data)

  });



}
module.exports = methods;
