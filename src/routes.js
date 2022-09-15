import express from "express";
import { fetchUserDetailsWithRetry, zoomAccessToken } from "./controllers";
import { setTokens } from "./handlers";
import { challenge, challengeMethod, clientID, redirectUri } from "./variables";

export const router = express.Router();

router.get("/user", async (req, res) => {
  const response = await fetchUserDetailsWithRetry(1);
  return res.json(response.status === 200 ? await response.json() : null);
});

router.get("/oauth", async (req, res) => {
  const code = req.query.code;
  // Step 1:
  // Check if the code parameter is in the url
  // if an authorization code is available, the user has most likely been redirected from Zoom OAuth
  // if not, the user needs to be redirected to Zoom OAuth to authorize
  if (code) {
    // Step 3:
    // Request an access token using the auth code
    const data = await zoomAccessToken(code);

    // save tokens
    setTokens(data);

    return res.send("Done");
  }

  // Step 2:
  // If no authorization code is available, redirect to Zoom OAuth to authorize
  return res.redirect(
    `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${clientID}&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`
  );
});
