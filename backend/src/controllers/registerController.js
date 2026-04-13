import bcrypt from "bcrypt"
import dotenv from "dotenv"
import pool from "../config/db.js"

dotenv.config()

const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(password, salt)
}

const registroUser = async (req, res) => {
    const { username, email, password } = req.body

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres" })
        }

        const hash = await passwordHash(password)

        const sql = `
    INSERT INTO users (username, email, password)
    VALUES (?, ?, ?)
  `

        const [result] = await pool.query(sql, [username, email, hash])

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            insertedId: result.insertId
        })
    } catch (error) {
        console.error('Erro no register:', error)
        res.status(500).json({ message: 'Erro interno do servidor' })
    }

}

export default registroUser