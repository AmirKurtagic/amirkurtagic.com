require("dotenv").config()
const express = require("express");

const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const presses = require("./presses");
const $ = require("jquery");
const https = require("https");
var http = require("http");

const handsFullOfHappiness = require("./handsFullOfHappiness");
const randomInspiration = require("./randomInspiration");
const theRooftopsOfSarajevo = require("./theRooftopsOfSarajevo");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
app.engine('html', require('ejs').renderFile);

var messages = {
  fullName: "",
  email: "",
  subject: "",
  message: ""
};

const paintingsAll = [].concat(handsFullOfHappiness, randomInspiration, theRooftopsOfSarajevo);

const collectionOne = "hands-full-of-happiness";
const collectionTwo = "the-rooftops-of-sarajevo";
const collectionThree = "random-inspiration";
const collectionAll = "paintings";

setInterval(function() {
    http.get("http://secret-inlet-50666.herokuapp.com");
}, 300000);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
  messages = {};
});

app.post("/subscribe", function(req, res) {

  const subFirstName = req.body.subFirstName;
  const subLastName = req.body.subLastName;
  const subEmail = req.body.subEmail;

  const data = {
    members: [{
      email_address: subEmail,
      status: "subscribed",
      merge_fields: {
        FNAME: subFirstName,
        LNAME: subLastName
      }
    }]
  };

  const jsonData = JSON.stringify(data);

  const url = "https://us7.api.mailchimp.com/3.0/lists/7ab58a05d3";

  const options = {
    method: "POST",
    auth: process.env.APIMAILCHIMP
  }

  const request = https.request(url, options, function(response) {

    if(response.statusCode === 200) {
      res.render("subscribed", {subFirstName: subFirstName, subLastName:subLastName});
    } else {
      res.render("subscribederror", {subFirstName: subFirstName, subLastName:subLastName});
    }

    response.on("data", function(data) {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();

});

app.post("/contact", function(req, res) {

  messages.fullName = req.body.fName;
  messages.message = req.body.message;
  messages.subject = req.body.subject;
  messages.email = req.body.email;

  const output = `
   <p>You have a new message.</p>
   <h3>Contact Details:</h3>
   <ul>
     <li>Name: ${messages.fullName}</li>
     <li>Email: ${messages.email}</li>
     <li>Subject: ${messages.subject}</li>
   </ul>
   <h3>Message:</h3>
   <p>${messages.message}</p>
 `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: true,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.HOTMAIL, // generated ethereal user
      pass: process.env.PASS // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // send mail with defined transport object
  let mailOptions = {
    from: process.env.HOTMAIL, // sender address
    to: process.env.GMAIL, // list of receivers
    subject: messages.subject, // Subject line
    text: messages.message, // plain text body
    html: output
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
      res.render("emailerror", {
        fullName: messages.fullName
      });
      messages = {};
    } else {
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.render("emailsent", {
        fullName: messages.fullName
      });
      messages = {};
    }
  });
});

app.get("/press", function(req, res) {
  res.render("press", {presses: presses});
});

app.get("/exhibitions", function(req, res) {
  res.render("exhibitions");
});

app.get("/:adress", function(req, res) {

  const adressName = _.kebabCase(req.params.adress);
    //if (adressName === collectionOne) {
    // res.render("hands-full-of-happiness", {handsFullOfHappiness:handsFullOfHappiness});} else
  if (adressName === collectionTwo) {
    res.render("the-rooftops-of-sarajevo", {theRooftopsOfSarajevo:theRooftopsOfSarajevo});
  } else if (adressName === collectionThree) {
    res.render("random-inspiration", {randomInspiration:randomInspiration});
  } else if (adressName === collectionAll) {
    res.render("paintings", {paintingsAll:paintingsAll});
  } else {
    res.render("error");
    return;
  }
});

app.listen(process.env.PORT || 3000 || "www.amirkurtagic.com" , function() {
  console.log("Server started on port");
});
