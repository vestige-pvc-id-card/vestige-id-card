import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Shield, Users, Award, Clock, MapPin, Phone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-light-blue to-background">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-heading text-foreground mb-6">About Vestige PVC ID Card Service</h1>
            <p className="text-lg font-paragraph text-foreground/80 max-w-3xl mx-auto">
              We are the official provider of Vestige PVC ID cards, offering secure, professional, and reliable 
              identification services to Vestige members across India through our extensive network of authorized stores.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-16"
          >
            <Image
              src="https://static.wixstatic.com/media/1878e6_8599554ce510497391660ead71601ec3~mv2.png"
              alt="Vestige Logo"
              width={200}
              className="mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-8">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-8">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-heading text-foreground mb-4">Our Mission</h2>
                  <p className="font-paragraph text-foreground/80 leading-relaxed">
                    To provide Vestige members with high-quality, secure, and professionally designed PVC ID cards 
                    that serve as official identification within the Vestige network. We are committed to maintaining 
                    the highest standards of security, quality, and customer service.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-8">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-heading text-foreground mb-4">Our Vision</h2>
                  <p className="font-paragraph text-foreground/80 leading-relaxed">
                    To be the most trusted and efficient ID card service provider for Vestige members, 
                    leveraging technology and our nationwide network to deliver exceptional service and 
                    maintain the integrity of Vestige identification systems.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 px-8 bg-light-blue/30">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-heading text-foreground mb-4">Why Choose Our Service</h2>
            <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
              We combine advanced security features with user-friendly processes to deliver the best ID card service experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Advanced encryption and secure data handling protocols protect your personal information throughout the process."
              },
              {
                icon: Award,
                title: "Premium Quality",
                description: "High-grade PVC material with professional printing ensures your ID card is durable and looks professional."
              },
              {
                icon: Users,
                title: "Nationwide Network",
                description: "Extensive network of authorized stores across India for convenient application submission and card pickup."
              },
              {
                icon: Clock,
                title: "Quick Processing",
                description: "Efficient processing system ensures your ID card is ready for pickup within the shortest possible time."
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
                    <h3 className="text-lg font-heading text-foreground mb-3">{feature.title}</h3>
                    <p className="font-paragraph text-foreground/70 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-24 px-8">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-heading text-foreground mb-4">How It Works</h2>
            <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
              Our streamlined process makes getting your Vestige ID card simple and secure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Online Application",
                description: "Fill out our secure online form with your personal details, upload your photo and signature, and select your nearest pickup store."
              },
              {
                step: "02",
                title: "Secure Payment",
                description: "Complete payment through our secure payment gateway. Receive instant confirmation via WhatsApp with order details."
              },
              {
                step: "03",
                title: "Store Pickup",
                description: "Collect your professionally printed PVC ID card from your selected store after receiving pickup notification."
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-heading">
                  {step.step}
                </div>
                <h3 className="text-xl font-heading text-foreground mb-4">{step.title}</h3>
                <p className="font-paragraph text-foreground/70 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 px-8 bg-light-blue/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading text-foreground mb-4">Get in Touch</h2>
            <p className="text-lg font-paragraph text-foreground/80">
              Have questions about our service? We're here to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading text-foreground mb-2">Phone Support</h3>
                  <p className="font-paragraph text-foreground/70 mb-3">Call us for immediate assistance</p>
                  <p className="font-paragraph text-primary font-medium">+91 79955 03807</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading text-foreground mb-2">Email Support</h3>
                  <p className="font-paragraph text-foreground/70 mb-3">Send us your queries anytime</p>
                  <p className="font-paragraph text-primary font-medium">vestigepvcidcard@gmail.com</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}