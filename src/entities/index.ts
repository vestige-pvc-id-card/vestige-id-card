/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: idcardorders
 * Interface for IDCardOrders
 */
export interface IDCardOrders {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType text */
  vestigeId?: string;
  /** @wixFieldType text */
  mobileNumber?: string;
  /** @wixFieldType text */
  customerAddress?: string;
  /** @wixFieldType image */
  customerPhoto?: string;
  /** @wixFieldType image */
  customerSignature?: string;
  /** @wixFieldType text */
  orderStatus?: string;
}


/**
 * Collection ID: storecredentials
 * Interface for StoreCredentials
 */
export interface StoreCredentials {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  username?: string;
  /** @wixFieldType text */
  password?: string;
  /** @wixFieldType text */
  storeId?: string;
  /** @wixFieldType datetime */
  lastLoginDate?: Date | string;
  /** @wixFieldType boolean */
  isActive?: boolean;
}


/**
 * Collection ID: stores
 * Interface for Stores
 */
export interface Stores {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  storeName?: string;
  /** @wixFieldType text */
  storeAddress?: string;
  /** @wixFieldType text */
  contactPerson?: string;
  /** @wixFieldType text */
  contactNumber?: string;
  /** @wixFieldType text */
  storeCity?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
}
