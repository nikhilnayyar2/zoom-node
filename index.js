import * as dotenv from "dotenv";
import nodeFetch from "node-fetch";
import express from "express";
import crypto from "crypto";
import base64url from "base64url";

dotenv.config();

const { clientID, clientSecret, redirect_uri, serverPort: port } = process.env;

const app = express();

// create PKCE verifier & challenge
const verifier = base64url(crypto.pseudoRandomBytes(32));
const challenge = base64url(
  crypto.createHash("sha256").update(verifier).digest()
);
const challengeMethod = "S256";

// outh tokens
let accessToken = null,
  refreshToken = null;

// functions

function setTokens(data) {
  console.log(data);

  accessToken = data.access_token;
  refreshToken = data.refresh_token;
}

async function refreshTokenF() {
  const response = await nodeFetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientID}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (response.status === 200) {
    setTokens(await response.json());
    return true;
  }
  return false;
}
function fetchUserDetails() {
  return nodeFetch("https://api.zoom.us/v2/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/** @return {Promise<Response>} */
async function fetchUserDetailsWithRetry(/** @type {number} */ retryCount) {
  const response = await fetchUserDetails();
  
  if (response.status === 200) return response;

  if (retryCount && (await refreshTokenF()))
    return await fetchUserDetailsWithRetry(--retryCount);

  return response;
}
// routes

app.get("/user", async (req, res) => {
  const response = await fetchUserDetailsWithRetry(1)
  return res.json( response.status === 200 ? await response.json() : null )
});

app.get("/oauth", async (req, res) => {
  const code = req.query.code;
  // Step 1:
  // Check if the code parameter is in the url
  // if an authorization code is available, the user has most likely been redirected from Zoom OAuth
  // if not, the user needs to be redirected to Zoom OAuth to authorize
  if (code) {
    // Step 3:
    // Request an access token using the auth code
    const response = await nodeFetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientID}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        code_verifier: verifier,
      }),
    });

    const data = await response.json();

    // save tokens
    setTokens(data);

    return res.send("Done");
  }

  // Step 2:
  // If no authorization code is available, redirect to Zoom OAuth to authorize
  return res.redirect(
    `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirect_uri}&client_id=${clientID}&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`
  );
});

app.listen(port, () => console.log(`Zoom app listening at PORT: ${port}`));
