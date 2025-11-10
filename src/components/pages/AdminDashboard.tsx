import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BaseCrudService } from '@/integrations';
import { IDCardOrders, Stores, StoreCredentials } from '@/entities';
import { Search, Download, Users, CreditCard, Package, TrendingUp, Eye, Edit, Printer, Truck, CheckCircle, Plus, MessageSquare, BarChart3, FileText, Calendar, Timer, Trash2, Key, Copy, RefreshCw, EyeOff } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<IDCardOrders[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IDCardOrders[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<IDCardOrders | null>(null);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Stores | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    storeName: '',
    storeAddress: '',
    contactPerson: '',
    contactNumber: '',
    storeCity: '',
    isActive: true
  });

  // Payout management state
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [storeBankDetails, setStoreBankDetails] = useState<any[]>([]);
  const [selectedPayoutRequest, setSelectedPayoutRequest] = useState<any>(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);

  // Store credentials management state
  const [storeCredentials, setStoreCredentials] = useState<any[]>([]);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedStoreForCredentials, setSelectedStoreForCredentials] = useState<Stores | null>(null);
  const [credentialsForm, setCredentialsForm] = useState({
    loginId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    loadData();
    loadPayoutData();
    loadStoreCredentials();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const [ordersResult, storesResult] = await Promise.all([
        BaseCrudService.getAll<IDCardOrders>('idcardorders'),
        BaseCrudService.getAll<Stores>('stores')
      ]);
      setOrders(ordersResult.items);
      setStores(storesResult.items);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPayoutData = async () => {
    // Initialize with empty arrays - in production, load from CMS
    setPayoutRequests([]);
    setStoreBankDetails([]);
  };

  const loadStoreCredentials = async () => {
    try {
      const { items } = await BaseCrudService.getAll<StoreCredentials>('storecredentials');
      setStoreCredentials(items);
    } catch (error) {
      console.error('Error loading store credentials:', error);
      // Initialize with empty array if loading fails
      setStoreCredentials([]);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vestigeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.mobileNumber?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        await BaseCrudService.update('idcardorders', { ...order, orderStatus: newStatus });
        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        
        // Simulate WhatsApp notification
        console.log(`WhatsApp notification sent: Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const addStore = async () => {
    try {
      const storeData: Stores = {
        _id: crypto.randomUUID(),
        ...newStore
      };
      
      await BaseCrudService.create('stores', storeData);
      setStores([...stores, storeData]);
      setNewStore({
        storeName: '',
        storeAddress: '',
        contactPerson: '',
        contactNumber: '',
        storeCity: '',
        isActive: true
      });
      setIsAddStoreOpen(false);
    } catch (error) {
      console.error('Error adding store:', error);
    }
  };

  const deleteStore = async () => {
    if (!storeToDelete) return;
    
    try {
      await BaseCrudService.delete('stores', storeToDelete._id);
      setStores(stores.filter(store => store._id !== storeToDelete._id));
      setStoreToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const handleDeleteStore = (store: Stores) => {
    setStoreToDelete(store);
    setIsDeleteDialogOpen(true);
  };

  const clearAllStores = async () => {
    try {
      // Delete all stores one by one
      for (const store of stores) {
        await BaseCrudService.delete('stores', store._id);
      }
      setStores([]);
      setIsClearAllDialogOpen(false);
    } catch (error) {
      console.error('Error clearing all stores:', error);
    }
  };

  // Store credentials management functions
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateLoginId = (storeName: string) => {
    const cleanName = storeName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${cleanName}_${randomSuffix}`;
  };

  const openCredentialsDialog = (store: Stores, isEdit = false) => {
    setSelectedStoreForCredentials(store);
    setIsEditingCredentials(isEdit);
    
    if (isEdit) {
      const existingCredentials = storeCredentials.find(cred => cred.storeId === store._id);
      if (existingCredentials) {
        setCredentialsForm({
          loginId: existingCredentials.username || '',
          password: existingCredentials.password || '',
          confirmPassword: existingCredentials.password || ''
        });
      }
    } else {
      setCredentialsForm({
        loginId: generateLoginId(store.storeName || ''),
        password: generateSecurePassword(),
        confirmPassword: ''
      });
    }
    
    setIsCredentialsDialogOpen(true);
  };

  const saveStoreCredentials = async () => {
    if (!selectedStoreForCredentials) return;
    
    if (credentialsForm.password !== credentialsForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (credentialsForm.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    try {
      const credentialData: StoreCredentials = {
        _id: crypto.randomUUID(),
        storeId: selectedStoreForCredentials._id,
        username: credentialsForm.loginId,
        password: credentialsForm.password,
        lastLoginDate: undefined,
        isActive: true
      };

      if (isEditingCredentials) {
        // Find existing credential and update it
        const existingCredential = storeCredentials.find(c => c.storeId === selectedStoreForCredentials._id);
        if (existingCredential) {
          const updatedCredential = {
            ...existingCredential,
            username: credentialsForm.loginId,
            password: credentialsForm.password
          };
          await BaseCrudService.update('storecredentials', updatedCredential);
          setStoreCredentials(storeCredentials.map(cred => 
            cred.storeId === selectedStoreForCredentials._id ? updatedCredential : cred
          ));
        }
      } else {
        // Create new credential
        await BaseCrudService.create('storecredentials', credentialData);
        setStoreCredentials([...storeCredentials.filter(c => c.storeId !== selectedStoreForCredentials._id), credentialData]);
      }

      setIsCredentialsDialogOpen(false);
      setCredentialsForm({ loginId: '', password: '', confirmPassword: '' });
      setSelectedStoreForCredentials(null);
      setIsEditingCredentials(false);
      
      alert(`Store credentials ${isEditingCredentials ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving store credentials:', error);
      alert('Failed to save credentials. Please try again.');
    }
  };

  const resetStorePassword = async (storeId: string) => {
    try {
      const newPassword = generateSecurePassword();
      const existingCredential = storeCredentials.find(cred => cred.storeId === storeId);
      
      if (existingCredential) {
        const updatedCredential = {
          ...existingCredential,
          password: newPassword
        };
        
        await BaseCrudService.update('storecredentials', updatedCredential);
        setStoreCredentials(storeCredentials.map(cred => 
          cred.storeId === storeId ? updatedCredential : cred
        ));
        
        alert(`Password reset successfully! New password: ${newPassword}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  const getStoreCredentials = (storeId: string) => {
    return storeCredentials.find(cred => cred.storeId === storeId);
  };

  const sendWhatsAppNotification = async (orderId: string, message: string) => {
    // Simulate WhatsApp API call
    console.log(`Sending WhatsApp to order ${orderId}: ${message}`);
    // In real implementation, integrate with Twilio WhatsApp API
  };

  const approvePayoutRequest = async (requestId: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === requestId ? { ...req, status: 'Approved' } : req
    ));
    
    // Send WhatsApp notification to store
    const request = payoutRequests.find(req => req.id === requestId);
    if (request) {
      console.log(`WhatsApp notification: Payout request ${requestId} approved for ${request.storeName}`);
    }
    
    setIsPayoutDialogOpen(false);
    alert('Payout request approved successfully!');
  };

  const rejectPayoutRequest = async (requestId: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === requestId ? { ...req, status: 'Rejected' } : req
    ));
    
    setIsPayoutDialogOpen(false);
    alert('Payout request rejected.');
  };

  const markPayoutAsPaid = async (requestId: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === requestId ? { ...req, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] } : req
    ));
    
    // Send WhatsApp notification to store
    const request = payoutRequests.find(req => req.id === requestId);
    if (request) {
      console.log(`WhatsApp notification: Payout of ₹${request.amount} has been processed for ${request.storeName}`);
    }
    
    alert('Payout marked as paid successfully!');
  };

  const approveBankDetails = async (storeId: string) => {
    setStoreBankDetails(storeBankDetails.map(details => 
      details.storeId === storeId ? { ...details, approved: true } : details
    ));
    
    // Send WhatsApp notification to store
    const details = storeBankDetails.find(d => d.storeId === storeId);
    if (details) {
      console.log(`WhatsApp notification: Bank details approved for ${details.storeName}`);
    }
    
    alert('Bank details approved successfully!');
  };

  const exportPayoutReport = (period: 'monthly' | 'quarterly') => {
    const csvContent = [
      ['Store Name', 'Request ID', 'Amount', 'Request Date', 'Status', 'Paid Date', 'Payment Mode'].join(','),
      ...payoutRequests.map(request => [
        request.storeName,
        request.id,
        `₹${request.amount}`,
        request.requestDate,
        request.status,
        request.paidDate || '-',
        request.bankDetails.preferredMode
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportData = (format: 'csv' | 'excel' | 'pdf', period: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let filteredData = filteredOrders;
    
    // Filter by period
    if (period === 'daily') {
      filteredData = filteredOrders.filter(order => {
        const orderDate = new Date(order._createdDate || '');
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = filteredOrders.filter(order => {
        const orderDate = new Date(order._createdDate || '');
        return orderDate >= weekAgo;
      });
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredData = filteredOrders.filter(order => {
        const orderDate = new Date(order._createdDate || '');
        return orderDate >= monthAgo;
      });
    }

    if (format === 'csv' || format === 'excel') {
      const csvContent = [
        ['Order ID', 'Customer Name', 'Vestige ID', 'Mobile', 'Address', 'Status', 'Created Date', 'Payment Status'].join(','),
        ...filteredData.map(order => [
          order._id,
          order.customerName || '',
          order.vestigeId || '',
          order.mobileNumber || '',
          order.customerAddress || '',
          order.orderStatus || '',
          order._createdDate ? new Date(order._createdDate).toLocaleDateString() : '',
          'Paid' // Assuming all orders are paid
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vestige-orders-${period}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Simulate PDF generation
      console.log(`Generating PDF report for ${period} period with ${filteredData.length} orders`);
      alert(`PDF report for ${period} period would be generated with ${filteredData.length} orders`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Printed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Received': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return Package;
      case 'Printed': return Printer;
      case 'Dispatched': return Truck;
      case 'Delivered': return CheckCircle;
      case 'Received': return CheckCircle;
      default: return Package;
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length,
    printedCards: orders.filter(o => o.orderStatus === 'Printed').length,
    dispatchedCards: orders.filter(o => o.orderStatus === 'Dispatched').length,
    deliveredOrders: orders.filter(o => o.orderStatus === 'Delivered').length,
    receivedOrders: orders.filter(o => o.orderStatus === 'Received').length,
    totalStores: stores.filter(s => s.isActive).length,
    totalRevenue: orders.length * 10, // Assuming ₹10 per card
    todayOrders: orders.filter(o => {
      const orderDate = new Date(o._createdDate || '');
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-[100rem] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading text-slate-900 mb-2">Admin Dashboard</h1>
              <p className="font-paragraph text-slate-600">
                Manage Vestige PVC ID card orders, stores, and analytics
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp Center
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('adminAuth');
                  localStorage.removeItem('adminLoginId');
                  navigate('/admin/login');
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Orders</p>
                  <p className="text-2xl font-heading">{stats.totalOrders}</p>
                  <p className="text-blue-200 text-xs">+{stats.todayOrders} today</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Pending</p>
                  <p className="text-2xl font-heading">{stats.pendingOrders}</p>
                  <p className="text-yellow-200 text-xs">Awaiting print</p>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Printed</p>
                  <p className="text-2xl font-heading">{stats.printedCards}</p>
                  <p className="text-purple-200 text-xs">Ready to dispatch</p>
                </div>
                <Printer className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Dispatched</p>
                  <p className="text-2xl font-heading">{stats.dispatchedCards}</p>
                  <p className="text-indigo-200 text-xs">In transit</p>
                </div>
                <Truck className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Stores</p>
                  <p className="text-2xl font-heading">{stats.totalStores}</p>
                  <p className="text-green-200 text-xs">Partners</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Revenue</p>
                  <p className="text-2xl font-heading">₹{stats.totalRevenue}</p>
                  <p className="text-emerald-200 text-xs">Total earned</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 bg-white">
              <TabsTrigger value="orders" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Orders Management</TabsTrigger>
              <TabsTrigger value="stores" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Store Partners</TabsTrigger>
              <TabsTrigger value="payouts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Payout Control</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Reports & Analytics</TabsTrigger>
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">WhatsApp Center</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="bg-white shadow-sm">
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="font-heading text-slate-900">Orders Management</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => exportData('csv', 'daily')} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Today
                      </Button>
                      <Button onClick={() => sendWhatsAppNotification('all', 'Bulk update notification')} variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Bulk WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Enhanced Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by name, Vestige ID, or mobile..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48 bg-white">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Printed">Printed</SelectItem>
                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Enhanced Orders Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-heading">Customer</TableHead>
                          <TableHead className="font-heading">Vestige ID</TableHead>
                          <TableHead className="font-heading">Mobile</TableHead>
                          <TableHead className="font-heading">Photo</TableHead>
                          <TableHead className="font-heading">Signature</TableHead>
                          <TableHead className="font-heading">Store</TableHead>
                          <TableHead className="font-heading">Payment</TableHead>
                          <TableHead className="font-heading">Status</TableHead>
                          <TableHead className="font-heading">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => {
                          const StatusIcon = getStatusIcon(order.orderStatus || 'Pending');
                          return (
                            <TableRow key={order._id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{order.customerName}</TableCell>
                              <TableCell className="font-mono text-sm">{order.vestigeId}</TableCell>
                              <TableCell>{order.mobileNumber}</TableCell>
                              <TableCell>
                                {order.customerPhoto ? (
                                  <Image src={order.customerPhoto} alt="Customer" className="w-10 h-12 object-cover rounded border" />
                                ) : (
                                  <div className="w-10 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs">No Photo</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {order.customerSignature ? (
                                  <Image src={order.customerSignature} alt="Signature" className="w-16 h-6 object-contain rounded border" />
                                ) : (
                                  <div className="w-16 h-6 bg-gray-100 rounded border flex items-center justify-center text-xs">No Sign</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-slate-600">Store #{order._id.slice(-4)}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <StatusIcon className="w-4 h-4" />
                                  <Badge className={getStatusColor(order.orderStatus || 'Pending')}>
                                    {order.orderStatus || 'Pending'}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Select
                                    value={order.orderStatus || 'Pending'}
                                    onValueChange={(value) => updateOrderStatus(order._id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="Printed">Printed</SelectItem>
                                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                                      <SelectItem value="Delivered">Delivered</SelectItem>
                                      <SelectItem value="Received">Received</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendWhatsAppNotification(order._id, `Your order status: ${order.orderStatus}`)}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="font-paragraph text-slate-500">No orders found matching your criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stores">
              <Card className="bg-white shadow-sm">
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="font-heading text-slate-900">Store Partner Management</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center space-x-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        <span>{showPassword ? 'Hide' : 'Show'} Passwords</span>
                      </Button>
                      {stores.length > 0 && (
                        <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear All Stores
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear All Stores</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete all {stores.length} stores? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={clearAllStores}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete All Stores
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Store
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Store Partner</DialogTitle>
                          </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input
                              id="storeName"
                              value={newStore.storeName}
                              onChange={(e) => setNewStore({...newStore, storeName: e.target.value})}
                              placeholder="Enter store name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="storeCity">City</Label>
                            <Input
                              id="storeCity"
                              value={newStore.storeCity}
                              onChange={(e) => setNewStore({...newStore, storeCity: e.target.value})}
                              placeholder="Enter city"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <Input
                              id="contactPerson"
                              value={newStore.contactPerson}
                              onChange={(e) => setNewStore({...newStore, contactPerson: e.target.value})}
                              placeholder="Enter contact person name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contactNumber">Phone Number</Label>
                            <Input
                              id="contactNumber"
                              value={newStore.contactNumber}
                              onChange={(e) => setNewStore({...newStore, contactNumber: e.target.value})}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="storeAddress">Address</Label>
                            <Textarea
                              id="storeAddress"
                              value={newStore.storeAddress}
                              onChange={(e) => setNewStore({...newStore, storeAddress: e.target.value})}
                              placeholder="Enter complete address"
                              rows={3}
                            />
                          </div>
                          <Button onClick={addStore} className="w-full bg-blue-500 hover:bg-blue-600">
                            Add Store Partner
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto bg-white rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-heading">Store Name</TableHead>
                          <TableHead className="font-heading">City</TableHead>
                          <TableHead className="font-heading">Contact Person</TableHead>
                          <TableHead className="font-heading">Phone</TableHead>
                          <TableHead className="font-heading">Status</TableHead>
                          <TableHead className="font-heading">Login Credentials</TableHead>
                          <TableHead className="font-heading">Orders</TableHead>
                          <TableHead className="font-heading">Performance</TableHead>
                          <TableHead className="font-heading">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map((store) => {
                          const storeOrders = orders.filter(o => o.vestigeId?.includes(store._id.slice(-4)));
                          const deliveredOrders = storeOrders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Received');
                          const performance = storeOrders.length > 0 ? Math.round((deliveredOrders.length / storeOrders.length) * 100) : 0;
                          
                          return (
                            <TableRow key={store._id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{store.storeName}</TableCell>
                              <TableCell>{store.storeCity}</TableCell>
                              <TableCell>{store.contactPerson}</TableCell>
                              <TableCell>{store.contactNumber}</TableCell>
                              <TableCell>
                                <Badge className={store.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                  {store.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const credentials = getStoreCredentials(store._id);
                                  return credentials ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-600">ID:</span>
                                        <code className="text-xs bg-slate-100 px-1 rounded">{credentials.username}</code>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(credentials.username || '', 'Login ID')}
                                          className="h-4 w-4 p-0"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-600">Pass:</span>
                                        <code className="text-xs bg-slate-100 px-1 rounded">
                                          {showPassword ? credentials.password : '••••••••'}
                                        </code>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(credentials.password || '', 'Password')}
                                          className="h-4 w-4 p-0"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => openCredentialsDialog(store, true)}
                                          className="h-6 px-2 text-xs"
                                        >
                                          <Edit className="w-3 h-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => resetStorePassword(store._id)}
                                          className="h-6 px-2 text-xs"
                                        >
                                          <RefreshCw className="w-3 h-3 mr-1" />
                                          Reset
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openCredentialsDialog(store)}
                                      className="h-8 px-3 text-xs"
                                    >
                                      <Key className="w-3 h-3 mr-1" />
                                      Create Login
                                    </Button>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                <div className="text-center">
                                  <div className="text-lg font-semibold">{storeOrders.length}</div>
                                  <div className="text-xs text-slate-500">{deliveredOrders.length} delivered</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${performance >= 80 ? 'bg-green-500' : performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${performance}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{performance}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => sendWhatsAppNotification(store._id, `New batch assigned to ${store.storeName}`)}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDeleteStore(store)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payout Control Panel Tab */}
            <TabsContent value="payouts">
              <div className="space-y-6">
                {/* Payout Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Pending Requests</p>
                          <p className="text-2xl font-heading">{payoutRequests.filter(r => r.status === 'Pending').length}</p>
                          <p className="text-orange-200 text-xs">Awaiting approval</p>
                        </div>
                        <Timer className="w-8 h-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Approved Payouts</p>
                          <p className="text-2xl font-heading">{payoutRequests.filter(r => r.status === 'Approved').length}</p>
                          <p className="text-green-200 text-xs">Ready to process</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Paid</p>
                          <p className="text-2xl font-heading">₹{payoutRequests.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0)}</p>
                          <p className="text-blue-200 text-xs">This month</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Bank Approvals</p>
                          <p className="text-2xl font-heading">{storeBankDetails.filter(d => !d.approved).length}</p>
                          <p className="text-purple-200 text-xs">Pending verification</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payout Requests Management */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading text-slate-900">Payout Requests</CardTitle>
                      <div className="flex space-x-2">
                        <Button onClick={() => exportPayoutReport('monthly')} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Monthly
                        </Button>
                        <Button onClick={() => exportPayoutReport('quarterly')} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Quarterly
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-heading">Request ID</TableHead>
                            <TableHead className="font-heading">Store Name</TableHead>
                            <TableHead className="font-heading">Amount</TableHead>
                            <TableHead className="font-heading">Request Date</TableHead>
                            <TableHead className="font-heading">Payment Mode</TableHead>
                            <TableHead className="font-heading">Status</TableHead>
                            <TableHead className="font-heading">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payoutRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-slate-50">
                              <TableCell className="font-mono">{request.id}</TableCell>
                              <TableCell className="font-medium">{request.storeName}</TableCell>
                              <TableCell className="font-heading text-lg">₹{request.amount}</TableCell>
                              <TableCell>{request.requestDate}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {request.bankDetails.preferredMode}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  request.status === 'Pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                  request.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                  request.status === 'Paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  'bg-red-100 text-red-800 border-red-200'
                                }>
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog open={isPayoutDialogOpen && selectedPayoutRequest?.id === request.id} onOpenChange={setIsPayoutDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setSelectedPayoutRequest(request)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg">
                                      <DialogHeader>
                                        <DialogTitle>Payout Request Details</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm text-slate-600">Store Name</Label>
                                              <p className="font-medium">{request.storeName}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm text-slate-600">Amount</Label>
                                              <p className="font-heading text-xl">₹{request.amount}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm text-slate-600">Request Date</Label>
                                              <p className="font-medium">{request.requestDate}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm text-slate-600">Payment Mode</Label>
                                              <p className="font-medium capitalize">{request.bankDetails.preferredMode}</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                          <h4 className="font-heading text-blue-800 mb-2">Bank Details</h4>
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-slate-600">Account Holder:</span>
                                              <span className="font-medium">{request.bankDetails.accountHolderName}</span>
                                            </div>
                                            {request.bankDetails.preferredMode === 'bank' && (
                                              <>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-slate-600">Bank Name:</span>
                                                  <span className="font-medium">{request.bankDetails.bankName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-slate-600">Account Number:</span>
                                                  <span className="font-mono">{request.bankDetails.accountNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-slate-600">IFSC Code:</span>
                                                  <span className="font-mono">{request.bankDetails.ifscCode}</span>
                                                </div>
                                              </>
                                            )}
                                            {request.bankDetails.preferredMode === 'upi' && (
                                              <div className="flex justify-between">
                                                <span className="text-sm text-slate-600">UPI ID:</span>
                                                <span className="font-medium">{request.bankDetails.upiId}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex space-x-2">
                                          {request.status === 'Pending' && (
                                            <>
                                              <Button 
                                                onClick={() => approvePayoutRequest(request.id)}
                                                className="flex-1 bg-green-500 hover:bg-green-600"
                                              >
                                                Approve Request
                                              </Button>
                                              <Button 
                                                onClick={() => rejectPayoutRequest(request.id)}
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                              >
                                                Reject Request
                                              </Button>
                                            </>
                                          )}
                                          {request.status === 'Approved' && (
                                            <Button 
                                              onClick={() => markPayoutAsPaid(request.id)}
                                              className="w-full bg-blue-500 hover:bg-blue-600"
                                            >
                                              Mark as Paid
                                            </Button>
                                          )}
                                          {request.status === 'Paid' && (
                                            <div className="w-full text-center py-2">
                                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Payment Completed
                                              </Badge>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  {request.status === 'Approved' && (
                                    <Button 
                                      size="sm" 
                                      className="bg-blue-500 hover:bg-blue-600"
                                      onClick={() => markPayoutAsPaid(request.id)}
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Details Approval */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="font-heading text-slate-900">Bank Details Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-heading">Store Name</TableHead>
                            <TableHead className="font-heading">Account Holder</TableHead>
                            <TableHead className="font-heading">Bank/UPI Details</TableHead>
                            <TableHead className="font-heading">Submitted Date</TableHead>
                            <TableHead className="font-heading">Status</TableHead>
                            <TableHead className="font-heading">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {storeBankDetails.map((details) => (
                            <TableRow key={details.storeId} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{details.storeName}</TableCell>
                              <TableCell>{details.accountHolderName}</TableCell>
                              <TableCell>
                                {details.preferredMode === 'bank' ? (
                                  <div className="text-sm">
                                    <p className="font-medium">{details.bankName}</p>
                                    <p className="text-slate-600 font-mono">****{details.accountNumber.slice(-4)}</p>
                                    <p className="text-slate-600 font-mono">{details.ifscCode}</p>
                                  </div>
                                ) : (
                                  <div className="text-sm">
                                    <p className="font-medium">UPI Transfer</p>
                                    <p className="text-slate-600">{details.upiId}</p>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{details.submittedDate}</TableCell>
                              <TableCell>
                                <Badge className={details.approved ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}>
                                  {details.approved ? 'Approved' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {!details.approved && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => approveBankDetails(details.storeId)}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {details.approved && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-6">
                {/* Report Generation */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="font-heading text-slate-900">Reports & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardContent className="p-6 text-center">
                          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <h3 className="font-heading text-lg mb-2">Daily Reports</h3>
                          <p className="text-sm text-slate-600 mb-4">Today's orders and performance</p>
                          <div className="space-y-2">
                            <Button onClick={() => exportData('csv', 'daily')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              CSV Report
                            </Button>
                            <Button onClick={() => exportData('excel', 'daily')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Excel Report
                            </Button>
                            <Button onClick={() => exportData('pdf', 'daily')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              PDF Report
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-6 text-center">
                          <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h3 className="font-heading text-lg mb-2">Weekly Reports</h3>
                          <p className="text-sm text-slate-600 mb-4">Last 7 days performance</p>
                          <div className="space-y-2">
                            <Button onClick={() => exportData('csv', 'weekly')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              CSV Report
                            </Button>
                            <Button onClick={() => exportData('excel', 'weekly')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Excel Report
                            </Button>
                            <Button onClick={() => exportData('pdf', 'weekly')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              PDF Report
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-purple-200 bg-purple-50">
                        <CardContent className="p-6 text-center">
                          <BarChart3 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                          <h3 className="font-heading text-lg mb-2">Monthly Reports</h3>
                          <p className="text-sm text-slate-600 mb-4">Last 30 days analytics</p>
                          <div className="space-y-2">
                            <Button onClick={() => exportData('csv', 'monthly')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              CSV Report
                            </Button>
                            <Button onClick={() => exportData('excel', 'monthly')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Excel Report
                            </Button>
                            <Button onClick={() => exportData('pdf', 'monthly')} variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              PDF Report
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Analytics Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-heading text-slate-900">Order Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-paragraph text-slate-700">Pending</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-yellow-500 h-3 rounded-full" 
                                    style={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="font-paragraph text-sm w-8">{stats.pendingOrders}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-paragraph text-slate-700">Printed</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-blue-500 h-3 rounded-full" 
                                    style={{ width: `${stats.totalOrders > 0 ? (stats.printedCards / stats.totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="font-paragraph text-sm w-8">{stats.printedCards}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-paragraph text-slate-700">Dispatched</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-purple-500 h-3 rounded-full" 
                                    style={{ width: `${stats.totalOrders > 0 ? (stats.dispatchedCards / stats.totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="font-paragraph text-sm w-8">{stats.dispatchedCards}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-paragraph text-slate-700">Delivered</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-green-500 h-3 rounded-full" 
                                    style={{ width: `${stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="font-paragraph text-sm w-8">{stats.deliveredOrders}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="font-heading text-slate-900">Revenue & Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-slate-700">Total Orders</span>
                              <span className="font-heading text-xl text-slate-900">{stats.totalOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-slate-700">Today's Orders</span>
                              <span className="font-heading text-xl text-blue-600">{stats.todayOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-slate-700">Rate per Card</span>
                              <span className="font-heading text-xl text-slate-900">₹10</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-slate-700">Active Partners</span>
                              <span className="font-heading text-xl text-green-600">{stats.totalStores}</span>
                            </div>
                            <hr className="border-slate-200" />
                            <div className="flex justify-between items-center">
                              <span className="font-heading text-slate-900">Total Revenue</span>
                              <span className="font-heading text-2xl text-emerald-600">₹{stats.totalRevenue}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="whatsapp">
          <div className="space-y-6">
            {/* WhatsApp Automation Center */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="font-heading text-slate-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-green-500" />
                  WhatsApp Automation Center
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Quick Actions */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <h3 className="font-heading text-lg mb-4 text-green-800">Quick Notifications</h3>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => sendWhatsAppNotification('all-pending', 'Your ID card is being processed')}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          Notify Pending Orders
                        </Button>
                        <Button 
                          onClick={() => sendWhatsAppNotification('all-printed', 'Your ID card has been printed and will be dispatched soon')}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          Notify Printed Cards
                        </Button>
                        <Button 
                          onClick={() => sendWhatsAppNotification('all-dispatched', 'Your ID card has been dispatched to the store')}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                          size="sm"
                        >
                          Notify Dispatched
                        </Button>
                        <Button 
                          onClick={() => sendWhatsAppNotification('all-delivered', 'Your ID card is ready for pickup at the store')}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                          size="sm"
                        >
                          Notify Ready for Pickup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Automation Settings */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <h3 className="font-heading text-lg mb-4 text-blue-800">Automation Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto-notify on status change</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Daily summary to stores</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment confirmations</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pickup reminders</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Save Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Message Templates */}
                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-6">
                      <h3 className="font-heading text-lg mb-4 text-purple-800">Message Templates</h3>
                      <div className="space-y-3">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Order Confirmation
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Payment Received
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Card Printed
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Ready for Pickup
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Pickup Reminder
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent WhatsApp Activity */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="font-heading text-slate-900">Recent WhatsApp Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: '2 minutes ago', message: 'Order confirmation sent to +91 98765 43210', status: 'delivered' },
                        { time: '5 minutes ago', message: 'Bulk notification sent to 15 pending orders', status: 'delivered' },
                        { time: '10 minutes ago', message: 'Pickup reminder sent to +91 98765 43211', status: 'delivered' },
                        { time: '15 minutes ago', message: 'Store notification sent to partner store', status: 'delivered' },
                        { time: '20 minutes ago', message: 'Payment confirmation sent to +91 98765 43212', status: 'delivered' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                              <p className="text-xs text-slate-500">{activity.time}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
          </Tabs>
        </motion.div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-foreground">Order Details</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-paragraph text-sm text-foreground/70">Customer Name</label>
                      <p className="font-paragraph font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <label className="font-paragraph text-sm text-foreground/70">Vestige ID</label>
                      <p className="font-paragraph font-medium">{selectedOrder.vestigeId}</p>
                    </div>
                    <div>
                      <label className="font-paragraph text-sm text-foreground/70">Mobile Number</label>
                      <p className="font-paragraph font-medium">{selectedOrder.mobileNumber}</p>
                    </div>
                    <div>
                      <label className="font-paragraph text-sm text-foreground/70">Status</label>
                      <Badge className={getStatusColor(selectedOrder.orderStatus || 'Pending')}>
                        {selectedOrder.orderStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="font-paragraph text-sm text-foreground/70">Address</label>
                    <p className="font-paragraph">{selectedOrder.customerAddress}</p>
                  </div>
                  {selectedOrder.customerPhoto && (
                    <div>
                      <label className="font-paragraph text-sm text-foreground/70">Photo</label>
                      <Image src={selectedOrder.customerPhoto} alt="Customer" className="w-32 h-40 object-cover rounded border" />
                    </div>
                  )}
                  {selectedOrder.customerSignature && (
                    <div>
                      <label className="font-paragraph text-sm text-foreground/70">Signature</label>
                      <Image src={selectedOrder.customerSignature} alt="Signature" className="w-48 h-16 object-contain rounded border" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Store Credentials Management Dialog */}
        <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditingCredentials ? 'Edit' : 'Create'} Store Login Credentials
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Store: {selectedStoreForCredentials?.storeName}
                </p>
                <p className="text-xs text-blue-600">
                  {isEditingCredentials ? 'Update login credentials for this store' : 'Create secure login credentials for this store partner'}
                </p>
              </div>

              <div>
                <Label htmlFor="loginId">Login ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="loginId"
                    value={credentialsForm.loginId}
                    onChange={(e) => setCredentialsForm({...credentialsForm, loginId: e.target.value})}
                    placeholder="Enter unique login ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCredentialsForm({
                      ...credentialsForm, 
                      loginId: generateLoginId(selectedStoreForCredentials?.storeName || '')
                    })}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Unique identifier for store login (e.g., mumbai_central_001)
                </p>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentialsForm.password}
                      onChange={(e) => setCredentialsForm({...credentialsForm, password: e.target.value})}
                      placeholder="Enter secure password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCredentialsForm({
                      ...credentialsForm, 
                      password: generateSecurePassword(),
                      confirmPassword: ''
                    })}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 8 characters with letters, numbers, and symbols
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={credentialsForm.confirmPassword}
                  onChange={(e) => setCredentialsForm({...credentialsForm, confirmPassword: e.target.value})}
                  placeholder="Re-enter password to confirm"
                />
                {credentialsForm.password && credentialsForm.confirmPassword && 
                 credentialsForm.password !== credentialsForm.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Key className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Security Note</p>
                    <p className="text-xs text-yellow-700">
                      Store these credentials securely. Share them with the store partner through a secure channel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => setIsCredentialsDialogOpen(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveStoreCredentials} 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  disabled={!credentialsForm.loginId || !credentialsForm.password || 
                           credentialsForm.password !== credentialsForm.confirmPassword}
                >
                  {isEditingCredentials ? 'Update' : 'Create'} Credentials
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Store Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Store Partner</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{storeToDelete?.storeName}"? This action cannot be undone and will permanently remove the store partner from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={deleteStore}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Store
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}