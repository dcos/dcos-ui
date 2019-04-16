// There is a faster version of this function that doesn't use
// btoa (which requires a copy of the data). This buffer is
// rather small so I don't think it makes sense to include it in
// the bundle: https://gist.github.com/jonleighton/958841
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getCryptoApi(): SubtleCrypto {
  const cryptoLib = window.crypto || (window as any).msCrypto;
  return cryptoLib.subtle || (cryptoLib as any).webkitSubtle;
}

function printableBase64(base64: string): string {
  // > To represent the encapsulated text of a PEM message, the encoding function's output is
  // > delimited into text lines (using local conventions), with each line except the last
  // > containing exactly 64 printable characters and the final line containing 64 or fewer
  // > printable characters.

  let result = "";

  while (base64.length > 0) {
    result += base64.substring(0, 64) + "\n";
    base64 = base64.substring(64);
  }

  return result;
}

function privateKeyToPem(privateKey: CryptoKey): Promise<string> {
  return new Promise((resolve, reject) => {
    getCryptoApi()
      .exportKey("pkcs8", privateKey)
      .then(
        exportedPrivateKey => {
          const b64 = arrayBufferToBase64(exportedPrivateKey);
          resolve(
            "-----BEGIN PRIVATE KEY-----\n" +
              printableBase64(b64) +
              "-----END PRIVATE KEY-----"
          );
        },
        error => {
          reject(error);
        }
      );
  });
}

function publicKeyToPem(publicKey: CryptoKey): Promise<string> {
  return new Promise((resolve, reject) => {
    getCryptoApi()
      .exportKey("spki", publicKey)
      .then(
        exportedPublicKey => {
          const b64 = arrayBufferToBase64(exportedPublicKey);
          resolve(
            "-----BEGIN PUBLIC KEY-----\n" +
              printableBase64(b64) +
              "-----END PUBLIC KEY-----"
          );
        },
        error => {
          reject(error);
        }
      );
  });
}

function generatePrintableRSAKeypair(
  options?: RsaHashedKeyGenParams
): Promise<[string, string]> {
  const opts: RsaHashedKeyGenParams = { ...DEFAULTS, ...options };

  return new Promise((resolve, reject) => {
    getCryptoApi()
      .generateKey(opts, true, ["encrypt", "decrypt"])
      .then(
        (pair: CryptoKeyPair) => {
          Promise.all<string, string>([
            privateKeyToPem(pair.privateKey),
            publicKeyToPem(pair.publicKey)
          ]).then(resolve);
        },
        error => {
          reject(error);
        }
      );
  });
}

// Defaults for key generation
const DEFAULTS = {
  hash: "SHA-256",
  modulusLength: 2048,
  name: "RSA-OAEP",
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]) // == 65537
};

function supportsWebCryptography() {
  try {
    return !!getCryptoApi();
  } catch (err) {
    return false;
  }
}

// generate function returns a promise containing a 2-tuple of [privateKey, publicKey]
// in a printable, base64 encoded format. supportsWebCryptography should be called first
// to determine browser compatibility. (Firefox, Chrome, IE11, Safari 8+ are known to work)
export { generatePrintableRSAKeypair, supportsWebCryptography };
