import API from "../../services/API.js";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await API.post("/register", formData);

      setMessage(response.data.message);

      setFormData({
        username: "",
        email: "",
        password: "",
      });

      navigate("/login");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erro ao cadastrar usuário"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center py-10">
        
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">

          {/* Lado esquerdo */}
          <div className="hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
                Workspace
              </p>
              <h1 className="mt-4 text-4xl font-bold">
                Crie sua conta
              </h1>
              <p className="mt-4 text-sm text-blue-100">
                Comece a organizar suas tarefas agora com um modelo de tarefas totalmente ágil.
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
              <p className="text-sm text-blue-50">
                Gerencie tarefas, acompanhe progresso e aumente produtividade.
              </p>
            </div>
          </div>

          {/* Lado direito */}
          <div className="p-6 sm:p-8 md:p-10">
            <div className="max-w-md mx-auto w-full">

              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Cadastro
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Digite seu nome"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Digite seu email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Senha
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </button>
              </form>

              {/* Login */}
              <p className="mt-6 text-center text-sm text-slate-600">
                Já tem conta?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Fazer login
                </Link>
              </p>

              {/* Mensagem */}
              {message && (
                <p className="mt-4 text-center text-sm text-red-500">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;