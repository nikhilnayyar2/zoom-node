import nodeFetch from "node-fetch";
import { isOkResponseStatus, setTokens } from "./handlers";
import { clientID, clientSecret, redirectUri, tokens, verifier } from "./variables";

export async function refreshToken() {
  const response = await nodeFetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
  });

  if (isOkResponseStatus(response.status)) {
    setTokens(await response.json());
    return true;
  }
  return false;
}

export function fetchUserDetails() {
  return nodeFetch("https://api.zoom.us/v2/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
}

export async function zoomAccessToken(code) {
  const response = await nodeFetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (isOkResponseStatus(response.status)) return await response.json();
  else return null;
}

export function fetchLiveMeetings() {
  return nodeFetch(`https://api.zoom.us/v2/users/me/meetings?type=live`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + tokens.accessToken,
    },
  });
}

export function createMeeting() {
  return nodeFetch(`https://api.zoom.us/v2/users/me/meetings`, {
    method: "POST",
    body: JSON.stringify({
      topic: "test create meeting",
      type: 1,
      settings: {
        show_share_button: false,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokens.accessToken,
    },
  });
}
