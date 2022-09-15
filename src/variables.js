import dotenv from "dotenv";
dotenv.config();

import base64url from "base64url";
import crypto from "crypto";

export const {
  clientID,
  clientSecret,
  redirectUri,
  serverPort: port,
} = process.env;

// outh tokens
export const tokens = {
  accessToken: null,
  refreshToken: null,
};

// create PKCE verifier & challenge

export const verifier = base64url(crypto.pseudoRandomBytes(32));
export const challenge = base64url(
  crypto.createHash("sha256").update(verifier).digest()
);
export const challengeMethod = "S256";
