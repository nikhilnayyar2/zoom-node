import { tokens } from "./variables";

export function setTokens(data) {
  console.log(data);

  tokens.accessToken = data.access_token;
  tokens.refreshToken = data.refresh_token;
}
