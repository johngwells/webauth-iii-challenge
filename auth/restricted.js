const jwt = require("jsonwebtoken");
const secrets = require("../config/secrets");

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  // if (token.startsWith('Bearer ')) {
  //   token = token.slice(7, token.length);
  // }
  console.log(token);
  if (token) {
    jwt.verify(token, secrets.jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Token is not valid." });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(400).json({ 
      message: "This page is only available to authorized users." 
    });
  }
};
