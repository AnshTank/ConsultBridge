import React from "react";
import { Link } from "react-router-dom";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";

const Navbar: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-none">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ConsultBridge</h1>
        <div className="flex items-center gap-8">
          <Link to="/" className="hover:text-blue-100 transition-all">
            Home
          </Link>
          <Link to="/categories" className="hover:text-blue-100 transition-all">
            Categories
          </Link>
          <Link to="/about" className="hover:text-blue-100 transition-all">
            About
          </Link>
          <Link to="/contact" className="hover:text-blue-100 transition-all">
            Contact
          </Link>

          {/* Show "Sign In" if user is NOT signed in */}
          <SignedOut>
            <SignInButton>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          {/* Show "Dashboard" and User Profile when signed in */}
          <SignedIn>
            <Link
              to="/dashboard"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
