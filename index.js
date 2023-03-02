const express = require("express");
const app = express();
const dotenv = require("dotenv");
const user = require("./Router/forgetRouter");
const cors = require("cors");
const mongo = require("./connect");


dotenv.config();
mongo.connect();
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.use('/users', user );

app.listen(7070);