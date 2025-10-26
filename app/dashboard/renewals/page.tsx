"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, RefreshCw, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const renewalPolicies = [
  {
    id: 'POL002',
    name: 'Individual Health Plan',
    insurer: 'Care',
    premium: 12500,
    sumInsured: 300000,
    expiryDate: '2025-08-20',
    daysLeft: 267,
  },
];

export default function RenewalsPage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Policy Renewals</h1>
          <p className="text-gray-600">Renew your policies before they expire</p>
        </div>

        <div className="space-y-6">
          {renewalPolicies.map(policy => (
            <Card key={policy.id} className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{policy.name}</CardTitle>
                    <p className="text-sm text-gray-600">{policy.insurer}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {policy.daysLeft} days left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Sum Insured</p>
                    <p className="font-semibold">₹{(policy.sumInsured / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Current Premium</p>
                    <p className="font-semibold">₹{policy.premium.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Expires On</p>
                    <p className="font-semibold">{new Date(policy.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Now
                  </Button>
                  <Button variant="outline">View Policy Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

