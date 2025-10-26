"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, FileText, RefreshCw, AlertCircle, 
  TrendingUp, Calendar, Phone, LogOut, User,
  Menu, X, Bell, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for demo
const mockPolicies = [
  {
    id: 'POL001',
    name: 'Family Floater Plan',
    insurer: 'Niva Bupa',
    premium: 18652,
    sumInsured: 500000,
    status: 'Active',
    expiryDate: '2025-12-15',
    members: 4,
  },
  {
    id: 'POL002',
    name: 'Individual Health Plan',
    insurer: 'Care',
    premium: 12500,
    sumInsured: 300000,
    status: 'Active',
    expiryDate: '2025-08-20',
    members: 1,
  },
];

const mockClaims = [
  {
    id: 'CLM001',
    policyId: 'POL001',
    amount: 45000,
    status: 'Approved',
    date: '2024-09-15',
    hospital: 'Apollo Hospital',
  },
  {
    id: 'CLM002',
    policyId: 'POL002',
    amount: 28000,
    status: 'Processing',
    date: '2024-10-20',
    hospital: 'Fortis Healthcare',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    setUserEmail(email || 'user@example.com');
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const activePolicies = mockPolicies.filter(p => p.status === 'Active').length;
  const totalCoverage = mockPolicies.reduce((sum, p) => sum + p.sumInsured, 0);
  const pendingClaims = mockClaims.filter(c => c.status === 'Processing').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SecureHealth
                </span>
                <p className="text-xs text-gray-500 -mt-1">Customer Portal</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm font-medium text-blue-600">Dashboard</Link>
              <Link href="/dashboard/policies" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">My Policies</Link>
              <Link href="/dashboard/renewals" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Renewals</Link>
              <Link href="/dashboard/claims" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Claims</Link>
              <Link href="/dashboard/support" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Support</Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{userEmail}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-3">
                <Link href="/dashboard" className="text-sm font-medium text-blue-600 py-2">Dashboard</Link>
                <Link href="/dashboard/policies" className="text-sm font-medium text-gray-700 py-2">My Policies</Link>
                <Link href="/dashboard/renewals" className="text-sm font-medium text-gray-700 py-2">Renewals</Link>
                <Link href="/dashboard/claims" className="text-sm font-medium text-gray-700 py-2">Claims</Link>
                <Link href="/dashboard/support" className="text-sm font-medium text-gray-700 py-2">Support</Link>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">{userEmail}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userEmail.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Here's an overview of your health insurance portfolio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 opacity-80" />
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">Active Policies</p>
              <p className="text-3xl font-bold">{activePolicies}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-8 w-8 opacity-80" />
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Coverage</p>
              <p className="text-3xl font-bold">₹{(totalCoverage / 100000).toFixed(1)}L</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-8 w-8 opacity-80" />
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">Pending Claims</p>
              <p className="text-3xl font-bold">{pendingClaims}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <RefreshCw className="h-8 w-8 opacity-80" />
                <Calendar className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">Due for Renewal</p>
              <p className="text-3xl font-bold">1</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Policies */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Policies</CardTitle>
                <Link href="/dashboard/policies">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{policy.name}</p>
                        <p className="text-sm text-gray-600">{policy.insurer}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-gray-600">Coverage</p>
                        <p className="font-semibold">₹{(policy.sumInsured / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expires On</p>
                        <p className="font-semibold">{new Date(policy.expiryDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Claims */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Claims</CardTitle>
                <Link href="/dashboard/claims">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClaims.map((claim) => (
                  <div key={claim.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">Claim #{claim.id}</p>
                        <p className="text-sm text-gray-600">{claim.hospital}</p>
                      </div>
                      <Badge className={
                        claim.status === 'Approved' 
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }>
                        {claim.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-semibold">₹{claim.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-semibold">{new Date(claim.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/renewals">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <RefreshCw className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Renew Policy</h3>
                  <p className="text-sm text-gray-600">Quick and easy policy renewal</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/claims">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">File a Claim</h3>
                  <p className="text-sm text-gray-600">Submit a new claim request</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/support">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get help from our team</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

