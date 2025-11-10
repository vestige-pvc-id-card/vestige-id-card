import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseCrudService } from '@/integrations';
import { IDCardOrders, Stores } from '@/entities';
import { Search, Download, Users, CreditCard, Package, TrendingUp, Eye, Edit } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<IDCardOrders[]>([]);
  const [stores, setStores] = useState<Stores[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IDCardOrders[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<IDCardOrders | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Order ID', 'Customer Name', 'Vestige ID', 'Mobile', 'Status', 'Created Date'].join(','),
      ...filteredOrders.map(order => [
        order._id,
        order.customerName || '',
        order.vestigeId || '',
        order.mobileNumber || '',
        order.orderStatus || '',
        order._createdDate ? new Date(order._createdDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vestige-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Received': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length,
    deliveredOrders: orders.filter(o => o.orderStatus === 'Delivered').length,
    receivedOrders: orders.filter(o => o.orderStatus === 'Received').length,
    totalStores: stores.filter(s => s.isActive).length,
    totalRevenue: orders.length * 10 // Assuming ₹10 per card
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-[100rem] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading text-foreground mb-2">Admin Dashboard</h1>
          <p className="font-paragraph text-foreground/70">
            Manage Vestige PVC ID card orders, stores, and view analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-foreground/70 text-sm">Total Orders</p>
                  <p className="text-2xl font-heading text-foreground">{stats.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-foreground/70 text-sm">Pending Orders</p>
                  <p className="text-2xl font-heading text-foreground">{stats.pendingOrders}</p>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-foreground/70 text-sm">Active Stores</p>
                  <p className="text-2xl font-heading text-foreground">{stats.totalStores}</p>
                </div>
                <Users className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-foreground/70 text-sm">Total Revenue</p>
                  <p className="text-2xl font-heading text-foreground">₹{stats.totalRevenue}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
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
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="orders">Orders Management</TabsTrigger>
              <TabsTrigger value="stores">Stores Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="font-heading text-foreground">Orders Management</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={exportData} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by name, Vestige ID, or mobile..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Vestige ID</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell className="font-medium">{order.customerName}</TableCell>
                            <TableCell>{order.vestigeId}</TableCell>
                            <TableCell>{order.mobileNumber}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.orderStatus || 'Pending')}>
                                {order.orderStatus || 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order._createdDate ? new Date(order._createdDate).toLocaleDateString() : '-'}
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
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Received">Received</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="font-paragraph text-foreground/70">No orders found matching your criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stores">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">Stores Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Store Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Orders</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map((store) => {
                          const storeOrders = orders.filter(o => o.vestigeId?.includes(store._id.slice(-4)));
                          return (
                            <TableRow key={store._id}>
                              <TableCell className="font-medium">{store.storeName}</TableCell>
                              <TableCell>{store.storeCity}</TableCell>
                              <TableCell>{store.contactPerson}</TableCell>
                              <TableCell>{store.contactNumber}</TableCell>
                              <TableCell>
                                <Badge className={store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {store.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{storeOrders.length}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading text-foreground">Order Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-paragraph text-foreground/70">Pending</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-paragraph text-sm">{stats.pendingOrders}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-paragraph text-foreground/70">Delivered</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(stats.deliveredOrders / stats.totalOrders) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-paragraph text-sm">{stats.deliveredOrders}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-paragraph text-foreground/70">Received</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(stats.receivedOrders / stats.totalOrders) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-paragraph text-sm">{stats.receivedOrders}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading text-foreground">Revenue Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground/70">Total Orders</span>
                        <span className="font-paragraph font-medium">{stats.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground/70">Rate per Card</span>
                        <span className="font-paragraph font-medium">₹10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground/70">Store Commission</span>
                        <span className="font-paragraph font-medium">₹10 per card</span>
                      </div>
                      <hr />
                      <div className="flex justify-between text-lg">
                        <span className="font-heading text-foreground">Total Revenue</span>
                        <span className="font-heading text-primary">₹{stats.totalRevenue}</span>
                      </div>
                    </div>
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
      </div>
    </div>
  );
}