require('dotenv').config();

const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');

if (!process.env.user || !process.env.pass || !process.env.to) {
  console.log(
    '\x1b[31m',
    'Please provide "user", "pass" and "to" in .env file.\nCheck .env.example for reference\n',
    '\x1b[0m'
  );

  return process.exit(0);
}

const skipeedTemplates = [];
const sendedTemplates = [];

const sendEmail = async (template) =>
  new Promise((resolve) => {
    fs.readFile(
      path.join(__dirname, `./templates/${template}.html`),
      'utf-8',
      (err, data) => {
        if (err) {
          skipeedTemplates.push(`${template}.html`);

          console.log(
            '\x1b[33m',
            `Can't find "${template}.html" in "templates" folder. Skipping...`,
            '\x1b[0m'
          );

          return resolve();
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
          subject: `Your Email Template ${template}.html`,
          html: data,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return;
          }

          sendedTemplates.push(`${template}.html`);
          resolve(template);
        });
      }
    );
  });

const start = async () => {
  const promises = [];

  const directoryPath = path.join(__dirname, 'templates');
  const templates = process.env.templates.length
    ? process.env.templates?.split(',')?.map((template) => template.trim()) ??
      []
    : [];

  if (!templates || !templates?.length) {
    await new Promise((resolve) =>
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.log('Unable to scan templates directory: ' + err);
          resolve();
        }

        files.forEach(function (file) {
          if (file.includes('.htm')) {
            templates.push(file);
          }
        });

        resolve();
      })
    );
  }

  for (let template of templates) {
    if (template.includes('.html')) {
      template = template.replace('.html', '');
    }

    promises.push(sendEmail(template));
  }

  await Promise.all(promises);

  console.table({
    '\x1b[32mSended templates:\x1b[0m': sendedTemplates,
    '\x1b[33mSkipped templates:\x1b[0m': skipeedTemplates,
  });

  process.exit(0);
};

start();
