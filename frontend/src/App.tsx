import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/authContext"
import type React from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import VaultPage from "./pages/VaultPage";
import PaymentPage from "./pages/PaymentPage";
import TransactionsPage from "./pages/TransactionPage";
import Loader from "./utils/loader";



function ProtectedRoute({children}:{children:React.ReactNode}){
  const{isAuthenticated,loading}=useAuth();
  if(loading){
    return(
      <Loader />
    )
  }
  if(!isAuthenticated)return <Navigate to="/login" replace />
  return <>{children}</>
}
//public route component (redirects to dashboard if already loggedIn)
function PublicRoute({children}:{children:React.ReactNode}){
  const{isAuthenticated,loading}=useAuth();
  if(loading){
    return(
      <Loader />
    )
  }
  if(isAuthenticated)return <Navigate to="/dashboard" replace />
  return <>{children}</>;
}
function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
      <Route path="/vaults" element={<ProtectedRoute><VaultPage/></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentPage/></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage/></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
