import { BaseCrudService } from '@/integrations';
import { Stores, StoreCredentials, IDCardOrders } from '@/entities';

export const clearAllOrders = async () => {
  try {
    console.log('🗑️ Starting to clear all orders from the system...');
    
    // Get all orders
    const { items: orders } = await BaseCrudService.getAll<IDCardOrders>('idcardorders');
    console.log(`📊 Found ${orders.length} orders to delete`);
    
    if (orders.length === 0) {
      console.log('✅ No orders found - database is already clean');
      return { success: true, message: 'No orders found - database is already clean', deletedCount: 0 };
    }
    
    // Delete all orders one by one
    let deletedCount = 0;
    for (const order of orders) {
      try {
        await BaseCrudService.delete('idcardorders', order._id);
        deletedCount++;
        console.log(`✅ Deleted order: ${order.customerName} (${order._id})`);
      } catch (error) {
        console.error(`❌ Failed to delete order ${order._id}:`, error);
      }
    }
    
    console.log(`🎉 Successfully cleared ${deletedCount} orders from the system`);
    return { 
      success: true, 
      message: `Successfully deleted ${deletedCount} orders`, 
      deletedCount 
    };
    
  } catch (error) {
    console.error('❌ Error clearing orders:', error);
    return { 
      success: false, 
      message: 'Failed to clear orders', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

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

export const clearAllData = async () => {
  try {
    console.log('🗑️ Starting to clear ALL data from the system...');
    
    // Clear orders first
    const ordersResult = await clearAllOrders();
    console.log(`📊 Orders cleared: ${ordersResult.message}`);
    
    // Clear stores and credentials
    const storesResult = await clearAllStores();
    console.log(`📊 Stores cleared: ${storesResult.message}`);
    
    const totalDeleted = (ordersResult.deletedCount || 0) + (storesResult.deletedCount || 0);
    
    console.log(`🎉 Successfully cleared entire database: ${ordersResult.deletedCount || 0} orders + ${storesResult.deletedCount || 0} stores`);
    return { 
      success: true, 
      message: `Successfully cleared entire database: ${ordersResult.deletedCount || 0} orders and ${storesResult.deletedCount || 0} stores`, 
      deletedCount: totalDeleted,
      ordersDeleted: ordersResult.deletedCount || 0,
      storesDeleted: storesResult.deletedCount || 0
    };
    
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    return { 
      success: false, 
      message: 'Failed to clear all data', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const checkDataCount = async () => {
  try {
    const { items: stores } = await BaseCrudService.getAll<Stores>('stores');
    const { items: credentials } = await BaseCrudService.getAll<StoreCredentials>('storecredentials');
    const { items: orders } = await BaseCrudService.getAll<IDCardOrders>('idcardorders');
    
    return {
      storeCount: stores.length,
      credentialCount: credentials.length,
      orderCount: orders.length,
      stores: stores.map(store => ({
        id: store._id,
        name: store.storeName,
        city: store.storeCity,
        active: store.isActive
      })),
      orders: orders.map(order => ({
        id: order._id,
        customerName: order.customerName,
        vestigeId: order.vestigeId,
        status: order.orderStatus
      }))
    };
  } catch (error) {
    console.error('Error checking data count:', error);
    return { storeCount: 0, credentialCount: 0, orderCount: 0, stores: [], orders: [] };
  }
};