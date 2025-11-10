import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading text-foreground mb-4">Policies & Terms</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Please read our policies carefully to understand our terms of service, privacy practices, and other important information.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Policy</TabsTrigger>
              <TabsTrigger value="refund">Refund Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <div className="space-y-6 font-paragraph text-foreground/80">
                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">1. Acceptance of Terms</h3>
                      <p>
                        By using the Vestige PVC ID Card Service, you agree to be bound by these Terms of Service. 
                        If you do not agree to these terms, please do not use our service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">2. Service Description</h3>
                      <p>
                        We provide PVC ID card creation services for Vestige members. Our service includes online application 
                        processing, secure payment handling, professional card printing, and delivery through our authorized store network.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">3. User Responsibilities</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate and complete information in your application</li>
                        <li>Upload clear, high-quality photos and signatures</li>
                        <li>Ensure you are authorized to use the Vestige ID provided</li>
                        <li>Collect your ID card from the designated store within 30 days</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">4. Payment Terms</h3>
                      <p>
                        Payment must be completed through our secure payment gateway before card production begins. 
                        All payments are processed in Indian Rupees (INR). Payment confirmation will be sent via WhatsApp.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">5. Limitation of Liability</h3>
                      <p>
                        Our liability is limited to the cost of the ID card service. We are not responsible for any 
                        indirect, incidental, or consequential damages arising from the use of our service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">6. Modifications</h3>
                      <p>
                        We reserve the right to modify these terms at any time. Changes will be effective immediately 
                        upon posting on our website.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <div className="space-y-6 font-paragraph text-foreground/80">
                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">1. Information We Collect</h3>
                      <p>We collect the following information when you use our service:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Personal information (name, Vestige ID, mobile number, address)</li>
                        <li>Photographs and digital signatures</li>
                        <li>Payment information (processed securely through our payment gateway)</li>
                        <li>Store selection and delivery preferences</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">2. How We Use Your Information</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>To create and print your PVC ID card</li>
                        <li>To process payments and send confirmations</li>
                        <li>To coordinate delivery through our store network</li>
                        <li>To provide customer support and respond to inquiries</li>
                        <li>To improve our services and user experience</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">3. Information Sharing</h3>
                      <p>
                        We do not sell, trade, or rent your personal information to third parties. We may share 
                        your information with:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Authorized stores for delivery coordination</li>
                        <li>Payment processors for transaction handling</li>
                        <li>Legal authorities when required by law</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">4. Data Security</h3>
                      <p>
                        We implement industry-standard security measures to protect your personal information, 
                        including encryption, secure servers, and access controls. However, no method of transmission 
                        over the internet is 100% secure.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">5. Data Retention</h3>
                      <p>
                        We retain your personal information for as long as necessary to provide our services and 
                        comply with legal obligations. ID card information is typically retained for 7 years for 
                        record-keeping purposes.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">6. Your Rights</h3>
                      <p>You have the right to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Access your personal information</li>
                        <li>Request corrections to inaccurate information</li>
                        <li>Request deletion of your information (subject to legal requirements)</li>
                        <li>Contact us with privacy concerns</li>
                      </ul>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">Shipping Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <div className="space-y-6 font-paragraph text-foreground/80">
                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">1. Delivery Method</h3>
                      <p>
                        All Vestige PVC ID cards are delivered through our network of authorized stores across India. 
                        We do not provide direct home delivery to ensure security and proper verification.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">2. Store Selection</h3>
                      <p>
                        During the application process, you must select your nearest authorized store for pickup. 
                        You can only collect your ID card from the store you selected during application.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">3. Processing Time</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Application processing: 1-2 business days</li>
                        <li>Card printing and quality check: 3-5 business days</li>
                        <li>Delivery to store: 2-3 business days</li>
                        <li>Total delivery time: 7-10 business days</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">4. Pickup Notification</h3>
                      <p>
                        You will receive a WhatsApp notification when your ID card arrives at the selected store. 
                        The notification will include pickup instructions and store contact information.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">5. Pickup Requirements</h3>
                      <p>To collect your ID card, you must provide:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Valid government-issued photo ID</li>
                        <li>Order confirmation number</li>
                        <li>Mobile number used for the application</li>
                        <li>OTP verification (sent to your registered mobile number)</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">6. Pickup Timeline</h3>
                      <p>
                        ID cards must be collected within 30 days of arrival at the store. After 30 days, 
                        uncollected cards may be returned to our facility, and additional charges may apply for re-delivery.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">7. Store Network</h3>
                      <p>
                        Our authorized store network covers major cities and towns across India. If you cannot 
                        find a convenient store location, please contact our customer support for assistance.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="refund">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">Refund Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <div className="space-y-6 font-paragraph text-foreground/80">
                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">1. No Refund After Payment</h3>
                      <p className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive font-medium">
                        <strong>Important:</strong> All payments are final and non-refundable once the payment is completed 
                        and card production has begun. Please review your application carefully before making payment.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">2. Pre-Payment Cancellation</h3>
                      <p>
                        You may cancel your application and receive a full refund only if:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Payment has not been completed</li>
                        <li>Card production has not started</li>
                        <li>Cancellation request is made within 1 hour of application submission</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">3. Service Issues</h3>
                      <p>
                        In rare cases where we cannot fulfill your order due to technical issues or service 
                        unavailability, we will provide a full refund. This includes:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>System failures preventing card production</li>
                        <li>Inability to deliver to your selected store</li>
                        <li>Service discontinuation</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">4. Quality Issues</h3>
                      <p>
                        If your ID card has manufacturing defects or quality issues, we will provide a replacement 
                        card at no additional cost. This does not constitute a refund but a service correction.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">5. Incorrect Information</h3>
                      <p>
                        If you provide incorrect information in your application (name, Vestige ID, photo, etc.), 
                        we are not responsible for the resulting ID card errors. No refunds will be provided for 
                        user errors.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">6. Refund Processing</h3>
                      <p>
                        When applicable, refunds will be processed within 7-10 business days to the original 
                        payment method. Bank processing times may vary.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-heading text-foreground mb-3">7. Contact for Issues</h3>
                      <p>
                        If you believe you are eligible for a refund or have concerns about our refund policy, 
                        please contact our customer support team immediately:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Email: vestigepvcidcard@gmail.com</li>
                        <li>Phone: +91 79955 03807</li>
                      </ul>
                    </section>
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