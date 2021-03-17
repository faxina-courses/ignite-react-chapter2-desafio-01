import { Product } from '../types';
import { LocalStorageHelper } from './local-storage-helper';

class CartStorageHelper extends LocalStorageHelper<Product[]> {
  constructor() {
    super('@RocketShoes:cart');
  }
}

export const cartStorageHelper = new CartStorageHelper();
