"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            VirtualTryOn
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link href="/tryon" className="text-gray-600 hover:text-gray-900">
              Try On
            </Link>
            {user && (
              <Link href="/import-product" className="text-gray-600 hover:text-gray-900">
                Import
              </Link>
            )}
            <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.name}</span>
                <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
