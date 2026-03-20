import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import PublicView from "./pages/PublicView";
import Activity from "./pages/Activity";

import { AuthProvider } from "./context/AuthProvider";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

/* Protected route */

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);

  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/editor/:id"
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <PrivateRoute>
                <Activity />
              </PrivateRoute>
            }
          />

          <Route path="/public/:shareId" element={<PublicView />} />

          {/* fallback */}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
