var admin = require("firebase-admin");

var serviceAccount = require(process.env.FIREBASESVCACC);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://graineasy-daf5d.firebaseio.com"
});

module.exports = function sendNotifications(message) {
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
}
