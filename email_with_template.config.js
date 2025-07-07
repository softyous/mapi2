const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "mail.valleysideacdemy.com",
    port: 465,
    secure: true,
    auth: {
        user: "info@valleysideacdemy.com",
        pass: "?SjP*%^HAXf?"
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Transporter configuration error:', error);
    } else {
        console.log('Transporter is ready to send emails');
    }
});

const sendEmail = async (recipientEmail, emailSubject, emailMessage) => {
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #dfdfd6;
                margin: 0;
                padding: 0;
            }
            .container{
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .sub-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: #000000;
                color: #ffffff;
                text-align: center;
            }
            .header img {
                width: 50%;
                margin: 20px auto 10px auto;
            }
            .subject{
                width: 100%;
                padding-top: 20px;
                padding-bottom: 20px;
                background-color: #f4f4f4;
                color: #000000;
            }
            .content {
                width: 100%;
                text-align: center;
                font-size: 16px;
                line-height: 1.5;
                color: #333;
            }
            .code {
                font-size: 20px;
                font-weight: 400;
                color: #000000;
                padding: 15px;
                border-radius: 5px;
                display: inline-block;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                font-size: 14px;
                color: #777;
                text-align: center;
                padding: 20px;
                background: #f4f4f4;
            }
            @media (max-width: 600px) {
                .container {
                    width: 90%;
                    margin: 10px auto;
                }
                .content {
                    font-size: 14px;
                }
                .code {
                    font-size: 16px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="sub-container">
                <div class="header">
                    <h1 class="subject">${emailSubject}</h1>
                </div>
                <div class="content">
                    <div class="code">${emailMessage}</div>
                </div>
                <div class="footer">
                    <p>&copy; 
                    <script>
                        ${new Date().getFullYear()} Valley Side Academy Masajja Kikajjo Primary School. All rights reserved.
                    </script> 
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: "Valley Side Academy Masajja Kikajjo Primary School <kiggundubrevin@gmail.com>",
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return info; // Return the info object on success
    } catch (error) {
        console.error('Error occurred during email sending process:', error);
        throw error; // Rethrow the error so it can be caught by the caller
    }
};

module.exports = {
    transporter,
    sendEmail,
};