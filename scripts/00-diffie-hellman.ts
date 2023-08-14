import crypto from "crypto";
import assert from "assert";

// Huge Prime 2048 bits
// Generated by:
// > openssl dhparam -out dhparams.pem 2048
// > openssl dhparam -in dhparams.pem -text -noout
const p =
  0xc530e4638435bbe38d68db0a6bce95fdc7a771518b94be1d811a71cca5cf7b0f37c80025d78cad7ef35e4d1ac475d199a98f22bb535b87c709a89c10f8089c63f9f4081bb8ca31b2228f76366e6643dffb8d2a59512a81d7c6371953157c5db4984ab6643d3986a1407dcbac33f9490ada65f136267add91ce3d524b77d13f6bf1cd834db7c1e0238e977b8c09c271039922c6214ff317e71293e78fa383785f254f268041cbf4091d225e80826af8864b432e045174728cc542f869f661a3c8b2fa433e51cdbf09e8bd557eff4a44afcaa578eb89d7e16933b70303caa6acc11d17b2662e06c78bda9253aee14493d3da4e25659e900de8697245ef11a173ffn;

// generator
const g = 2n;

// Set the modulo group to the given prime
const exp = modExp(p);

// Generating random private keys
const a = generateRandom(1n, p - 2n);
const b = generateRandom(1n, p - 2n);

// Public keys are simply the generator exponentiated to the private key
const A = exp(g, a);
const B = exp(g, b);

// Shared secret is found by applying private keys as exponents to the public keys
const A_secret = exp(B, a);
const B_secret = exp(A, b);

console.log("SentPublicly", {
  p: numToHex(p),
  g: numToHex(g),
  A: numToHex(A),
  B: numToHex(B),
});

console.log("PrivateValues", {
  a: numToHex(a),
  b: numToHex(b),
  secret: numToHex(A_secret),
});

assert(A_secret === B_secret, "Secrets must match");

// Byte manipulation fns
function numToHex(n: bigint, prefix: boolean = true) {
  return (prefix ? "0x" : "") + n.toString(16);
}

function bytesToNum(bytes: Uint8Array) {
  return BigInt(
    "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}

// Generate random bigint
function generateRandom(min: bigint, max: bigint) {
  const range = max - min;
  const byteLen = numToHex(range, false).length / 2;
  while (true) {
    const bytes = crypto.getRandomValues(new Uint8Array(byteLen));
    let randBigInt = bytesToNum(bytes);
    if (randBigInt <= range) {
      return randBigInt + min;
    }
  }
}

// Right-to-left binary method
// https://en.wikipedia.org/wiki/Modular_exponentiation
function modExp(mod: bigint) {
  return (base: bigint, exponent: bigint) => {
    let result = 1n;
    base = base % mod;

    while (exponent > 0) {
      if (exponent % 2n === 1n) {
        result = (result * base) % mod;
      }
      exponent = exponent / 2n;
      base = (base * base) % mod;
    }

    return result;
  };
}