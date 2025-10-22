import { LogOut } from "lucide-react";
import { useAuth } from "../../context/authContext"

export default function Header(){
    const{user,logout}=useAuth();
    return(
        <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-red-900">Vault</span>Pay
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hi, {user?.fullname}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>
    )
}