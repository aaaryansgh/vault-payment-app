import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/authContext"
import type React from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import VaultPage from "./pages/VaultPage";
import PaymentPage from "./pages/PaymentPage";
import TransactionsPage from "./pages/TransactionPage";
import BankAccountLinkingPage from "./pages/BankAccountLinkingPage";
import Loader from "./utils/loader";
import LandingPage from "./pages/LandingPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function ProtectedRoute({children}:{children:React.ReactNode}){
  const{isAuthenticated,loading}=useAuth();
  if(loading){
    return(
      <Loader />
    )
  }
  if(!isAuthenticated)return <Navigate to="/home" replace />
  return <>{children}</>
}
//public route component (redirects to dashboard if already loggedIn)
function PublicRoute({children}:{children:React.ReactNode}){
  const{isAuthenticated,loading,hasBankAccount}=useAuth();
  if(loading){
    return(
      <Loader />
    )
  }
  // Redirect authenticated users to appropriate page
  if(isAuthenticated){
    return <Navigate to={hasBankAccount ? "/dashboard" : "/link-bank-account"} replace />
  }
  return <>{children}</>;
}
function App() {
  return (
    <Routes>
      <Route path="/home" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
      <Route path="/link-bank-account" element={<ProtectedRoute><BankAccountLinkingPage/></ProtectedRoute>} />
      <Route path="/vaults" element={<ProtectedRoute><VaultPage/></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentPage/></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage/></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
