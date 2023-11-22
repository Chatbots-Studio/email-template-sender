require('dotenv').config();

const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');

if (
  !process.env.user ||
  !process.env.pass ||
  !process.env.to ||
  !process.env.templates
) {
  console.log(
    'Please provide user, pass & to in .env file. Check .env.example for reference'
  );

  return process.exit(1);
}

const sendEmail = (template) => {
  if (template.includes('.html')) {
    template = template.replace('.html', '');
  }

  fs.readFile(
    path.join(__dirname, `./templates/${template}.html`),
    'utf-8',
    (err, data) => {
      if (err) {
        console.log(
          `Posibly you forget to put your template in "templates/${template}.html or set name in .env"\n`
        );

        return process.exit(1);
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
      });

      const mailOptions = {
        from: process.env.user,
        to: process.env.to,
        subject: 'Sending Email Template using Node.js',
        html: data,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(
            `Email template "${template}.html" sent: ` + info.response
          );
        }
      });
    }
  );
};

const templates = process.env.templates
  .split(',')
  .map((template) => template.trim());

for (let i = 0; i < templates.length; i++) {
  sendEmail(templates[i]);
}
