const mongo = require("../connect");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const express = require("express");
const { ObjectId } = require("mongodb");

exports.forgetpassword = async (req, res, next) => {
  try {
    const existuser = await mongo.selectedDb
      .collection("users-data")
      .findOne({ email: req.body.email });
    if (!existuser) {
      return res.status(400).send({ msg: "Email not found" });
    }
    async function generateRandomString(length, email) {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      const random = await mongo.selectedDb
        .collection("users-data")
        .updateMany({ email: email }, { $set: { code: result } });
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "syedskipper@gmail.com",
          pass: "stvsitpcaxckwkte",
        },
      });

      var mailOptions = {
        from: "syedskipper@gmail.com",
        to: `${existuser.email}`,
        subject: `Hi ${existuser.firstname}`,
        html: `We have received a request to reset your password. Your code is ${result} valid for 10 minutes only. Don't share wiht anyone`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      return res.send({ msg: "Code is send to your registered email id " });
    }
    const randomString = generateRandomString(10, req.body.email); // Generate a 10-character random string
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.getcode = async (req, res, next) => {
  // console.log(req.body)
  try {
    const match = await mongo.selectedDb
      .collection("users-data")
      .findOne({ code: req.body.code });
    if (match.code === req.body.code) {
      res.status(200).send({ msg: "code matched", id: match._id });
    }
  } catch (error) {
    res.send({ msg: "Please enter the valid code" });
  }
};

exports.resetpassword = async (req, res) => {
  const { password } = req.body;
  try {
    //check if this id exist in database
    const existuser = await mongo.selectedDb
      .collection("users-data")
      .findOne({ _id: ObjectId(req.body.id) });
    if (!existuser) {
      return res.status(400).send({ msg: "User Not Exist" });
    }
    const checkpassword = (password, confirmpassword) => {
      return password !== confirmpassword ? false : true;
    };
    const isSamePassword = checkpassword(
      req.body.password,
      req.body.confirmpassword
    );
    if (!isSamePassword) {
      return res.status(400).send({ msg: "password doesn't match" });
    } else {
      delete req.body.confirmpassword;
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const updatePassword = await mongo.selectedDb
        .collection("users-data")
        .updateOne(
          { email: existuser.email },
          { $set: { password: encryptedPassword } },
          function (result) {
          }
        );
      const removecode = await mongo.selectedDb
        .collection("users-data")
        .updateOne({ email: existuser.email }, { $unset: { code: "" } });
       res.send({ message: "Password updated and code deleted" });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
};
