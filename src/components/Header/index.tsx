import React from 'react'
import { NavLink } from 'react-router-dom'
import { ReactComponent as Logo } from 'assets/logo.svg'

const Header: React.FC = ({ children }) => {
  return (
    <nav className="w-full container mx-auto px-10 py-6">
      <div className="w-full flex items-center justify-between">
        <NavLink className="flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl" to="/">
          <Logo className="w-16 h-16 mr-3" />
          <div className="flex flex-col">
            <p>kb-word.web.app</p>
            <p className="text-sm">
              (Learn words with <span className="text-red-600">K</span>ey<span className="text-red-600">B</span>oard)
            </p>
          </div>
        </NavLink>
        <div className="flex bg-white dark:bg-gray-800 transition-colors duration-300 justify-end content-center items-center space-x-3 card rounded-large w-auto on element p-4">
          {children}
        </div>
      </div>
    </nav>
  )
}

export default Header
