import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { IDCardOrders } from '@/entities';
import { 
  Package, 
  CheckCircle, 
  IndianRupee, 
  Download, 
  Search, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Shield,
  CreditCard,
  Banknote,
  Lock,
  Edit,
  Eye,
  Wallet
} from 'lucide-react';

export default function StoreDashboard() {
  const [orders, setOrders] = useState<IDCardOrders[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IDCardOrders[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IDCardOrders | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  
  // Payout related state
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    preferredMode: 'bank' as 'bank' | 'upi'
  });
  const [isBankDetailsDialogOpen, setIsBankDetailsDialogOpen] = useState(false);
  const [isRequestPayoutDialogOpen, setIsRequestPayoutDialogOpen] = useState(false);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [monthlyCommissions, setMonthlyCommissions] = useState<any[]>([]);

  // Mock store info - in real app, this would come from authentication
  const storeInfo = {
    id: 'store-001',
    name: 'Vestige Mumbai Central',
    city: 'Mumbai',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    bankDetailsApproved: true, // Mock approval status
    hasPendingPayout: false,
    joinedDate: new Date('2024-01-01')
  };

  useEffect(() => {
    loadOrders();
    loadPayoutData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const loadOrders = async () => {
    try {
      const { items } = await BaseCrudService.getAll<IDCardOrders>('idcardorders');
      // Filter orders for this store (in real app, filter by store ID)
      const storeOrders = items.filter(order => 
        order.orderStatus === 'Delivered' || order.orderStatus === 'Dispatched'
      );
      setOrders(storeOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadPayoutData = async () => {
    // Mock data - in real app, load from CMS
    setMonthlyCommissions([
      { month: 'January 2024', orders: 45, commission: 450, status: 'Paid', paidDate: '2024-02-01' },
      { month: 'February 2024', orders: 38, commission: 380, status: 'Paid', paidDate: '2024-03-01' },
      { month: 'March 2024', orders: 52, commission: 520, status: 'Paid', paidDate: '2024-04-01' },
      { month: 'April 2024', orders: 41, commission: 410, status: 'Pending', paidDate: null },
      { month: 'May 2024', orders: 33, commission: 330, status: 'Available', paidDate: null }
    ]);

    setPayoutRequests([
      { id: 'PR-001', amount: 520, requestDate: '2024-04-15', status: 'Approved', processedDate: '2024-04-16' },
      { id: 'PR-002', amount: 410, requestDate: '2024-05-01', status: 'Pending', processedDate: null }
    ]);

    // Load existing bank details (mock)
    setBankDetails({
      accountHolderName: 'Rajesh Kumar',
      bankName: 'State Bank of India',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      upiId: 'rajesh@paytm',
      preferredMode: 'bank'
    });
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vestigeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.mobileNumber?.includes(searchTerm) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const markAsDelivered = async (orderId: string) => {
    // In real app, verify OTP first
    if (otpInput.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        await BaseCrudService.update('idcardorders', { ...order, orderStatus: 'Received' });
        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: 'Received' } : o));
        setIsOtpDialogOpen(false);
        setOtpInput('');
        setSelectedOrder(null);
        
        // Simulate WhatsApp notification
        console.log(`WhatsApp notification: Order ${orderId} delivered successfully`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const sendSupportMessage = async () => {
    if (!supportMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    // Simulate sending support message
    console.log(`Support message sent: ${supportMessage}`);
    setSupportMessage('');
    setIsSupportDialogOpen(false);
    alert('Support message sent successfully. Admin will respond shortly.');
  };

  const saveBankDetails = async () => {
    if (!bankDetails.accountHolderName || !bankDetails.bankName) {
      alert('Please fill all required fields');
      return;
    }

    if (bankDetails.preferredMode === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode)) {
      alert('Please fill bank account details');
      return;
    }

    if (bankDetails.preferredMode === 'upi' && !bankDetails.upiId) {
      alert('Please enter UPI ID');
      return;
    }

    // In real app, save to CMS and mark for admin approval
    console.log('Bank details saved:', bankDetails);
    setIsBankDetailsDialogOpen(false);
    alert('Bank details saved successfully. Awaiting admin approval.');
  };

  const requestPayout = async () => {
    const availableCommission = monthlyCommissions
      .filter(m => m.status === 'Available')
      .reduce((sum, m) => sum + m.commission, 0);

    if (availableCommission < 500) {
      alert('Minimum payout amount is ₹500');
      return;
    }

    // Check if 30 days have passed since joining
    const daysSinceJoining = Math.floor((new Date().getTime() - storeInfo.joinedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceJoining < 30) {
      alert(`Payout requests are available after 30 days. ${30 - daysSinceJoining} days remaining.`);
      return;
    }

    // Create payout request
    const newRequest = {
      id: `PR-${Date.now()}`,
      amount: availableCommission,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      processedDate: null
    };

    setPayoutRequests([...payoutRequests, newRequest]);
    setIsRequestPayoutDialogOpen(false);
    alert(`Payout request for ₹${availableCommission} submitted successfully!`);
  };

  const exportCommissionReport = (period: 'daily' | 'monthly') => {
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Received');
    const commission = deliveredOrders.length * 10; // ₹10 per card

    const csvContent = [
      ['Date', 'Order ID', 'Customer Name', 'Commission'].join(','),
      ...deliveredOrders.map(order => [
        order._createdDate ? new Date(order._createdDate).toLocaleDateString() : '',
        order._id,
        order.customerName || '',
        '₹10'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    cardsReceived: orders.filter(o => o.orderStatus === 'Delivered').length,
    pendingDelivery: orders.filter(o => o.orderStatus === 'Dispatched').length,
    delivered: orders.filter(o => o.orderStatus === 'Received').length,
    totalCommission: orders.filter(o => o.orderStatus === 'Received').length * 10,
    todayDeliveries: orders.filter(o => {
      const orderDate = new Date(o._createdDate || '');
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && o.orderStatus === 'Received';
    }).length,
    availableForPayout: monthlyCommissions
      .filter(m => m.status === 'Available')
      .reduce((sum, m) => sum + m.commission, 0),
    pendingPayout: monthlyCommissions
      .filter(m => m.status === 'Pending')
      .reduce((sum, m) => sum + m.commission, 0)
  };

  return (
    <div className="min-h-screen bg-blue-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-heading text-slate-900 mb-2">Store Partner Dashboard</h1>
                <p className="font-paragraph text-slate-600">{storeInfo.name} • {storeInfo.city}</p>
                <p className="font-paragraph text-slate-500 text-sm">{storeInfo.contactPerson} • {storeInfo.phone}</p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Support
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact Support</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="supportMessage">Message to Admin</Label>
                        <Textarea
                          id="supportMessage"
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Describe your issue or question..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={sendSupportMessage} className="w-full bg-blue-500 hover:bg-blue-600">
                        Send Message
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Shield className="w-5 h-5 mr-2" />
                  Verify OTP
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Cards Received</p>
                  <p className="text-3xl font-heading">{stats.cardsReceived}</p>
                  <p className="text-blue-200 text-xs">Ready for delivery</p>
                </div>
                <Package className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Delivery</p>
                  <p className="text-3xl font-heading">{stats.pendingDelivery}</p>
                  <p className="text-orange-200 text-xs">Awaiting pickup</p>
                </div>
                <Clock className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Delivered Today</p>
                  <p className="text-3xl font-heading">{stats.todayDeliveries}</p>
                  <p className="text-green-200 text-xs">Successfully handed over</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Available Payout</p>
                  <p className="text-3xl font-heading">₹{stats.availableForPayout}</p>
                  <p className="text-emerald-200 text-xs">Ready to withdraw</p>
                </div>
                <Wallet className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs defaultValue="deliveries" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 bg-white border border-blue-100">
              <TabsTrigger value="deliveries" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Card Deliveries
              </TabsTrigger>
              <TabsTrigger value="commission" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Commission Tracker
              </TabsTrigger>
              <TabsTrigger value="payouts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                My Payouts
              </TabsTrigger>
              <TabsTrigger value="batches" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Batch Management
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Card Deliveries Tab */}
            <TabsContent value="deliveries">
              <Card className="bg-white shadow-sm border border-blue-100">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="font-heading text-slate-900">Card Delivery Management</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-heading">Customer Name</TableHead>
                          <TableHead className="font-heading">Vestige ID</TableHead>
                          <TableHead className="font-heading">Mobile</TableHead>
                          <TableHead className="font-heading">Order ID</TableHead>
                          <TableHead className="font-heading">Status</TableHead>
                          <TableHead className="font-heading">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order._id} className="hover:bg-blue-50">
                            <TableCell className="font-medium text-lg">{order.customerName}</TableCell>
                            <TableCell className="font-mono text-sm">{order.vestigeId}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{order.mobileNumber}</span>
                                <Button size="sm" variant="outline" className="p-1">
                                  <Phone className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">#{order._id.slice(-8)}</TableCell>
                            <TableCell>
                              <Badge className={
                                order.orderStatus === 'Delivered' 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                  : order.orderStatus === 'Received'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-orange-100 text-orange-800 border-orange-200'
                              }>
                                {order.orderStatus === 'Delivered' ? 'Ready for Pickup' : 
                                 order.orderStatus === 'Received' ? 'Delivered' : order.orderStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.orderStatus === 'Delivered' ? (
                                <Dialog open={isOtpDialogOpen && selectedOrder?._id === order._id} onOpenChange={setIsOtpDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="lg" 
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                      onClick={() => setSelectedOrder(order)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark as Delivered
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Verify Customer OTP</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="font-medium text-slate-900">Customer: {order.customerName}</p>
                                        <p className="text-sm text-slate-600">Vestige ID: {order.vestigeId}</p>
                                        <p className="text-sm text-slate-600">Mobile: {order.mobileNumber}</p>
                                      </div>
                                      <div>
                                        <Label htmlFor="otp">Enter 6-digit OTP from customer</Label>
                                        <Input
                                          id="otp"
                                          value={otpInput}
                                          onChange={(e) => setOtpInput(e.target.value)}
                                          placeholder="000000"
                                          maxLength={6}
                                          className="text-center text-2xl font-mono tracking-widest"
                                        />
                                      </div>
                                      <Button 
                                        onClick={() => markAsDelivered(order._id)} 
                                        className="w-full bg-green-500 hover:bg-green-600"
                                        disabled={otpInput.length !== 6}
                                      >
                                        Confirm Delivery
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  ✓ Delivered
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="font-paragraph text-slate-500 text-lg">No orders found</p>
                      <p className="font-paragraph text-slate-400">Check back later for new deliveries</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commission Tracker Tab */}
            <TabsContent value="commission">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm border border-blue-100">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="font-heading text-slate-900">Commission Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="font-paragraph text-slate-700">Cards Delivered</span>
                        <span className="font-heading text-2xl text-slate-900">{stats.delivered}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-paragraph text-slate-700">Commission per Card</span>
                        <span className="font-heading text-2xl text-slate-900">₹10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-paragraph text-slate-700">Available for Payout</span>
                        <span className="font-heading text-2xl text-green-600">₹{stats.availableForPayout}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-paragraph text-slate-700">Pending Payout</span>
                        <span className="font-heading text-2xl text-orange-600">₹{stats.pendingPayout}</span>
                      </div>
                      <hr className="border-slate-200" />
                      <div className="flex justify-between items-center">
                        <span className="font-heading text-slate-900">Total Earned</span>
                        <span className="font-heading text-3xl text-emerald-600">₹{stats.totalCommission}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-blue-100">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="font-heading text-slate-900">Monthly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {monthlyCommissions.slice(0, 5).map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{month.month}</p>
                            <p className="text-sm text-slate-600">{month.orders} cards delivered</p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-lg">₹{month.commission}</p>
                            <Badge className={
                              month.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                              month.status === 'Pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }>
                              {month.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* My Payouts Tab */}
            <TabsContent value="payouts">
              <div className="space-y-6">
                {/* Bank Details Section */}
                <Card className="bg-white shadow-sm border border-blue-100">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading text-slate-900 flex items-center">
                        <CreditCard className="w-6 h-6 mr-2" />
                        Bank & UPI Details
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {storeInfo.bankDetailsApproved ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Clock className="w-4 h-4 mr-1" />
                            Pending Approval
                          </Badge>
                        )}
                        <Dialog open={isBankDetailsDialogOpen} onOpenChange={setIsBankDetailsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={storeInfo.hasPendingPayout}
                            >
                              {storeInfo.hasPendingPayout ? (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Locked
                                </>
                              ) : (
                                <>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Update Bank & UPI Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Changes require admin approval. Details will be locked during pending payouts.
                                </AlertDescription>
                              </Alert>
                              
                              <div>
                                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                <Input
                                  id="accountHolderName"
                                  value={bankDetails.accountHolderName}
                                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                                  placeholder="Enter account holder name"
                                />
                              </div>

                              <div>
                                <Label htmlFor="preferredMode">Preferred Payout Mode *</Label>
                                <Select 
                                  value={bankDetails.preferredMode} 
                                  onValueChange={(value: 'bank' | 'upi') => setBankDetails({...bankDetails, preferredMode: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI Transfer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {bankDetails.preferredMode === 'bank' && (
                                <>
                                  <div>
                                    <Label htmlFor="bankName">Bank Name *</Label>
                                    <Input
                                      id="bankName"
                                      value={bankDetails.bankName}
                                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                      placeholder="Enter bank name"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="accountNumber">Account Number *</Label>
                                    <Input
                                      id="accountNumber"
                                      value={bankDetails.accountNumber}
                                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                      placeholder="Enter account number"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                                    <Input
                                      id="ifscCode"
                                      value={bankDetails.ifscCode}
                                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                                      placeholder="Enter IFSC code"
                                    />
                                  </div>
                                </>
                              )}

                              {bankDetails.preferredMode === 'upi' && (
                                <div>
                                  <Label htmlFor="upiId">UPI ID *</Label>
                                  <Input
                                    id="upiId"
                                    value={bankDetails.upiId}
                                    onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                                    placeholder="Enter UPI ID (e.g., name@paytm)"
                                  />
                                </div>
                              )}

                              <Button onClick={saveBankDetails} className="w-full bg-blue-500 hover:bg-blue-600">
                                Save Details
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-slate-600">Account Holder Name</Label>
                          <p className="font-medium">{bankDetails.accountHolderName || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">Preferred Mode</Label>
                          <p className="font-medium capitalize">{bankDetails.preferredMode} Transfer</p>
                        </div>
                        {bankDetails.preferredMode === 'bank' && (
                          <>
                            <div>
                              <Label className="text-sm text-slate-600">Bank Name</Label>
                              <p className="font-medium">{bankDetails.bankName || 'Not set'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-slate-600">Account Number</Label>
                              <p className="font-medium font-mono">
                                {bankDetails.accountNumber ? `****${bankDetails.accountNumber.slice(-4)}` : 'Not set'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="space-y-4">
                        {bankDetails.preferredMode === 'bank' && (
                          <div>
                            <Label className="text-sm text-slate-600">IFSC Code</Label>
                            <p className="font-medium font-mono">{bankDetails.ifscCode || 'Not set'}</p>
                          </div>
                        )}
                        {bankDetails.preferredMode === 'upi' && (
                          <div>
                            <Label className="text-sm text-slate-600">UPI ID</Label>
                            <p className="font-medium">{bankDetails.upiId || 'Not set'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payout Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Banknote className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="font-heading text-xl text-green-800 mb-2">Request Payout</h3>
                        <p className="text-green-700 mb-4">Available: ₹{stats.availableForPayout}</p>
                        <Dialog open={isRequestPayoutDialogOpen} onOpenChange={setIsRequestPayoutDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-green-500 hover:bg-green-600"
                              disabled={stats.availableForPayout < 500 || !storeInfo.bankDetailsApproved}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Request Payout
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Payout Request</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Payout Amount:</span>
                                  <span className="font-heading text-xl text-green-600">₹{stats.availableForPayout}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">Payout Mode:</span>
                                  <span className="text-sm capitalize">{bankDetails.preferredMode} Transfer</span>
                                </div>
                              </div>
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Payout will be processed within 2-3 business days. You'll receive a WhatsApp notification once processed.
                                </AlertDescription>
                              </Alert>
                              <Button onClick={requestPayout} className="w-full bg-green-500 hover:bg-green-600">
                                Confirm Request
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {stats.availableForPayout < 500 && (
                          <p className="text-sm text-slate-500 mt-2">Minimum payout: ₹500</p>
                        )}
                        {!storeInfo.bankDetailsApproved && (
                          <p className="text-sm text-orange-600 mt-2">Bank details approval required</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="font-heading text-xl text-blue-800 mb-2">Pending Payout</h3>
                        <p className="text-blue-700 mb-4">Amount: ₹{stats.pendingPayout}</p>
                        <Button variant="outline" className="w-full" disabled>
                          <Eye className="w-4 h-4 mr-2" />
                          Processing...
                        </Button>
                        <p className="text-sm text-slate-500 mt-2">Will be processed soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payout History */}
                <Card className="bg-white shadow-sm border border-blue-100">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="font-heading text-slate-900">Payout History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-heading">Request ID</TableHead>
                            <TableHead className="font-heading">Amount</TableHead>
                            <TableHead className="font-heading">Request Date</TableHead>
                            <TableHead className="font-heading">Status</TableHead>
                            <TableHead className="font-heading">Processed Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payoutRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-blue-50">
                              <TableCell className="font-mono">{request.id}</TableCell>
                              <TableCell className="font-heading text-lg">₹{request.amount}</TableCell>
                              <TableCell>{request.requestDate}</TableCell>
                              <TableCell>
                                <Badge className={
                                  request.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                  request.status === 'Pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                  'bg-red-100 text-red-800 border-red-200'
                                }>
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{request.processedDate || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Batch Management Tab */}
            <TabsContent value="batches">
              <Card className="bg-white shadow-sm border border-blue-100">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="font-heading text-slate-900">Batch Management</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'BATCH-001', date: '2024-01-15', cards: 25, status: 'Received' },
                      { id: 'BATCH-002', date: '2024-01-14', cards: 18, status: 'Delivered' },
                      { id: 'BATCH-003', date: '2024-01-13', cards: 32, status: 'Delivered' }
                    ].map((batch) => (
                      <Card key={batch.id} className="border-2 border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg">{batch.id}</h3>
                            <Badge className={
                              batch.status === 'Received' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }>
                              {batch.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Date:</span>
                              <span className="font-medium">{batch.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Cards:</span>
                              <span className="font-medium">{batch.cards}</span>
                            </div>
                          </div>
                          {batch.status === 'Received' && (
                            <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600" size="sm">
                              Mark as Delivered
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="bg-white shadow-sm border border-blue-100">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="font-heading text-slate-900">Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { 
                        time: '2 hours ago', 
                        message: 'New batch BATCH-001 with 25 cards has arrived', 
                        type: 'batch',
                        icon: Package
                      },
                      { 
                        time: '5 hours ago', 
                        message: 'Customer verification required for Order #12345678', 
                        type: 'verification',
                        icon: AlertCircle
                      },
                      { 
                        time: '1 day ago', 
                        message: 'Commission payment of ₹180 has been processed', 
                        type: 'payment',
                        icon: IndianRupee
                      },
                      { 
                        time: '2 days ago', 
                        message: 'Monthly performance report is now available', 
                        type: 'report',
                        icon: TrendingUp
                      }
                    ].map((notification, index) => {
                      const Icon = notification.icon;
                      return (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.type === 'batch' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'verification' ? 'bg-orange-100 text-orange-600' :
                            notification.type === 'payment' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{notification.message}</p>
                            <p className="text-sm text-slate-500">{notification.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}