import { Injectable } from '@angular/core';
import { AES, enc, lib, SHA256 } from 'crypto-js';

import { environment } from '../../../environments/environment';

@Injectable()
export default class StorageService {
  constructor() {}

  public secureStorage = new (require('secure-web-storage'))(sessionStorage, {
    // Hashing Step
    // @ts-ignore
    hash: key => {
      // @ts-ignore
      key = SHA256(key, environment.secretKey);

      return key.toString();
    },
    // Encrypt the localstorage data
    // @ts-ignore
    encrypt: data => StorageService.encryptData(data, environment.secretKey),
    // Decrypt the encrypted data
    // @ts-ignore
    decrypt: data => StorageService.decryptData(data, environment.secretKey)
  });

  /**
   * Data Encrypt function
   */
  private static encryptData(
    data: string | lib.WordArray,
    key: string | lib.WordArray
  ) {
    const result: lib.CipherParams = AES.encrypt(data, key);
    return result.toString();
  }

  /**
   * Data Decrypt Function
   */
  private static decryptData(
    data: string | lib.CipherParams,
    key: string | lib.WordArray
  ) {
    const result = AES.decrypt(data, key);
    return result.toString(enc.Utf8);
  }

  // tslint:disable-next-line:no-any
  setItem(key: string, value: any) {
    try {
      /**
       * Now save the key and value
       */
      return this.secureStorage.setItem(key, value);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Get the json value from local storage
   */
  getItem(key: string) {
    try {
      /**
       * Now fetch the actual data
       */
      return this.secureStorage.getItem(key);
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  /**
   * Get the json value from local storage
   */
  removeItem(key: string) {
    try {
      /**
       * Now remove the actual data
       */
      return this.secureStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Clear the local storage
   */
  clearToken() {
    return this.secureStorage.clear();
  }
}
