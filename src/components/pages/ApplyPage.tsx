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
import { Upload, CheckCircle, RotateCcw, Edit, User, Phone, MapPin, Building2, Camera, CreditCard, AlertCircle, FileImage, MessageCircle, Truck, Check } from 'lucide-react';

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
  const [submitError, setSubmitError] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [compressedFileSize, setCompressedFileSize] = useState<number>(0);

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
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  // Image compression utility function
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Calculate compressed size
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        setCompressedFileSize(compressedSize);
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Set original file size
    setOriginalFileSize(file.size);

    // Check if file is too large (>10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      setSubmitError('File size is too large. Please choose an image smaller than 10MB.');
      return;
    }

    setIsCompressing(true);
    setSubmitError('');

    try {
      // Compress the image
      const compressedDataUrl = await compressImage(file, 800, 800, 0.8);
      
      // Additional compression if still too large
      let finalDataUrl = compressedDataUrl;
      let quality = 0.8;
      
      // Keep compressing until under 500KB or quality gets too low
      while (finalDataUrl.length > 500 * 1024 && quality > 0.3) {
        quality -= 0.1;
        finalDataUrl = await compressImage(file, 800, 800, quality);
      }
      
      // Final size check
      const finalSize = Math.round((finalDataUrl.length * 3) / 4);
      if (finalSize > 1024 * 1024) { // 1MB limit
        setSubmitError('Unable to compress image sufficiently. Please choose a smaller image.');
        setIsCompressing(false);
        return;
      }
      
      setPhotoPreview(finalDataUrl);
      setValue('customerPhoto', finalDataUrl);
      setCompressedFileSize(finalSize);
      
    } catch (error) {
      console.error('Error compressing image:', error);
      setSubmitError('Error processing image. Please try a different image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    // Clear any previous errors
    setSubmitError('');
    
    if (!showSummary) {
      // First submission - show summary for review
      const store = stores.find(s => s._id === data.storeId);
      if (!store) {
        setSubmitError('Please select a store for pickup');
        return;
      }
      if (!data.customerPhoto) {
        setSubmitError('Please upload your profile photo');
        return;
      }
      
      // Check payload size before proceeding
      const estimatedPayloadSize = JSON.stringify(data).length;
      console.log('Estimated payload size:', formatFileSize(estimatedPayloadSize));
      
      if (estimatedPayloadSize > 1024 * 1024) { // 1MB limit
        setSubmitError('Form data is too large. Please use a smaller image.');
        return;
      }
      
      setSelectedStore(store);
      setShowSummary(true);
      return;
    }

    // Second submission - actually submit the form and redirect to payment
    setIsSubmitting(true);
    
    try {
      // Validate all required fields before submission
      if (!data.customerName || !data.vestigeId || !data.mobileNumber || !data.customerAddress || !data.customerPhoto || !data.storeId) {
        throw new Error('All fields are required. Please check your information.');
      }

      // Final payload size check
      const orderData: IDCardOrders = {
        _id: crypto.randomUUID(),
        customerName: data.customerName.trim(),
        vestigeId: data.vestigeId.trim(),
        mobileNumber: data.mobileNumber.trim(),
        customerAddress: data.customerAddress.trim(),
        customerPhoto: data.customerPhoto,
        orderStatus: 'Pending'
      };

      const payloadSize = JSON.stringify(orderData).length;
      console.log('Final payload size:', formatFileSize(payloadSize));
      
      if (payloadSize > 1024 * 1024) { // 1MB limit
        throw new Error('Form data is too large. Please use a smaller image or reduce text length.');
      }

      console.log('Creating order with data:', { ...orderData, customerPhoto: '[IMAGE_DATA]' });
      
      // Create the order in the database
      await BaseCrudService.create('idcardorders', orderData);
      
      console.log('Order created successfully, redirecting to payment...');
      
      // Redirect to payment page with order ID - using React Router navigation
      const paymentUrl = `/payment?orderId=${orderData._id}`;
      console.log('Redirecting to:', paymentUrl);
      
      // Use window.location for reliable redirect
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error instanceof Error && error.message.includes('too large')) {
        setSubmitError('Form data is too large. Please use a smaller image or reduce text length.');
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleEditForm = () => {
    setShowSummary(false);
    setSubmitError(''); // Clear any errors when going back to edit
    setOriginalFileSize(0);
    setCompressedFileSize(0);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading text-foreground mb-4">Apply for Vestige PVC ID Card</h1>
          <p className="text-lg font-paragraph text-foreground/80 max-w-2xl mx-auto">
            Complete your ID card application in 4 simple steps
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
            {/* Step 1 */}
            <div className="relative">
              <Card className={`p-6 text-center ${!showSummary ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  !showSummary ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Edit className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-foreground mb-2">Step 1</h3>
                <p className="text-sm font-paragraph text-foreground/70">Fill Application Form</p>
              </Card>
              {/* Connector */}
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className={`p-6 text-center ${showSummary && !isSubmitting ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  showSummary && !isSubmitting ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
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
                        {...register('customerName', { 
                          required: 'Full name is required',
                          maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                        })}
                        className="mt-1"
                        placeholder="Enter your full name"
                        maxLength={100}
                      />
                      {errors.customerName && (
                        <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vestigeId" className="font-paragraph">Vestige ID *</Label>
                      <Input
                        id="vestigeId"
                        {...register('vestigeId', { 
                          required: 'Vestige ID is required',
                          maxLength: { value: 50, message: 'Vestige ID must be less than 50 characters' }
                        })}
                        className="mt-1"
                        placeholder="Enter your Vestige ID"
                        maxLength={50}
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
                        maxLength={10}
                      />
                      {errors.mobileNumber && (
                        <p className="text-destructive text-sm mt-1">{errors.mobileNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customerAddress" className="font-paragraph">Address *</Label>
                      <Textarea
                        id="customerAddress"
                        {...register('customerAddress', { 
                          required: 'Address is required',
                          maxLength: { value: 500, message: 'Address must be less than 500 characters' }
                        })}
                        className="mt-1"
                        placeholder="Enter your complete address"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.customerAddress && (
                          <p className="text-destructive text-sm">{errors.customerAddress.message}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {watch('customerAddress')?.length || 0}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading text-foreground">Documents Upload</h3>
                    
                    <div>
                      <Label className="font-paragraph">Profile Photo *</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                            required
                            disabled={isCompressing}
                          />
                          <Label
                            htmlFor="photo-upload"
                            className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              isCompressing 
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                                : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {isCompressing ? (
                              <div className="text-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <span className="text-sm text-gray-500">Compressing image...</span>
                              </div>
                            ) : photoPreview ? (
                              <Image src={photoPreview} alt="Photo preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <span className="text-sm text-gray-500">Click to upload photo</span>
                                <span className="text-xs text-gray-400 block mt-1">Max 10MB • Will be compressed automatically</span>
                              </div>
                            )}
                          </Label>
                        </div>
                        
                        {/* File size information */}
                        {(originalFileSize > 0 || compressedFileSize > 0) && (
                          <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <FileImage className="w-4 h-4" />
                              <span>Image processed</span>
                            </div>
                            <div className="flex gap-4">
                              {originalFileSize > 0 && (
                                <span>Original: {formatFileSize(originalFileSize)}</span>
                              )}
                              {compressedFileSize > 0 && (
                                <span className="text-green-600 font-medium">
                                  Compressed: {formatFileSize(compressedFileSize)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {!photoPreview && submitError && (
                        <p className="text-destructive text-sm mt-1">Profile photo is required</p>
                      )}
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
                      {errors.storeId && (
                        <p className="text-destructive text-sm mt-1">Please select a store</p>
                      )}
                    </div>
                  </div>

                  {/* Error Display */}
                  {submitError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-paragraph text-destructive text-sm">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
                    disabled={isCompressing}
                  >
                    {isCompressing ? 'Processing Image...' : 'Review Application'}
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
                        {compressedFileSize > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Compressed to {formatFileSize(compressedFileSize)}
                          </p>
                        )}
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
                    <h4 className="font-heading text-foreground mb-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      What Happens Next?
                    </h4>
                    <div className="space-y-3 text-sm font-paragraph text-foreground/80">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">2</span>
                        </div>
                        <p><strong>Secure Payment:</strong> You'll be redirected to Razorpay for secure payment processing</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">3</span>
                        </div>
                        <p><strong>WhatsApp Confirmation:</strong> You'll receive an instant confirmation message on WhatsApp</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">4</span>
                        </div>
                        <p><strong>Processing & Delivery:</strong> Your ID card will be processed and delivered to your selected store</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error Display */}
                  {submitError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-paragraph text-destructive text-sm font-medium">{submitError}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditForm}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Back to Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-green text-white hover:bg-brand-green/90 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Proceed to Payment
                        </div>
                      )}
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