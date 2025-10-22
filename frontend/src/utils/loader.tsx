export default function Loader(){
    return(
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vaults...</p>
        </div>
      </div>
    )
}