"use client";

import Link from "next/link";
import { Shield, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SecureHealth
              </span>
              <p className="text-xs text-gray-500 -mt-1">Trusted by 10M+ Indians</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/products" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/claims" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Claims
            </Link>
            <Link 
              href="/support" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Support
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <a 
              href="tel:+917303472500"
              className="hidden lg:flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">1800-123-4567</span>
            </a>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-300"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

