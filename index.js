import * as dotenv from "dotenv";
import nodeFetch from "node-fetch";
import express from "express";
import crypto from "crypto";
import base64url from "base64url";

dotenv.config();

const { clientID, clientSecret, redirect_uri, serverPort: port } = process.env;

const app = express();

const verifier = base64url(crypto.pseudoRandomBytes(32));
const challenge = base64url(
  crypto.createHash("sha256").update(verifier).digest()
);
const challengeMethod = "S256";

app.get("/", async (req, res) => {
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
    console.log(data);
    return res.json({ access_token: data.access_token });
  }

  // Step 2:
  // If no authorization code is available, redirect to Zoom OAuth to authorize
  return res.redirect(
    `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirect_uri}&client_id=${clientID}&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`
  );
});

app.listen(port, () => console.log(`Zoom app listening at PORT: ${port}`));
