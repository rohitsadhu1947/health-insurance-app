"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Plus, MessageSquare, Phone, Mail, Clock, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const mockTickets = [
  {
    id: 'TKT001',
    subject: 'Policy Document Not Received',
    policyId: 'POL001',
    status: 'Open',
    priority: 'High',
    createdDate: '2024-10-25',
    lastUpdate: '2024-10-26',
    messages: 3,
  },
  {
    id: 'TKT002',
    subject: 'Claim Status Inquiry',
    policyId: 'POL002',
    status: 'In Progress',
    priority: 'Medium',
    createdDate: '2024-10-20',
    lastUpdate: '2024-10-24',
    messages: 5,
  },
  {
    id: 'TKT003',
    subject: 'Premium Payment Confirmation',
    policyId: 'POL001',
    status: 'Resolved',
    priority: 'Low',
    createdDate: '2024-10-10',
    lastUpdate: '2024-10-12',
    messages: 2,
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    policyId: '',
    description: '',
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Support ticket created successfully!');
    setShowNewTicketForm(false);
    setTicketForm({ subject: '', policyId: '', description: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
            <p className="text-gray-600">Get help with your policies and claims</p>
          </div>
          <Button 
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-sm text-gray-600 mb-3">Available 24/7</p>
              <a href="tel:+917303472500" className="text-blue-600 font-semibold hover:underline">
                +91 730 347 2500
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-sm text-gray-600 mb-3">Response within 24 hours</p>
              <a href="mailto:support@securehealth.com" className="text-green-600 font-semibold hover:underline">
                support@securehealth.com
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-3">Instant support</p>
              <Button variant="outline" size="sm">Start Chat</Button>
            </CardContent>
          </Card>
        </div>

        {/* New Ticket Form */}
        {showNewTicketForm && (
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="policyId">Related Policy (Optional)</Label>
                  <Input
                    id="policyId"
                    placeholder="e.g., POL001"
                    value={ticketForm.policyId}
                    onChange={(e) => setTicketForm({ ...ticketForm, policyId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your query"
                    rows={5}
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewTicketForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Support Tickets */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Support Tickets</h2>
          <div className="space-y-4">
            {mockTickets.map(ticket => (
              <Card key={ticket.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">Ticket #{ticket.id} • Policy: {ticket.policyId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusBadge(ticket.status)}>{ticket.status}</Badge>
                      <Badge className={getPriorityBadge(ticket.priority)}>{ticket.priority}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Created: {new Date(ticket.createdDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {ticket.messages} messages
                      </span>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

