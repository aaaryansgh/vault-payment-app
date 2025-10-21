import { Link } from "react-router-dom";

export default function VaultPage(){
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Vaults</h1>
                    <Link className="text-blue-600 hover:text-blue-700" to="/dashboard">Back to dashboard</Link>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vaults Page</h2>
                    <p className="text-gray-600 mb-6">Full vaults managment coming soon!</p>
                    <p className="text-sm text-gray-500">Create, edit, and manage your spending vaults</p>
                </div>
            </div>
        </div>
    )
}