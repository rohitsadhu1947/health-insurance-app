"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Download, Eye, Calendar, Users, IndianRupee, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockPolicies = [
  {
    id: 'POL001',
    policyNumber: 'NH/2024/001234',
    name: 'Family Floater Plan',
    insurer: 'Niva Bupa',
    insurerLogo: 'NB',
    premium: 18652,
    sumInsured: 500000,
    status: 'Active',
    startDate: '2024-01-15',
    expiryDate: '2025-12-15',
    members: [
      { name: 'Rohit Sadhu', relation: 'Self', age: 46 },
      { name: 'Priya Sadhu', relation: 'Spouse', age: 43 },
      { name: 'Aarav Sadhu', relation: 'Son', age: 15 },
      { name: 'Ananya Sadhu', relation: 'Daughter', age: 12 },
    ],
    features: [
      'Cashless hospitalization',
      'Pre and post hospitalization',
      'Room rent: No capping',
      'Ambulance cover: ₹2,000',
    ],
  },
  {
    id: 'POL002',
    policyNumber: 'CARE/2024/567890',
    name: 'Individual Health Plan',
    insurer: 'Care',
    insurerLogo: 'CA',
    premium: 12500,
    sumInsured: 300000,
    status: 'Active',
    startDate: '2023-08-20',
    expiryDate: '2025-08-20',
    members: [
      { name: 'Rohit Sadhu', relation: 'Self', age: 46 },
    ],
    features: [
      'Cashless hospitalization',
      'Pre and post hospitalization',
      'Room rent: ₹5,000 per day',
      'Ambulance cover: ₹1,500',
    ],
  },
  {
    id: 'POL003',
    policyNumber: 'REL/2023/112233',
    name: 'Reliance Power',
    insurer: 'Reliance',
    insurerLogo: 'RL',
    premium: 15000,
    sumInsured: 400000,
    status: 'Expired',
    startDate: '2022-03-10',
    expiryDate: '2024-03-10',
    members: [
      { name: 'Rohit Sadhu', relation: 'Self', age: 46 },
      { name: 'Priya Sadhu', relation: 'Spouse', age: 43 },
    ],
    features: [
      'Cashless hospitalization',
      'Pre and post hospitalization',
      'Room rent: ₹3,000 per day',
      'Ambulance cover: ₹1,000',
    ],
  },
];

export default function PoliciesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const activePolicies = mockPolicies.filter(p => p.status === 'Active');
  const expiredPolicies = mockPolicies.filter(p => p.status === 'Expired');

  const PolicyCard = ({ policy }: { policy: typeof mockPolicies[0] }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {policy.insurerLogo}
            </div>
            <div>
              <CardTitle className="text-lg mb-1">{policy.name}</CardTitle>
              <p className="text-sm text-gray-600">{policy.insurer}</p>
              <p className="text-xs text-gray-500 mt-1">Policy #{policy.policyNumber}</p>
            </div>
          </div>
          <Badge className={
            policy.status === 'Active'
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-gray-100 text-gray-700 border-gray-200'
          }>
            {policy.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Sum Insured</p>
            <p className="font-semibold text-gray-900">₹{(policy.sumInsured / 100000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Annual Premium</p>
            <p className="font-semibold text-gray-900">₹{policy.premium.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Members</p>
            <p className="font-semibold text-gray-900">{policy.members.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Expires On</p>
            <p className="font-semibold text-gray-900">{new Date(policy.expiryDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Members */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            Covered Members
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {policy.members.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-600">{member.relation}</p>
                </div>
                <p className="text-xs text-gray-600">{member.age} yrs</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {policy.features.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Policy</span>
          </Button>
          {policy.status === 'Active' && (
            <Link href="/dashboard/renewals">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                Renew Now
              </Button>
            </Link>
          )}
          {policy.status === 'Expired' && (
            <Link href="/">
              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                Buy New Policy
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Policies</h1>
          <p className="text-gray-600">View and manage all your health insurance policies</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="active">
              Active ({activePolicies.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredPolicies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activePolicies.length > 0 ? (
              activePolicies.map(policy => (
                <PolicyCard key={policy.id} policy={policy} />
              ))
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Policies</h3>
                  <p className="text-gray-600 mb-6">You don't have any active policies at the moment</p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      Get a Quote
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-6">
            {expiredPolicies.length > 0 ? (
              expiredPolicies.map(policy => (
                <PolicyCard key={policy.id} policy={policy} />
              ))
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Expired Policies</h3>
                  <p className="text-gray-600">You don't have any expired policies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

