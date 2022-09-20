import express from "express";
import {
  createMeeting,
  endMeeting,
  fetchLiveMeetings,
  fetchUserDetails,
  getUserZak,
  zoomAccessToken,
} from "./controllers";
import { fetchWithRetry, sendRespStatus, setMeetingData, setTokens } from "./handlers";
import { challenge, challengeMethod, clientID, meetingData, redirectUri, tokens } from "./variables";

export const router = express.Router();

router.get("/user", async (req, res) => {
  const response = await fetchWithRetry(fetchUserDetails, 1);
  if (response.ok) return res.json(await response.json());
  return sendRespStatus(res, false);
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

    if (data) {
      // save tokens
      setTokens(data);
      return res.redirect(redirectUri);
    }
  }

  // Step 2:
  // If no authorization code is available, redirect to Zoom OAuth to authorize
  return res.redirect(
    `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${clientID}&code_challenge=${challenge}&code_challenge_method=${challengeMethod}&state=classplus-web-token`
  );
});

router.get("/create-meeting", async (req, res) => {
  const sendMeetingData = async () => {
    const response = await fetchWithRetry(getUserZak, 1);
    if (response.ok)
      return res.send({
        ...meetingData.data,
        signature: meetingData.signatureRole1,
        zak: (await response.json()).token,
      });
    return sendRespStatus(res, false);
  };

  // check for live meetings
  const response = await fetchWithRetry(fetchLiveMeetings, 1);
  if (response.ok) {
    const { meetings } = await response.json();
    // clear server meeting data if no zoom live meeting is going on
    if (!meetings.length && meetingData.data) setMeetingData(null);
  }

  // if meeting is going on
  if (meetingData.data) return sendMeetingData();

  // create meeting and save meeting data
  const response1 = await fetchWithRetry(createMeeting, 1);
  if (response1.ok) {
    const { id, password, join_url } = await response1.json();
    setMeetingData({ id, password, join_url }, id);
    return sendMeetingData();
  }

  return sendRespStatus(res, false);
});

router.get("/join-meeting", async (req, res) => {
  if (meetingData.data) return res.send({ ...meetingData.data, signature: meetingData.signatureRole0 });
  return sendRespStatus(res, false);
});

router.get("/check-setup", async (req, res) => {
  return sendRespStatus(res, !!tokens.accessToken);
});

router.get("/end-meeting", async (req, res) => {
  const meetingId = meetingData.data?.id;
  if (meetingId) {
    await endMeeting(meetingId);
    setMeetingData(null);
  }

  return sendRespStatus(res, true);
});
