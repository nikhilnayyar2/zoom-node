import { refreshToken } from "./controllers";
import { meetingData, sdkKey, sdkSecret, tokens } from "./variables";
import { KJUR } from "jsrsasign";

export function setTokens(data) {
  console.log(data);

  tokens.accessToken = data.access_token;
  tokens.refreshToken = data.refresh_token;
}

/** @return {Promise<Response>} */
export async function fetchWithRetry(
  /** @type {(...p) => Promise<Response>} */ api,
  /** @type {number} */ retryCount,
  ...params
) {
  const response = await api(...params);

  if (isOkResponseStatus(response.status)) return response;

  if (retryCount && (await refreshToken())) return await fetchWithRetry(api, --retryCount, ...params);

  return response;
}

function createSignature(meetingNumber, role) {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    sdkKey: sdkKey,
    mn: meetingNumber,
    role,
    iat: iat,
    exp: exp,
    tokenExp: iat + 60 * 60 * 2,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);

  return KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
}

export function setMeetingData(data, meetingNumber) {
  if (data) {
    meetingData.data = data;
    meetingData.signatureRole0 = createSignature(meetingNumber, 0);
    meetingData.signatureRole1 = createSignature(meetingNumber, 1);
  } else meetingData.data = null;
}

export const isOkResponseStatus = (status) => status >= 200 && status < 300;

export const sendErrorResp = (res) => res.send({ status: false });
