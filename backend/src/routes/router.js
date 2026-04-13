import express from "express"
import registroUser from "../controllers/registerController.js"
import login from "../controllers/loginController.js"
import auth from "../middleware/auth.js"


const router = express.Router()

router.get("/", auth, (req, res) => {
  res.status(200).json({
    message: "Acesso autorizado",
    user: req.user ?? null,
  })
})

router.post("/register", registroUser)
router.post("/login", login)

export default router