import CryptoJS from "crypto-js";
const  CRYPTO_KEY = process.env.NEXT_PUBLIC_CRYPTO_KEY;

export const encrypt = (value) => { //encrypt values from the server

  if (value === null || value === undefined) {
    throw new Error('El valor a encriptar no puede ser nulo o indefinido');
  }

  if (typeof value !== 'string') {
    throw new Error('El valor a encriptar debe ser un string');
  }

  if (value.trim() === '') {
    throw new Error('El valor a encriptar no puede ser una cadena vacía');
  }

  const encrypted = CryptoJS.AES.encrypt(value, CRYPTO_KEY).toString();
  return encodeURIComponent(encrypted);
}

export const decrypt = (value) => { //decryp
    const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(value), CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted;
}