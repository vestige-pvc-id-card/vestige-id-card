import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Shield, Clock, Award, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="h-screen grid place-items-center p-8 bg-gradient-to-br from-light-blue to-background">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-6xl rounded-2xl overflow-hidden bg-white shadow-lg p-12 text-center"
        >
          <div className="mb-8">
            <Image
              src="https://static.wixstatic.com/media/1878e6_8599554ce510497391660ead71601ec3~mv2.png"
              alt="Vestige Logo"
              width={200}
              className="mx-auto mb-6"
            />
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-heading text-foreground mb-4"
          >
            Apply for Your Vestige PVC ID Card
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg font-paragraph text-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            Get your official Vestige PVC ID card with secure processing, store-based delivery, and professional quality printing.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/apply">Apply Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link to="/about">Learn More</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
      {/* Features Section */}
      <section className="py-24 px-8">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-foreground mb-4">Why Choose Our Service?</h2>
            <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
              Professional, secure, and reliable ID card services with nationwide delivery network.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Processing",
                description: "Bank-level security for your personal information and documents."
              },
              {
                icon: Clock,
                title: "Quick Delivery",
                description: "Fast processing with store-based delivery across India."
              },
              {
                icon: Award,
                title: "Premium Quality",
                description: "High-quality PVC cards with professional printing standards."
              },
              {
                icon: Users,
                title: "Trusted Network",
                description: "Extensive network of authorized stores for convenient pickup."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading text-foreground mb-3">{feature.title}</h3>
                    <p className="font-paragraph text-foreground/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Process Section */}
      <section className="py-24 px-8 bg-light-blue/30">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-foreground mb-4">Simple Application Process</h2>
            <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
              Get your Vestige ID card in just a few easy steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Fill Application",
                description: "Complete the online form with your details, photo, and signature."
              },
              {
                step: "02",
                title: "Make Payment",
                description: "Secure online payment with instant confirmation via WhatsApp."
              },
              {
                step: "03",
                title: "Collect Card",
                description: "Pick up your ID card from the nearest authorized store."
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-heading">
                  {step.step}
                </div>
                <h3 className="text-xl font-heading text-foreground mb-3">{step.title}</h3>
                <p className="font-paragraph text-foreground/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading text-foreground mb-6">Ready to Get Your ID Card?</h2>
            <p className="text-lg font-paragraph text-foreground/80 mb-8">
              Join thousands of satisfied customers who trust our secure and reliable service.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/apply">Start Your Application</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}