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
  MapPin, 
  Building2,
  AlertCircle,
  ArrowLeft
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

  // Get order ID from props, URL params, or location state
  const orderId = propOrderId || 
    new URLSearchParams(location.search).get('orderId') || 
    location.state?.orderId;

  const CARD_PRICE = 100; // Price in INR
  const RAZORPAY_KEY = 'rzp_live_Re2NQGpbsbDDeC'; // Live Razorpay key

  useEffect(() => {
    if (!orderId) {
      navigate('/apply');
      return;
    }
    loadOrder();
    loadRazorpayScript();
  }, [orderId]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);
  };

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await BaseCrudService.getById<IDCardOrders>('idcardorders', orderId);
      if (orderData) {
        setOrder(orderData);
      } else {
        navigate('/apply');
      }
    } catch (error) {
      console.error('Error loading order:', error);
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
      // Example:
      // const response = await fetch('/api/send-whatsapp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: order?.mobileNumber,
      //     message: message
      //   })
      // });
      
      console.log('WhatsApp confirmation message:', message);
      console.log('To be sent to:', order?.mobileNumber);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded || !order) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus('processing');

    try {
      const paymentId = generatePaymentId();
      
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY,
        amount: CARD_PRICE * 100, // Amount in paise
        currency: 'INR',
        name: 'Vestige PVC ID Cards',
        description: `PVC ID Card for ${order.customerName} (Vestige ID: ${order.vestigeId})`,
        order_id: paymentId,
        handler: async (response: any) => {
          try {
            console.log('Payment successful:', response);
            
            // Update order status to paid with payment details
            await BaseCrudService.update('idcardorders', {
              _id: order._id,
              orderStatus: 'Paid',
              // Note: Consider adding payment fields to your schema for production
            });

            // Send WhatsApp confirmation
            await sendWhatsAppConfirmation(response.razorpay_payment_id || paymentId);

            setPaymentStatus('success');
            
            // Redirect to success page after 3 seconds
            setTimeout(() => {
              navigate('/', { state: { paymentSuccess: true } });
            }, 3000);

          } catch (error) {
            console.error('Error processing payment confirmation:', error);
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
            console.log('Payment modal dismissed');
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

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setPaymentStatus('failed');
        setIsProcessingPayment(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
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
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading text-foreground mb-4">Payment Successful!</h2>
              <p className="font-paragraph text-foreground/70 mb-6">
                Your payment has been processed successfully. A confirmation message has been sent to your WhatsApp.
              </p>
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-heading text-foreground mb-4">Complete Your Payment</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Review your order details and proceed with secure payment
          </p>
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
                    disabled={isProcessingPayment || !razorpayLoaded}
                    className="w-full bg-brand-green text-white hover:bg-brand-green/90 h-12 text-lg"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
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