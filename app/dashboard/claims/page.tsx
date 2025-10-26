"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, FileText, Plus, Download, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockClaims = [
  {
    id: 'CLM001',
    claimNumber: 'CLM/2024/001234',
    policyId: 'POL001',
    policyName: 'Family Floater Plan',
    amount: 45000,
    approvedAmount: 45000,
    status: 'Approved',
    submittedDate: '2024-09-15',
    approvedDate: '2024-09-22',
    hospital: 'Apollo Hospital, Mumbai',
    patientName: 'Rohit Sadhu',
    treatmentType: 'Hospitalization',
  },
  {
    id: 'CLM002',
    claimNumber: 'CLM/2024/567890',
    policyId: 'POL002',
    policyName: 'Individual Health Plan',
    amount: 28000,
    approvedAmount: null,
    status: 'Processing',
    submittedDate: '2024-10-20',
    approvedDate: null,
    hospital: 'Fortis Healthcare, Delhi',
    patientName: 'Rohit Sadhu',
    treatmentType: 'Surgery',
  },
  {
    id: 'CLM003',
    claimNumber: 'CLM/2024/334455',
    policyId: 'POL001',
    policyName: 'Family Floater Plan',
    amount: 15000,
    approvedAmount: 12000,
    status: 'Partially Approved',
    submittedDate: '2024-08-10',
    approvedDate: '2024-08-18',
    hospital: 'Max Hospital, Bangalore',
    patientName: 'Priya Sadhu',
    treatmentType: 'Diagnostic Tests',
  },
];

export default function ClaimsPage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Partially Approved':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Claims</h1>
            <p className="text-gray-600">Track and manage your insurance claims</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            File New Claim
          </Button>
        </div>

        <div className="space-y-6">
          {mockClaims.map(claim => (
            <Card key={claim.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">Claim #{claim.claimNumber}</CardTitle>
                    <p className="text-sm text-gray-600">{claim.policyName}</p>
                  </div>
                  <Badge className={getStatusBadge(claim.status)}>
                    {claim.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Claim Amount</p>
                    <p className="font-semibold text-gray-900">₹{claim.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approved Amount</p>
                    <p className="font-semibold text-gray-900">
                      {claim.approvedAmount ? `₹${claim.approvedAmount.toLocaleString()}` : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Submitted On</p>
                    <p className="font-semibold text-gray-900">{new Date(claim.submittedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Patient</p>
                    <p className="font-semibold text-gray-900">{claim.patientName}</p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hospital:</span>
                    <span className="font-medium text-gray-900">{claim.hospital}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Treatment Type:</span>
                    <span className="font-medium text-gray-900">{claim.treatmentType}</span>
                  </div>
                  {claim.approvedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Approved On:</span>
                      <span className="font-medium text-gray-900">{new Date(claim.approvedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Documents</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

