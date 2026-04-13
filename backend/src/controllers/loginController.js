import dotenv from "dotenv"
dotenv.config()
import jwt from "jsonwebtoken"

const login = async (req, res) => {
    const { username, password } = req.body
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" })

        }
        const secret = process.env.JWT_SECRET
        if (!secret) {
            return res.status(500).json({ message: "JWT_SECRET não configurado no servidor" })
        }

        const token = jwt.sign({ username }, secret, { expiresIn: "1h" })
        return res.status(200).json({ message: "Login realizado com sucesso", token })
    } catch (error) {
        console.error("Erro no login:", error)
        return res.status(500).json({ message: "Erro interno do servidor" })
    }
}

export default login