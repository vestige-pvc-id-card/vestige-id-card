import { BaseCrudService } from '@/integrations';
import { Stores, StoreCredentials } from '@/entities';

export const clearAllStores = async () => {
  try {
    console.log('🗑️ Starting to clear all stores from the system...');
    
    // Get all stores
    const { items: stores } = await BaseCrudService.getAll<Stores>('stores');
    console.log(`📊 Found ${stores.length} stores to delete`);
    
    if (stores.length === 0) {
      console.log('✅ No stores found - database is already clean');
      return { success: true, message: 'No stores found - database is already clean', deletedCount: 0 };
    }
    
    // Delete all stores one by one
    let deletedCount = 0;
    for (const store of stores) {
      try {
        await BaseCrudService.delete('stores', store._id);
        deletedCount++;
        console.log(`✅ Deleted store: ${store.storeName} (${store._id})`);
      } catch (error) {
        console.error(`❌ Failed to delete store ${store.storeName}:`, error);
      }
    }
    
    // Also clear any store credentials
    try {
      const { items: credentials } = await BaseCrudService.getAll<StoreCredentials>('storecredentials');
      console.log(`📊 Found ${credentials.length} store credentials to delete`);
      
      for (const credential of credentials) {
        try {
          await BaseCrudService.delete('storecredentials', credential._id);
          console.log(`✅ Deleted credential for store: ${credential.storeId}`);
        } catch (error) {
          console.error(`❌ Failed to delete credential for store ${credential.storeId}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error clearing store credentials:', error);
    }
    
    console.log(`🎉 Successfully cleared ${deletedCount} stores from the system`);
    return { 
      success: true, 
      message: `Successfully deleted ${deletedCount} stores and their credentials`, 
      deletedCount 
    };
    
  } catch (error) {
    console.error('❌ Error clearing stores:', error);
    return { 
      success: false, 
      message: 'Failed to clear stores', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const checkStoreCount = async () => {
  try {
    const { items: stores } = await BaseCrudService.getAll<Stores>('stores');
    const { items: credentials } = await BaseCrudService.getAll<StoreCredentials>('storecredentials');
    
    return {
      storeCount: stores.length,
      credentialCount: credentials.length,
      stores: stores.map(store => ({
        id: store._id,
        name: store.storeName,
        city: store.storeCity,
        active: store.isActive
      }))
    };
  } catch (error) {
    console.error('Error checking store count:', error);
    return { storeCount: 0, credentialCount: 0, stores: [] };
  }
};