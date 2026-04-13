import dotenv from "dotenv"
import express from "express"
import router from "./routes/router.js"
import cors from "cors"


dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(router)


app.listen(3000, () => {
  console.log("Server is running on port 3000")
})