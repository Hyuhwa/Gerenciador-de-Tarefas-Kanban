import { Routes, Route } from 'react-router-dom'
import { Dashboard, Login, Register } from "./components"


function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route
        path="/register"
        element={
          <div className="auth-shell">
            <Register />
          </div>
        }
      />
      <Route
        path="/login"
        element={
          <div className="auth-shell">
            <Login />
          </div>
        }
      />
    </Routes>
  );
}

export default App
