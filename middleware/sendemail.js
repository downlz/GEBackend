const nodemailer = require('nodemailer');
const crypt = require('./crypt');
const encryptedPassword = process.env.EMAILPASS;

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAILUSER,
        pass: ""//crypt.decrypt(encryptedPassword),
    },
});
module.exports = function sendEmail(to, subject, message) {
    const mailOptions = {
        from: '"Graineasy 👻" <orders@graineasy.com>',
        to,
        subject,
        html: message,
    };
    transport.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
        }
    });
};
