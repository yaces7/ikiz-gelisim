import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-secure-key-change-this';

/**
 * Encrypts data using AES-256
 * @param data - The data directly to encrypt (object or string)
 * @returns Encrypted string
 */
export const encryptData = (data: any): string => {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};

/**
 * Decrypts AES-256 encrypted string
 * @param ciphertext - The encrypted string
 * @returns Decrypted data (original object/string)
 */
export const decryptData = (ciphertext: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};
