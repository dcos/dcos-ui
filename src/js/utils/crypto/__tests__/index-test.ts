import { generatePrintableRSAKeypair, supportsWebCryptography } from "../index";

function MockCryptoKeyPair() {
  this.publicKey = jest.fn();
  this.privateKey = jest.fn();
}

describe("supportsWebCryptography", () => {
  it("returns false", () => {
    expect(supportsWebCryptography()).toEqual(false);
  });

  describe("when window.subtle exists", () => {
    beforeEach(() => {
      window.crypto = {
        subtle: {},
      };
    });

    it("returns true", () => {
      expect(supportsWebCryptography()).toEqual(true);
    });
  });
});

describe("generatePrintableRSAKeypair", () => {
  beforeEach(() => {
    window.crypto = {
      subtle: {
        exportKey: (_type, _key) => {
          const buffer = new ArrayBuffer(256);
          const dataView = new DataView(buffer);

          // Generate 256 bytes of the alphabet, A-Z, in ASCII, repeated
          for (let pos = 0; pos < buffer.byteLength; pos += 4) {
            dataView.setInt32(pos, 65 + ((pos / 4) % 26));
          }

          return new Promise((resolve) => {
            resolve(buffer);
          });
        },
        generateKey: (_options, _exportable, _usage) =>
          new Promise((resolve) => {
            resolve(new MockCryptoKeyPair());
          }),
      },
    };
  });

  describe("when overriding defaults", () => {
    beforeEach(() => {
      window.crypto.subtle.generateKey = jest.fn();
    });

    it("calls generateKey with options and defaults", () => {
      generatePrintableRSAKeypair({ modulusLength: 4096 });
      expect(window.crypto.subtle.generateKey).toHaveBeenCalledWith(
        {
          hash: "SHA-256",
          modulusLength: 4096, // <-- not the default
          name: "RSA-OAEP",
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        },
        true,
        ["encrypt", "decrypt"]
      );
    });
  });

  it("resolves to two base 64 encoded strings", (done) => {
    expect(generatePrintableRSAKeypair()).resolves.toHaveLength(2);

    generatePrintableRSAKeypair()
      .then(([privateKey, publicKey]) => {
        expect(privateKey).toMatch(/-----BEGIN PRIVATE KEY-----/);
        expect(publicKey).toMatch(/-----BEGIN PUBLIC KEY-----/);
        done();
      })
      .catch((err) => {
        done.fail(err);
      });
  });

  it("generates a printable string, each line no longer than 64 characters", (done) => {
    generatePrintableRSAKeypair()
      .then(([privateKey, publicKey]) => {
        expect(privateKey.split("\n").every((line) => line.length <= 64)).toBe(
          true
        );
        expect(publicKey.split("\n").every((line) => line.length <= 64)).toBe(
          true
        );
        done();
      })
      .catch((err) => {
        done.fail(err);
      });
  });
});
