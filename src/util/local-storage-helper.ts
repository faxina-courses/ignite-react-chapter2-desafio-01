import { StorageHelper } from './storage-helper';

export class LocalStorageHelper<D> extends StorageHelper<D> {
  save = (data: D): void => {
    localStorage.setItem(this.key, JSON.stringify(data));
  };

  get = (): string | null => {
    return localStorage.getItem(this.key);
  };

  getDecoded = (): D | null => {
    const localData = this.get();
    return localData ? JSON.parse(localData) : null;
  };

  delete = (): void => {
    localStorage.removeItem(this.key);
  };
}
