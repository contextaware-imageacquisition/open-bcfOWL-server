const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const fetch = require("node-fetch");
const fuseki = require("../../Utilities/FusekiUtilities");

const User = require("../Models/user");
const { hash } = require("bcrypt");

//TODO: implement authorization grant and remove client grant

exports.auth_get = (req, res, next) => {
  const response = {
    oauth2_auth_url: process.env.SERVER_URL + "/bcf/oauth2/auth",
    oauth2_token_url: process.env.SERVER_URL + "/bcf/oauth2/token",
    oauth2_dynamic_client_reg_url: process.env.SERVER_URL + "/bcf/oauth2/reg",
    http_basic_support: true,
    supported_oauth2_flows: ["client_credentials_grant"],
  };
  res.status(200).json(response);
};

exports.auth_signup = (req, res, next) => {
  User.find({ id: req.body.id })
    .exec()
    .then((user) => {
      var userId = uuid.v4();
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail already registered",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              id: req.body.id,
              name: req.body.name,
              URI: `${req.body.name.replaceAll(" ", "_")}_${userId}`,
              password: hash,
              role: req.body.role,
            });
            user
              .save()
              .then((result) => {
                var myHeaders = new fetch.Headers();
                myHeaders.append(
                  "Content-Type",
                  "application/x-www-form-urlencoded"
                );
                myHeaders.append("Authorization", "Basic " + fuseki.auth());

                var urlencoded = new URLSearchParams();
                urlencoded.append(
                  "update",
                  `
                  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                  PREFIX users: <${process.env.BCF_URL}users/>

                  INSERT {
                  users:${req.body.name.replaceAll(" ", "_")}_${userId}
                      a       foaf:Person ;
                      foaf:mbox <mailto:${req.body.id}> ;
                      foaf:name "${req.body.name}" .
                  } WHERE {
                    ?s ?p ?o
                    FILTER NOT EXISTS { ?s foaf:mbox <mailto:${req.body.id}>} 
                  }
                    `
                );
                console.log(urlencoded);

                var requestOptions = {
                  method: "POST",
                  headers: myHeaders,
                  body: urlencoded,
                  redirect: "follow",
                };

                fetch(process.env.FUSEKI_URL + "users", requestOptions)
                  .then((result) => {
                    console.log(result);
                    if (result.status == 200) {
                      res.status(201).json({
                        id: req.body.id,
                        name: req.body.name,
                        role: req.body.role,
                      });
                    } else {
                      res.status(400).json("error");
                    }
                  })
                  .catch((error) => {
                    res.status(400).json(error);
                  });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    })
    .catch();
};

exports.auth_init_signup = (req, res, next) => {
  User.find({ id: process.env.MONGO_ADMIN_ID })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        console.log("Admin exist");
      } else {
        bcrypt.hash(process.env.MONGO_PASSWORD, 10, (err, hash) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              id: process.env.MONGO_ADMIN_ID,
              name: process.env.MONGO_ADMIN_NAME,
              password: hash,
              role: "admin",
            });
            user
              .save()
              .then((result) => {
                console.log(result);
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    })
    .catch();
};

exports.auth_login = (req, res, next) => {
  //console.log(req.body)
  User.find({ id: req.body.id })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Authentication failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              id: user[0].id,
              URI: user[0].URI,
              name: user[0].name,
              role: user[0].role,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1d",
            }
          );
          return res.status(200).json({
            message: "Authentication successful",
            token: token,
          });
        }
        return res.status(401).json({
          message: "Authentication failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
