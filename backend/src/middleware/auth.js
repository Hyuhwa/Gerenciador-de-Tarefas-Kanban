import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

/**
 * Middleware de proteção de rota.
 * Espera JWT em `Authorization: Bearer <token>`.
 * Se não houver token (ou for inválido/expirado), redireciona para `/login`.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.redirect("/login")
  }

  const token = authHeader.split(" ")[1]
  const secret = process.env.JWT_SECRET

  if (!secret) {
    // Se o servidor não estiver configurado corretamente, trate como não autenticado
    return res.redirect("/login")
  }

  try {
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    return next()
  } catch {
    return res.redirect("/login")
  }
}

export default auth
