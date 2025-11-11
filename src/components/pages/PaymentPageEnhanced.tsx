import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BaseCrudService } from '@/integrations';
import { IDCardOrders } from '@/entities';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  Building2,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Truck,
  Edit
} from 'lucide-react';

interface PaymentPageProps {
  orderId?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  };
  timeout?: number;
  remember_customer?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage({ orderId: propOrderId }: PaymentPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<IDCardOrders | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);

  // Get order ID from props, URL params, or location state
  const orderId = propOrderId || 
    new URLSearchParams(location.search).get('orderId') || 
    location.state?.orderId;

  const CARD_PRICE = 100; // Price in INR
  const RAZORPAY_KEY = 'rzp_live_Re2NQGpbsbDDeC'; // Live Razorpay key

  // Proper error logging function
  const logError = (message: string, error?: any) => {
    console.error(`[PaymentPage] ${message}`, error);
  };

  // Info logging function
  const logInfo = (message: string, data?: any) => {
    console.log(`[PaymentPage] ${message}`, data);
  };

  useEffect(() => {
    if (!orderId) {
      logError('No order ID found, redirecting to apply page');
      navigate('/apply');
      return;
    }
    
    loadOrder();
    loadRazorpayScript();
  }, [orderId]);

  const loadRazorpayScript = () => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      logInfo('Razorpay already loaded');
      setRazorpayLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="razorpay"]');
    if (existingScript) {
      logInfo('Razorpay script already exists, waiting for load');
      existingScript.addEventListener('load', () => {
        logInfo('Existing Razorpay script loaded successfully');
        setRazorpayLoaded(true);
        setScriptLoadError(null);
      });
      existingScript.addEventListener('error', (error) => {
        const errorMsg = 'Failed to load existing Razorpay script';
        logError(errorMsg, error);
        setScriptLoadError(errorMsg);
      });
      return;
    }

    logInfo('Creating new Razorpay script element');
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      logInfo('Razorpay script loaded successfully');
      setRazorpayLoaded(true);
      setScriptLoadError(null);
    };
    script.onerror = (error) => {
      const errorMsg = 'Failed to load Razorpay script';
      logError(errorMsg, error);
      setScriptLoadError(errorMsg);
    };
    
    document.body.appendChild(script);
  };

  const loadOrder = async () => {
    if (!orderId) {
      logError('Cannot load order: orderId is missing');
      navigate('/apply');
      return;
    }

    try {
      setIsLoading(true);
      logInfo('Loading order data', { orderId });
      
      const orderData = await BaseCrudService.getById<IDCardOrders>('idcardorders', orderId);
      logInfo('Order data response:', orderData);
      
      if (orderData) {
        logInfo('Order loaded successfully', orderData);
        setOrder(orderData);
      } else {
        logError('Order not found - received null/undefined response');
        alert('Order not found. Please check your order ID or try applying again.');
        navigate('/apply');
      }
    } catch (error) {
      logError('Error loading order', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          alert('Network error while loading order. Please check your internet connection and try again.');
        } else if (error.message.includes('timeout')) {
          alert('Request timed out while loading order. Please try again.');
        } else {
          alert(`Error loading order: ${error.message}`);
        }
      } else {
        alert('An unexpected error occurred while loading your order. Please try again.');
      }
      
      navigate('/apply');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePaymentId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `PAY_${timestamp}_${random}`.toUpperCase();
  };

  const sendWhatsAppConfirmation = async (paymentId: string) => {
    try {
      const message = `🎉 Payment Confirmed!

Order Details:
• Customer: ${order?.customerName}
• Vestige ID: ${order?.vestigeId}
• Payment ID: ${paymentId}
• Amount: ₹${CARD_PRICE}
• Date: ${new Date().toLocaleDateString('en-IN')}

Your Vestige PVC ID Card is now being processed. You will receive it at your selected store within 7-10 business days.

Track your order status at: ${window.location.origin}

Thank you for choosing Vestige!`;

      // For production, implement actual Twilio WhatsApp API call here
      logInfo('WhatsApp confirmation prepared', { to: order?.mobileNumber });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      logError('Error preparing WhatsApp confirmation', error);
      return false;
    }
  };

  const handlePayment = async () => {
    // Comprehensive validation with user-friendly messages
    if (!razorpayLoaded) {
      alert('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    if (!order) {
      alert('Order information is missing. Please go back and try again.');
      return;
    }

    if (!window.Razorpay) {
      logError('window.Razorpay not available despite razorpayLoaded being true');
      alert('Payment system failed to load. Please refresh the page and try again.');
      return;
    }

    // Validate required order fields
    if (!order.customerName || !order.vestigeId || !order.mobileNumber) {
      logError('Missing required order fields', {
        hasName: !!order.customerName,
        hasVestigeId: !!order.vestigeId,
        hasMobile: !!order.mobileNumber
      });
      alert('Order information is incomplete. Please go back and fill all required fields.');
      return;
    }

    // Validate API key
    if (!RAZORPAY_KEY || RAZORPAY_KEY.length < 10) {
      logError('Invalid Razorpay API key');
      alert('Payment configuration error. Please contact support.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus('processing');

    try {
      const paymentId = generatePaymentId();
      logInfo('Initiating payment', { paymentId });
      
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY,
        amount: CARD_PRICE * 100, // Amount in paise
        currency: 'INR',
        name: 'Vestige PVC ID Cards',
        description: `PVC ID Card for ${order.customerName} (Vestige ID: ${order.vestigeId})`,
        order_id: paymentId,
        handler: async (response: any) => {
          try {
            logInfo('Payment successful', { paymentId: response.razorpay_payment_id });
            
            // Update order status to paid
            const updateResult = await BaseCrudService.update('idcardorders', {
              _id: order._id,
              orderStatus: 'Paid',
            });

            logInfo('Order status updated to Paid', updateResult);

            // Send WhatsApp confirmation
            await sendWhatsAppConfirmation(response.razorpay_payment_id || paymentId);

            setPaymentStatus('success');
            
            // Redirect to success page after 3 seconds
            setTimeout(() => {
              navigate('/', { state: { paymentSuccess: true } });
            }, 3000);

          } catch (error) {
            logError('Error in payment success handler', error);
            
            // More specific error handling for payment success issues
            let errorMessage = 'Payment was successful but there was an issue updating your order. ';
            if (error instanceof Error) {
              if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage += 'Network error occurred. ';
              } else if (error.message.includes('timeout')) {
                errorMessage += 'Request timed out. ';
              } else {
                errorMessage += `Error: ${error.message}. `;
              }
            }
            errorMessage += `Please contact support with your payment ID: ${response.razorpay_payment_id || paymentId}`;
            
            alert(errorMessage);
            setPaymentStatus('failed');
          }
        },
        prefill: {
          name: order.customerName || '',
          email: '', // Add email field to your form if needed
          contact: order.mobileNumber || '',
        },
        theme: {
          color: '#339933',
        },
        modal: {
          ondismiss: () => {
            logInfo('Payment modal dismissed by user');
            setIsProcessingPayment(false);
            setPaymentStatus('pending');
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes timeout
        remember_customer: false
      };

      logInfo('Creating Razorpay instance');

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        logError('Payment failed', response.error);
        const errorMessage = response.error?.description || response.error?.reason || 'Payment failed due to an unknown error';
        alert(`Payment failed: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
        setPaymentStatus('failed');
        setIsProcessingPayment(false);
      });

      logInfo('Opening Razorpay payment modal');
      
      // Additional check before opening
      if (typeof razorpay.open !== 'function') {
        throw new Error('Razorpay instance does not have open method');
      }
      
      razorpay.open();
      
    } catch (error) {
      logError('Error in payment initiation', error);
      
      let errorMessage = 'Failed to initiate payment. ';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
      setPaymentStatus('failed');
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-foreground/70">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading text-foreground mb-2">Order Not Found</h2>
            <p className="font-paragraph text-foreground/70 mb-6">
              We couldn't find your order. Please try applying again.
            </p>
            <Button onClick={() => navigate('/apply')} className="w-full">
              Back to Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'success') {
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
            <h1 className="text-4xl font-heading text-foreground mb-4">Payment Successful!</h1>
            <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
              Your order has been confirmed and is being processed
            </p>
          </motion.div>

          {/* Process Steps - All Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 - Completed */}
              <div className="relative">
                <Card className="p-6 text-center border-green-200 bg-green-50">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500 text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-foreground mb-2">Step 1</h3>
                  <p className="text-sm font-paragraph text-foreground/70">Application Completed</p>
                </Card>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-300 transform -translate-y-1/2"></div>
              </div>

              {/* Step 2 - Completed */}
              <div className="relative">
                <Card className="p-6 text-center border-green-200 bg-green-50">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500 text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-foreground mb-2">Step 2</h3>
                  <p className="text-sm font-paragraph text-foreground/70">Payment Completed</p>
                </Card>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-300 transform -translate-y-1/2"></div>
              </div>

              {/* Step 3 - Current */}
              <div className="relative">
                <Card className="p-6 text-center border-blue-200 bg-blue-50">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-500 text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-foreground mb-2">Step 3</h3>
                  <p className="text-sm font-paragraph text-foreground/70">WhatsApp Confirmation Sent</p>
                </Card>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-300 transform -translate-y-1/2"></div>
              </div>

              {/* Step 4 */}
              <div>
                <Card className="p-6 text-center border-orange-200 bg-orange-50">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-500 text-white">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-foreground mb-2">Step 4</h3>
                  <p className="text-sm font-paragraph text-foreground/70">Processing & Delivery</p>
                </Card>
              </div>
            </div>
          </motion.div>

          {/* Success Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 text-center">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-heading text-foreground mb-4">Order Confirmed!</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                    <h4 className="font-heading text-foreground mb-3 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      What's Next?
                    </h4>
                    <div className="space-y-3 text-sm font-paragraph text-foreground/80">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <p><strong>WhatsApp Confirmation:</strong> You've received a confirmation message with your order details</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Clock className="w-3 h-3 text-orange-600" />
                        </div>
                        <p><strong>Processing:</strong> Your ID card is now being processed and will be ready within 7-10 business days</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Truck className="w-3 h-3 text-green-600" />
                        </div>
                        <p><strong>Delivery:</strong> Your ID card will be delivered to your selected store for pickup</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full bg-brand-green text-white hover:bg-brand-green/90"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading text-foreground mb-2">Payment Failed</h2>
            <p className="font-paragraph text-foreground/70 mb-6">
              There was an issue processing your payment. Please try again.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setPaymentStatus('pending')}
                className="w-full bg-brand-green text-white hover:bg-brand-green/90"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/apply')}
                variant="outline"
                className="w-full"
              >
                Back to Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-4xl font-heading text-foreground mb-4">Complete Your Payment</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Step 2 of 4: Secure payment processing
          </p>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 - Completed */}
            <div className="relative">
              <Card className="p-6 text-center border-green-200 bg-green-50">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500 text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-foreground mb-2">Step 1</h3>
                <p className="text-sm font-paragraph text-foreground/70">Application Completed</p>
              </Card>
              {/* Connector */}
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-300 transform -translate-y-1/2"></div>
            </div>

            {/* Step 2 - Current */}
            <div className="relative">
              <Card className="p-6 text-center border-primary bg-primary/5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-foreground mb-2">Step 2</h3>
                <p className="text-sm font-paragraph text-foreground/70">Secure Payment</p>
              </Card>
              {/* Connector */}
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="p-6 text-center border-gray-200">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100 text-gray-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-foreground mb-2">Step 3</h3>
                <p className="text-sm font-paragraph text-foreground/70">WhatsApp Confirmation</p>
              </Card>
              {/* Connector */}
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>

            {/* Step 4 */}
            <div>
              <Card className="p-6 text-center border-gray-200">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100 text-gray-400">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-foreground mb-2">Step 4</h3>
                <p className="text-sm font-paragraph text-foreground/70">Delivery & Completion</p>
              </Card>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading text-foreground">Customer Details</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Full Name</p>
                        <p className="font-heading text-foreground">{order.customerName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Vestige ID</p>
                        <p className="font-heading text-foreground">{order.vestigeId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Mobile Number</p>
                        <p className="font-heading text-foreground">{order.mobileNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading text-foreground">Order Details</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-heading text-foreground">Vestige PVC ID Card</p>
                      <p className="text-sm font-paragraph text-foreground/70">Premium quality PVC card</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-heading text-foreground">₹{CARD_PRICE}</p>
                      <Badge variant="secondary" className="mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        7-10 days
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-brand-green/10 rounded-lg">
                  <p className="text-lg font-heading text-foreground">Total Amount</p>
                  <p className="text-2xl font-heading text-brand-green">₹{CARD_PRICE}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Script Load Error */}
                {scriptLoadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-paragraph text-red-700">
                        Payment system failed to load. Please refresh the page and try again.
                      </p>
                    </div>
                  </div>
                )}

                {/* Security Features */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-paragraph text-foreground text-sm">256-bit SSL Encryption</p>
                      <p className="text-xs font-paragraph text-foreground/70">Your payment is secure</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-paragraph text-foreground text-sm">Powered by Razorpay</p>
                      <p className="text-xs font-paragraph text-foreground/70">Live payment gateway - PCI DSS compliant</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="font-paragraph text-foreground text-sm">Instant Confirmation</p>
                      <p className="text-xs font-paragraph text-foreground/70">WhatsApp notification on payment success</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Next Steps Info */}
                <div className="space-y-4">
                  <h4 className="font-heading text-foreground flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    What Happens After Payment?
                  </h4>
                  <div className="space-y-3 text-sm font-paragraph text-foreground/80">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <p><strong>Instant WhatsApp Confirmation:</strong> You'll receive a confirmation message with your order details</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">4</span>
                      </div>
                      <p><strong>Processing & Delivery:</strong> Your ID card will be processed and delivered to your selected store within 7-10 business days</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Methods */}
                <div className="space-y-4">
                  <h4 className="font-heading text-foreground">Accepted Payment Methods</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors">
                      <p className="text-sm font-paragraph text-foreground">Credit Cards</p>
                      <p className="text-xs text-foreground/60">Visa, Mastercard, Amex</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors">
                      <p className="text-sm font-paragraph text-foreground">Debit Cards</p>
                      <p className="text-xs text-foreground/60">All major banks</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors">
                      <p className="text-sm font-paragraph text-foreground">Net Banking</p>
                      <p className="text-xs text-foreground/60">50+ banks supported</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors">
                      <p className="text-sm font-paragraph text-foreground">UPI</p>
                      <p className="text-xs text-foreground/60">GPay, PhonePe, Paytm</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors col-span-2">
                      <p className="text-sm font-paragraph text-foreground">Wallets & EMI</p>
                      <p className="text-xs text-foreground/60">Paytm, Mobikwik, EMI options available</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Button */}
                <div className="space-y-4">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessingPayment || !razorpayLoaded || !!scriptLoadError}
                    className="w-full bg-brand-green text-white hover:bg-brand-green/90 h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!razorpayLoaded ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading Payment System...
                      </>
                    ) : isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : scriptLoadError ? (
                      'Payment System Error - Please Refresh'
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ₹{CARD_PRICE}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/apply')}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Application
                  </Button>
                </div>

                {/* Terms */}
                <div className="text-xs font-paragraph text-foreground/60 text-center space-y-2">
                  <p>By proceeding with payment, you agree to our Terms of Service and Privacy Policy.</p>
                  <p className="text-green-600">🔒 Secure payment powered by Razorpay (Live Environment)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}