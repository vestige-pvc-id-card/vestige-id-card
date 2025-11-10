import { BaseCrudService } from '@/integrations';
import { Stores } from '@/entities';

export const seedStores = async () => {
  try {
    // Check if stores already exist
    const { items: existingStores } = await BaseCrudService.getAll<Stores>('stores');
    
    if (existingStores.length > 0) {
      console.log('Stores already exist, skipping seed');
      return;
    }

    const sampleStores: Stores[] = [
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Mumbai Central',
        storeAddress: 'Shop No. 15, Ground Floor, Mumbai Central Station, Mumbai',
        contactPerson: 'Rajesh Kumar',
        contactNumber: '+91 98765 43210',
        storeCity: 'Mumbai',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Delhi Connaught Place',
        storeAddress: 'Block A, Connaught Place, New Delhi',
        contactPerson: 'Priya Sharma',
        contactNumber: '+91 98765 43211',
        storeCity: 'Delhi',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Bangalore Koramangala',
        storeAddress: '5th Block, Koramangala, Bangalore',
        contactPerson: 'Suresh Reddy',
        contactNumber: '+91 98765 43212',
        storeCity: 'Bangalore',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Chennai T. Nagar',
        storeAddress: 'T. Nagar Main Road, Chennai',
        contactPerson: 'Lakshmi Iyer',
        contactNumber: '+91 98765 43213',
        storeCity: 'Chennai',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Hyderabad Banjara Hills',
        storeAddress: 'Road No. 12, Banjara Hills, Hyderabad',
        contactPerson: 'Venkat Rao',
        contactNumber: '+91 98765 43214',
        storeCity: 'Hyderabad',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Pune FC Road',
        storeAddress: 'Fergusson College Road, Pune',
        contactPerson: 'Amit Patil',
        contactNumber: '+91 98765 43215',
        storeCity: 'Pune',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Kolkata Park Street',
        storeAddress: 'Park Street, Kolkata',
        contactPerson: 'Debashish Sen',
        contactNumber: '+91 98765 43216',
        storeCity: 'Kolkata',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Ahmedabad CG Road',
        storeAddress: 'CG Road, Navrangpura, Ahmedabad',
        contactPerson: 'Kiran Patel',
        contactNumber: '+91 98765 43217',
        storeCity: 'Ahmedabad',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Jaipur MI Road',
        storeAddress: 'MI Road, Jaipur',
        contactPerson: 'Rohit Agarwal',
        contactNumber: '+91 98765 43218',
        storeCity: 'Jaipur',
        isActive: true
      },
      {
        _id: crypto.randomUUID(),
        storeName: 'Vestige Lucknow Hazratganj',
        storeAddress: 'Hazratganj Market, Lucknow',
        contactPerson: 'Neha Gupta',
        contactNumber: '+91 98765 43219',
        storeCity: 'Lucknow',
        isActive: true
      }
    ];

    // Create all stores
    for (const store of sampleStores) {
      await BaseCrudService.create('stores', store);
    }

    console.log('Sample stores created successfully');
  } catch (error) {
    console.error('Error seeding stores:', error);
  }
};