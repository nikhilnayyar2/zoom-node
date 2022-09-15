import nodeFetch from "node-fetch";
import {
  clientID,
  clientSecret,
  redirectUri,
  tokens,
  verifier,
} from "./variables";

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
      refresh_token: tokens.refreshToken,
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
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
}

/** @return {Promise<Response>} */
export async function fetchUserDetailsWithRetry(
  /** @type {number} */ retryCount
) {
  const response = await fetchUserDetails();

  if (response.status === 200) return response;

  if (retryCount && (await refreshTokenF()))
    return await fetchUserDetailsWithRetry(--retryCount);

  return response;
}

export async function zoomAccessToken(code) {
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
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (response.status === 200) return await response.json();
  else return null;
}
