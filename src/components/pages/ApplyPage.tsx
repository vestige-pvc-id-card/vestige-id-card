import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { IDCardOrders, Stores } from '@/entities';
import { Upload, CheckCircle, RotateCcw, Edit, User, Phone, MapPin, Building2, Camera } from 'lucide-react';

interface FormData {
  customerName: string;
  vestigeId: string;
  mobileNumber: string;
  customerAddress: string;
  customerPhoto: string;
  storeId: string;
}

export default function ApplyPage() {
  const [stores, setStores] = useState<Stores[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Stores | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const { items } = await BaseCrudService.getAll<Stores>('stores');
      // Only show active stores for customer selection
      const activeStores = items.filter(store => store.isActive);
      setStores(activeStores);
      console.log(`Loaded ${activeStores.length} active stores for customer selection`);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        setValue('customerPhoto', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!showSummary) {
      // First submission - show summary for review
      const store = stores.find(s => s._id === data.storeId);
      setSelectedStore(store || null);
      setShowSummary(true);
      return;
    }

    // Second submission - actually submit the form
    setIsSubmitting(true);
    try {
      const orderData: IDCardOrders = {
        _id: crypto.randomUUID(),
        customerName: data.customerName,
        vestigeId: data.vestigeId,
        mobileNumber: data.mobileNumber,
        customerAddress: data.customerAddress,
        customerPhoto: data.customerPhoto,
        orderStatus: 'Pending'
      };

      await BaseCrudService.create('idcardorders', orderData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditForm = () => {
    setShowSummary(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-2xl font-heading text-foreground mb-4">Application Submitted!</h2>
              <p className="font-paragraph text-foreground/70 mb-6">
                Your ID card application has been successfully submitted. Please proceed to payment to complete your order.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    // Open WhatsApp with payment message
                    const message = encodeURIComponent("Hi! I've just submitted my ID card application and would like to proceed with payment. Please send me the payment details.");
                    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
                  }}
                  className="w-full bg-brand-green text-white hover:bg-brand-green/90"
                >
                  Proceed to Payment
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
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

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading text-foreground mb-4">Apply for Vestige PVC ID Card</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Fill out the form below to apply for your official Vestige PVC ID card. All fields are required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full"
        >
          {!showSummary ? (
            // Application Form
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Application Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading text-foreground">Personal Information</h3>
                    
                    <div>
                      <Label htmlFor="customerName" className="font-paragraph">Full Name *</Label>
                      <Input
                        id="customerName"
                        {...register('customerName', { required: 'Full name is required' })}
                        className="mt-1"
                        placeholder="Enter your full name"
                      />
                      {errors.customerName && (
                        <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vestigeId" className="font-paragraph">Vestige ID *</Label>
                      <Input
                        id="vestigeId"
                        {...register('vestigeId', { required: 'Vestige ID is required' })}
                        className="mt-1"
                        placeholder="Enter your Vestige ID"
                      />
                      {errors.vestigeId && (
                        <p className="text-destructive text-sm mt-1">{errors.vestigeId.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="mobileNumber" className="font-paragraph">Mobile Number *</Label>
                      <Input
                        id="mobileNumber"
                        {...register('mobileNumber', { 
                          required: 'Mobile number is required',
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'Please enter a valid 10-digit mobile number'
                          }
                        })}
                        className="mt-1"
                        placeholder="Enter your mobile number"
                      />
                      {errors.mobileNumber && (
                        <p className="text-destructive text-sm mt-1">{errors.mobileNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customerAddress" className="font-paragraph">Address *</Label>
                      <Textarea
                        id="customerAddress"
                        {...register('customerAddress', { required: 'Address is required' })}
                        className="mt-1"
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                      {errors.customerAddress && (
                        <p className="text-destructive text-sm mt-1">{errors.customerAddress.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Documents Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading text-foreground">Documents Upload</h3>
                    
                    <div>
                      <Label className="font-paragraph">Profile Photo *</Label>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                          />
                          <Label
                            htmlFor="photo-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
                          >
                            {photoPreview ? (
                              <Image src={photoPreview} alt="Photo preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <span className="text-sm text-gray-500">Click to upload photo</span>
                              </div>
                            )}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading text-foreground">Delivery Store</h3>
                    <div>
                      <Label className="font-paragraph">Select Nearest Store *</Label>
                      <Select onValueChange={(value) => setValue('storeId', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose your nearest store for pickup" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store._id} value={store._id}>
                              {store.storeName} - {store.storeCity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
                  >
                    Review Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            // Summary Preview
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-foreground flex items-center justify-between">
                  Review Your Application
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditForm}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading text-foreground">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Full Name</p>
                        <p className="font-heading text-foreground">{watch('customerName')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Vestige ID</p>
                        <p className="font-heading text-foreground">{watch('vestigeId')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Mobile Number</p>
                        <p className="font-heading text-foreground">{watch('mobileNumber')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-paragraph text-gray-600">Selected Store</p>
                        <p className="font-heading text-foreground">
                          {selectedStore ? `${selectedStore.storeName} - ${selectedStore.storeCity}` : 'Not selected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-paragraph text-gray-600">Address</p>
                      <p className="font-paragraph text-foreground leading-relaxed">{watch('customerAddress')}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Photo Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading text-foreground">Uploaded Photo</h3>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg flex-1">
                      <Camera className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-paragraph text-gray-600">Profile Photo</p>
                        <p className="font-paragraph text-foreground">
                          {photoPreview ? 'Photo uploaded successfully' : 'No photo uploaded'}
                        </p>
                      </div>
                      {photoPreview && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image 
                            src={photoPreview} 
                            alt="Profile photo preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Confirmation and Submit */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-heading text-foreground mb-2">Next Steps</h4>
                    <p className="font-paragraph text-foreground/80 text-sm leading-relaxed">
                      After confirming your details, you will receive payment instructions via WhatsApp. 
                      Your ID card will be processed once payment is confirmed.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditForm}
                      className="flex-1"
                    >
                      Back to Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-green text-white hover:bg-brand-green/90"
                    >
                      {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          </motion.div>
      </div>
    </div>
  );
}