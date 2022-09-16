import express from "express";
import { createMeeting, fetchLiveMeetings, fetchUserDetails, zoomAccessToken } from "./controllers";
import { fetchWithRetry, isOkResponseStatus, sendErrorResp, setMeetingData, setTokens } from "./handlers";
import { challenge, challengeMethod, clientID, meetingData, redirectUri } from "./variables";

export const router = express.Router();

router.get("/user", async (req, res) => {
  const response = await fetchWithRetry(fetchUserDetails, 1);
  if (isOkResponseStatus(response.status)) return res.json(await response.json());
  return sendErrorResp(res);
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

    return res.send("oauth Done");
  }

  // Step 2:
  // If no authorization code is available, redirect to Zoom OAuth to authorize
  return res.redirect(
    `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${clientID}&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`
  );
});

router.get("/create-meeting", async (req, res) => {
  const sendMeetingData = () =>
    res.send({
      ...meetingData.data,
      signature: meetingData.signatureRole1,
    });

  // check for live meetings and clear server meeting data if no zoom live meeting is going on
  const response = await fetchWithRetry(fetchLiveMeetings, 1);
  if (isOkResponseStatus(response.status)) {
    const { meetings } = await response.json();
    if (!meetings.length && meetingData.data) setMeetingData(null);
    meetingData.data = null;
  }

  // if meeting is going on
  if (meetingData.data) return sendMeetingData();

  // create meeting and save meeting data
  const response1 = await fetchWithRetry(createMeeting, 1);
  if (isOkResponseStatus(response1.status)) {
    const { id, password, join_url } = await response1.json();
    setMeetingData({ id, password, join_url }, id);
    return sendMeetingData();
  }
});

router.get("/join-meeting", async (req, res) => {
  if (meetingData.data) return res.send({ ...meetingData.data, signature: meetingData.signatureRole0 });
  return sendErrorResp(res);
});
