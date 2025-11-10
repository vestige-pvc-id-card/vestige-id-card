import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
    reset();
    
    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading text-foreground mb-4">Contact Us</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Have questions about our Vestige PVC ID card service? We're here to help. 
            Reach out to us through any of the methods below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-foreground mb-1">Phone Support</h3>
                    <p className="font-paragraph text-foreground/70 mb-2">Call us for immediate assistance</p>
                    <p className="font-paragraph text-primary font-medium">+91 79955 03807</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-foreground mb-1">Email Support</h3>
                    <p className="font-paragraph text-foreground/70 mb-2">Send us your queries anytime</p>
                    <p className="font-paragraph text-primary font-medium">vestigepvcidcard@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-foreground mb-1">Business Hours</h3>
                    <p className="font-paragraph text-foreground/70 mb-2">We're available to help you</p>
                    <div className="font-paragraph text-foreground/80 text-sm space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-foreground mb-1">WhatsApp Updates</h3>
                    <p className="font-paragraph text-foreground/70 mb-2">Automatic notifications for your orders</p>
                    <p className="font-paragraph text-foreground/80 text-sm">
                      You'll receive order confirmations, payment receipts, and pickup notifications via WhatsApp
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-heading text-foreground text-sm mb-2">How long does it take to get my ID card?</h4>
                  <p className="font-paragraph text-foreground/70 text-sm">
                    Typically 7-10 business days from payment confirmation to store pickup availability.
                  </p>
                </div>
                <div>
                  <h4 className="font-heading text-foreground text-sm mb-2">Can I change my pickup store after applying?</h4>
                  <p className="font-paragraph text-foreground/70 text-sm">
                    Store changes are possible before card production begins. Contact us immediately if needed.
                  </p>
                </div>
                <div>
                  <h4 className="font-heading text-foreground text-sm mb-2">What if I made an error in my application?</h4>
                  <p className="font-paragraph text-foreground/70 text-sm">
                    Contact us within 1 hour of submission. After payment, corrections may require a new application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg"
                  >
                    <p className="font-paragraph text-secondary font-medium">
                      Thank you for your message! We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="font-paragraph">Full Name *</Label>
                      <Input
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        className="mt-1"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="font-paragraph">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="mt-1"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="font-paragraph">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        className="mt-1"
                        placeholder="Your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="font-paragraph">Subject *</Label>
                      <Input
                        id="subject"
                        {...register('subject', { required: 'Subject is required' })}
                        className="mt-1"
                        placeholder="What is this about?"
                      />
                      {errors.subject && (
                        <p className="text-destructive text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="font-paragraph">Message *</Label>
                    <Textarea
                      id="message"
                      {...register('message', { required: 'Message is required' })}
                      className="mt-1"
                      placeholder="Please describe your question or concern in detail..."
                      rows={6}
                    />
                    {errors.message && (
                      <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-light-blue/30">
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading text-foreground mb-4">Nationwide Service</h3>
              <p className="font-paragraph text-foreground/80 max-w-2xl mx-auto">
                Our service is available across India through our extensive network of authorized stores. 
                Whether you're in a major city or a smaller town, we're committed to providing you with 
                convenient access to our PVC ID card services.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}