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
    if (!value) return "";
    try {
        const decoded = decodeURIComponent(value);
        const safeValue = decoded.replace(/ /g, "+");
        const decrypted = CryptoJS.AES.decrypt(safeValue, CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.error("Error al desencriptar:", error);
        return "";
    }
}