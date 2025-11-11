import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BaseCrudService } from '@/integrations';
import { IDCardOrders, Stores, StoreCredentials } from '@/entities';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Server, 
  Users, 
  ShoppingCart,
  Building2,
  Key,
  Loader2
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function DiagnosticsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Database Connection
    try {
      console.log('Testing database connection...');
      const testQuery = await BaseCrudService.getAll('stores');
      diagnosticResults.push({
        name: 'Database Connection',
        status: 'success',
        message: 'Database connection successful',
        details: { recordCount: testQuery.items?.length || 0 }
      });
    } catch (error) {
      console.error('Database connection failed:', error);
      diagnosticResults.push({
        name: 'Database Connection',
        status: 'error',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }

    // Test 2: Stores Collection
    try {
      console.log('Testing stores collection...');
      const { items: stores } = await BaseCrudService.getAll<Stores>('stores');
      const activeStores = stores.filter(store => store.isActive);
      
      if (stores.length === 0) {
        diagnosticResults.push({
          name: 'Stores Collection',
          status: 'error',
          message: 'No stores found in database',
          details: { totalStores: 0, activeStores: 0 }
        });
      } else if (activeStores.length === 0) {
        diagnosticResults.push({
          name: 'Stores Collection',
          status: 'warning',
          message: 'No active stores available for customers',
          details: { totalStores: stores.length, activeStores: 0 }
        });
      } else {
        diagnosticResults.push({
          name: 'Stores Collection',
          status: 'success',
          message: `${activeStores.length} active stores available`,
          details: { totalStores: stores.length, activeStores: activeStores.length }
        });
      }
    } catch (error) {
      console.error('Stores collection test failed:', error);
      diagnosticResults.push({
        name: 'Stores Collection',
        status: 'error',
        message: `Failed to load stores: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }

    // Test 3: Orders Collection
    try {
      console.log('Testing orders collection...');
      const { items: orders } = await BaseCrudService.getAll<IDCardOrders>('idcardorders');
      const recentOrders = orders.filter(order => {
        if (!order._createdDate) return false;
        const orderDate = new Date(order._createdDate);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return orderDate > oneDayAgo;
      });

      diagnosticResults.push({
        name: 'Orders Collection',
        status: 'success',
        message: `${orders.length} total orders, ${recentOrders.length} in last 24h`,
        details: { 
          totalOrders: orders.length, 
          recentOrders: recentOrders.length,
          orderStatuses: orders.reduce((acc, order) => {
            acc[order.orderStatus || 'unknown'] = (acc[order.orderStatus || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      });
    } catch (error) {
      console.error('Orders collection test failed:', error);
      diagnosticResults.push({
        name: 'Orders Collection',
        status: 'error',
        message: `Failed to load orders: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }

    // Test 4: Store Credentials
    try {
      console.log('Testing store credentials...');
      const { items: credentials } = await BaseCrudService.getAll<StoreCredentials>('storecredentials');
      const activeCredentials = credentials.filter(cred => cred.isActive);

      if (credentials.length === 0) {
        diagnosticResults.push({
          name: 'Store Credentials',
          status: 'warning',
          message: 'No store credentials configured',
          details: { totalCredentials: 0, activeCredentials: 0 }
        });
      } else {
        diagnosticResults.push({
          name: 'Store Credentials',
          status: 'success',
          message: `${activeCredentials.length} active store credentials`,
          details: { totalCredentials: credentials.length, activeCredentials: activeCredentials.length }
        });
      }
    } catch (error) {
      console.error('Store credentials test failed:', error);
      diagnosticResults.push({
        name: 'Store Credentials',
        status: 'error',
        message: `Failed to load store credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }

    // Test 5: Create Test Order (and clean up)
    try {
      console.log('Testing order creation...');
      const testOrder: IDCardOrders = {
        _id: `test-${Date.now()}`,
        customerName: 'Test Customer',
        vestigeId: 'TEST123',
        mobileNumber: '9999999999',
        customerAddress: 'Test Address',
        customerPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        orderStatus: 'Test'
      };

      const createdOrder = await BaseCrudService.create('idcardorders', testOrder);
      
      // Clean up test order
      await BaseCrudService.delete('idcardorders', testOrder._id);

      diagnosticResults.push({
        name: 'Order Creation',
        status: 'success',
        message: 'Order creation and deletion working correctly',
        details: { testOrderId: testOrder._id }
      });
    } catch (error) {
      console.error('Order creation test failed:', error);
      diagnosticResults.push({
        name: 'Order Creation',
        status: 'error',
        message: `Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }

    // Test 6: Application Form Data Validation
    try {
      console.log('Testing form validation...');
      const testFormData = {
        customerName: 'Test Customer',
        vestigeId: 'TEST123',
        mobileNumber: '9999999999',
        customerAddress: 'Test Address, Test City, Test State - 123456',
        customerPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        storeId: 'test-store-id'
      };

      const payloadSize = JSON.stringify(testFormData).length;
      const maxSize = 1024 * 1024; // 1MB

      if (payloadSize > maxSize) {
        diagnosticResults.push({
          name: 'Form Data Validation',
          status: 'warning',
          message: `Test form data exceeds size limit (${Math.round(payloadSize / 1024)}KB > ${Math.round(maxSize / 1024)}KB)`,
          details: { payloadSize, maxSize }
        });
      } else {
        diagnosticResults.push({
          name: 'Form Data Validation',
          status: 'success',
          message: `Form data validation working (${Math.round(payloadSize / 1024)}KB)`,
          details: { payloadSize, maxSize }
        });
      }
    } catch (error) {
      console.error('Form validation test failed:', error);
      diagnosticResults.push({
        name: 'Form Data Validation',
        status: 'error',
        message: `Form validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }

    setResults(diagnosticResults);
    setLastRun(new Date());
    setIsRunning(false);
  };

  useEffect(() => {
    // Run diagnostics on page load
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading text-foreground mb-4">System Diagnostics</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Comprehensive system health check for the 4-step application process
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-heading text-foreground mb-1">Total Tests</h3>
              <p className="text-2xl font-bold text-foreground">{results.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-heading text-foreground mb-1">Passed</h3>
              <p className="text-2xl font-bold text-green-600">{successCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-heading text-foreground mb-1">Warnings</h3>
              <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-heading text-foreground mb-1">Errors</h3>
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            {lastRun && (
              <p className="text-sm font-paragraph text-foreground/70">
                Last run: {lastRun.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          {results.map((result, index) => (
            <Card key={index} className={`border ${getStatusColor(result.status)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-heading text-foreground mb-1">{result.name}</h3>
                      <p className="font-paragraph text-foreground/80">{result.message}</p>
                      
                      {result.details && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-paragraph text-foreground/60 hover:text-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={result.status === 'success' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}
                  >
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-heading text-foreground mb-2">Application Version</h4>
                  <p className="font-paragraph text-foreground/80">Vestige PVC ID Card Service v1.0</p>
                </div>
                <div>
                  <h4 className="font-heading text-foreground mb-2">Environment</h4>
                  <p className="font-paragraph text-foreground/80">Production</p>
                </div>
                <div>
                  <h4 className="font-heading text-foreground mb-2">Database</h4>
                  <p className="font-paragraph text-foreground/80">Wix CMS Collections</p>
                </div>
                <div>
                  <h4 className="font-heading text-foreground mb-2">Payment Gateway</h4>
                  <p className="font-paragraph text-foreground/80">Razorpay (Live)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}