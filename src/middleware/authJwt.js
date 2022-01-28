const jwt = require("jsonwebtoken");

exports.authJwt = (req, res, next) => {
  const authHeader = req.header("Authorization")
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(400).send({ message: "No token provided!" });
  }

  try {
    const verifiedId = jwt.verify(token, process.env.SECRET_TOKEN);
    req.id = verifiedId;
    next(); 
  } catch (error) {
    console.log(error)
    res.status(401).send({ message: "Unauthorized!" });
  }
};