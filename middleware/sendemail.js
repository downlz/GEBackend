const nodemailer = require('nodemailer');
const crypt = require('./crypt');
const encryptedPassword = process.env.EMAILPASS;

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAILUSER,
        // pass: crypt.decrypt(encryptedPassword), // Take a note of this
        pass: process.env.EMAILPASS
    },
});
module.exports = function sendEmail(to, cc, bcc,subject, message) {
    const mailOptions = {
        from : process.env.SENDEMAILUSER,
        to,
        cc,
        bcc,
        subject,
        html: message,
    };
    transport.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
        }
    });
};
