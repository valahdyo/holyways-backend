const express = require("express")

const router = express.Router()

//Controller
const { loginUser, registerUser, checkAuth } = require("../controllers/auth")
const {
  getUsers,
  getUser,
  deleteUser,
  getFundByUser,
  updateUser,
} = require("../controllers/user")
const {
  getFunds,
  getFund,
  addFund,
  updateFund,
  deleteFund,
  updateUserDonate,
} = require("../controllers/fund")
const {
  addTransaction,
  updateTransactionStatus,
} = require("../controllers/transaction")
// const { Testing } = require("../controllers/testing")

//Middleware
const { checkDuplicateEmail } = require("../middleware/verifyRegister")
const { authJwt } = require("../middleware/authJwt")
const { uploadFile } = require("../middleware/uploadFile")
//Route Auth Controller
router.get("/check-auth", authJwt, checkAuth)
router.post("/login", loginUser)
router.post("/register", checkDuplicateEmail, registerUser)

//Route User Controller
router.get("/users", getUsers)
router.get("/user/:id", getUser)
router.delete("/user/:id", deleteUser)
router.get("/user/fund/:id", authJwt, getFundByUser)
router.patch("/user", authJwt, uploadFile("profileImage"), updateUser)

//Route Fund Controller
router.get("/funds", getFunds)
router.get("/fund/:id", getFund)
router.post("/fund", authJwt, uploadFile("thumbnail"), addFund)
router.patch("/fund/:id", authJwt, uploadFile("thumbnail"), updateFund)
router.patch(
  "/fund/:idFund/user/:idUser/transaction/:idTransaction",
  authJwt,
  uploadFile("proofAttachment"),
  updateUserDonate
)
router.delete("/fund/:id", authJwt, deleteFund)

//Route Transaction Controller
router.post(
  "/transaction/:idFund",
  authJwt,
  uploadFile("proofAttachment"),
  addTransaction
)
router.patch("/transaction/:idTransaction", authJwt, updateTransactionStatus)
// router.get("/testing", Testing)

module.exports = router
