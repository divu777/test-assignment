import React from 'react'

const Navbar = ({ setActive, active }: { setActive: React.Dispatch<React.SetStateAction<string>>, active: string }) => {
  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Rule Builder App</h1>
        
        <div className="flex gap-4">
          <button
            onClick={() => setActive('user')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              active === 'user'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            User
          </button>

          <button
            onClick={() => setActive('admin')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              active === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
