const auth = require('../middleware/auth');
// const logger = require('../startup/logger');
const permit = require('../middleware/permissions');
const sendNotifications = require('../middleware/fcm');
const {Order, validate} = require('../models/order');
const {Taxrate} = require('../models/taxrates');
const {Item} = require('../models/item');
const {Unit} = require('../models/unit');
const {GroupbuyingList} = require('../models/gblist');
const {Bargain} = require('../models/bargain');
const {Auction} = require('../models/auction');
const {User} = require('../models/user');
const {State} = require('../models/state');
const {City} = require('../models/city');
const {Address, validateAddress} = require('../models/address');
const mongoose = require('mongoose');
// const {ObjectId} = require('mongodb');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.post('/', async (req, res) => {    
    // This registration token comes from the client FCM SDKs.
// var registrationToken = 'e2D8wUCeHTE:APA91bHrtgPjTTYFkGAkCI7-9ZL8P6-32D--F8a40Fe0nbb-o9tw_wJlS5BGwrZnCNylxCeknSUn_sQc87HegwxeKUks28JYCpzjvsdS4xcwgPTiH0ojB1E5pF-kMeJjELS_sdoMJFgW';

// var message = {
//     notification: {
//         title: '$GOOG up 2.43% on the day',
//         body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
//       },
// //   data: {
// //     score: '850',
// //     time: '2:45'
// //   },
//   token: registrationToken
// };
const userid = await User.findById(req.body.userId);
  if (!userid) return res.status(400).send('Invalid User');

var message = {
  notification: {
      title: 'Text Message',
      body: 'I am testing FCM Notifications',
      image: "https://ibin.co/2t1lLdpfS06F.png",
    },
    data : {
        id: '1',
        type: 'BargainDetail',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        title: JSON.stringify(req.body.title),
        body: JSON.stringify(req.body.body),
        //  "status": "done",
        image: "https://ibin.co/2t1lLdpfS06F.png",
    },
token: userid.fcmkey
};

// Send a message to the device corresponding to the provided
// registration token.
// admin.messaging().send(message)
//   .then((response) => {
//     // Response is a message ID string.
//     console.log('Successfully sent message:', response);
//     res.status(200).send({
//         message: 'Success'
//     });
//   })
//   .catch((error) => {
//     console.log('Error sending message:', error);
//     res.status(400).send('Invalid notification.');
//   });
sendNotifications(message);
res.status(200).send({
            message: 'Success'
        });
});

router.post('/fcm', async (req, res) => {    
  
const userid = await User.findById(req.body.userId);
if (!userid) return res.status(400).send('Invalid User');

const message = querystring.stringify({
'notification': {
    'title': 'Text Message',
    'body': 'I am testing FCM Notifications',
    'image': "https://ibin.co/2t1lLdpfS06F.png",
  },
  "priority": "high",
  'data' : {
      'id': '1',
      'type': 'BargainDetail',
      'click_action': 'FLUTTER_NOTIFICATION_CLICK',
      'title': JSON.stringify(req.body.title),
       'body': JSON.stringify(req.body.body),
      'image': "https://ibin.co/2t1lLdpfS06F.png",
  },
token: userid.fcmkey
});

// const options = {
//   hostname: 'https://fcm.googleapis.com/fcm/',
//   // port: 80,
//   path: '/send',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Content-Length': Buffer.byteLength(message),
//     'Authorization' : "key=AAAAuBo2w28:APA91bEQbB55SGlwrT6E7DSD2X0Qdo0h3GiQb9_mfCx2P8WBnBNYiKXF-s64E5BYDA-BJz7God6yFwTK25obuF_5-a8JLpn-cr5FR07-EQoyFLoGehorY1ggsBNoIZ4xRgtH6pACbWh5"
//   }
// };

// const req = http.request(options, (res) => {
//   console.log(`STATUS: ${res.statusCode}`);
//   console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//   res.setEncoding('utf8');
//   res.on('data', (chunk) => {
//     console.log(`BODY: ${chunk}`);
//   });
//   res.on('end', () => {
//     console.log('No more data in response.');
//   });
// });

// req.on('error', (e) => {
//   console.error(`problem with request: ${e.message}`);
// });

// // Write data to request body
// req.write(postData);
// req.end();

// sendNotifications(message);
res.status(200).send({
          message: 'Success'
      });
});

router.post('/addtopic/:topicid', [auth], async (req, res) => {
  var registrationTokens = [
    'e1yzCU1Po8M:APA91bGuduUlSKTczP5K76Xuw_PzT789dr9zXR-plMwqrEZ0JHR-h1sWR6IUR5C83gisRvbTBzU9sI_3nuVWJUPyyWed-YM8nYsmI7AELxRKcdy4MdrNVaTUsLlxcuN6DPtJ7K6pXzQ3',
    'YOUR_REGISTRATION_TOKEN_n'
  ];

  admin.messaging().subscribeToTopic(registrationTokens, req.params.topicid)
  .then(function(response) {
    // See the MessagingTopicManagementResponse reference documentation
    // for the contents of response.
    console.log('Successfully subscribed to topic:', response);
  })
  .catch(function(error) {
    console.log('Error subscribing to topic:', error);
  });
  res.status(200).send({
    message: 'Success'
});
});

router.put('/removefromtopic/:topicid', [auth], async (req, res) => {
  var registrationTokens = [
    'e1yzCU1Po8M:APA91bGuduUlSKTczP5K76Xuw_PzT789dr9zXR-plMwqrEZ0JHR-h1sWR6IUR5C83gisRvbTBzU9sI_3nuVWJUPyyWed-YM8nYsmI7AELxRKcdy4MdrNVaTUsLlxcuN6DPtJ7K6pXzQ3',
    'YOUR_REGISTRATION_TOKEN_n'
  ];

  admin.messaging().unsubscribeFromTopic(registrationTokens, req.params.topicid)
  .then(function(response) {
    // See the MessagingTopicManagementResponse reference documentation
    // for the contents of response.
    console.log('Successfully unsubscribed from topic:', response);
  })
  .catch(function(error) {
    console.log('Error unsubscribing from topic:', error);
  });

  res.status(200).send({
    message: 'Success'
});
});

module.exports = router;
