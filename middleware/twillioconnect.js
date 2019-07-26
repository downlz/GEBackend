// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
const accountSid = 'ACeca183e1cc9f3f9f5ac242f9a0c27ecf';
const authToken = process.env.TWILIOAUTH;
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        from: 'whatsapp:+14155238886',
        body: 'Hello there!',
        to: 'whatsapp:+15005550006'
    })
    .then(message => console.log(message.sid));
