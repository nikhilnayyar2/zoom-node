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
  if (!tokens.accessToken)
    return sendRespStatus(
      res,
      false,
      `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${clientID}&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`
    );

  return sendRespStatus(res, true);
});

router.get("/generate-tokens", async (req, res) => {
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
    }

    return sendRespStatus(res, !!data);
  }

  return sendRespStatus(res, false);
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

    if (meetings.length) {
      // if zoom meeting is going on and there is no meetingData on server then the zoom meeting is regarded as previous and it has not ended
      // so end it so that a user can host only one zoom meeting at a time (https://support.zoom.us/hc/en-us/articles/206122046-Hosting-concurrent-meetings)
      if (!meetingData.data) await endMeeting(meetings[0].id);
      // server meeting data and zoom meeting data does not match. this case may not come at all
      // If true then end zoom session and clear server meeting data
      else if (meetingData.data.id !== meetings[0].id) {
        await endMeeting(meetings[0].id);
        setMeetingData(null);
      }
    }
    // clear server meeting data if no zoom live meeting is going on
    else if (meetingData.data) {
      setMeetingData(null);
    }
  }

  // if meeting is going on
  if (meetingData.data) return sendMeetingData();

  // create meeting and save meeting data
  const response1 = await fetchWithRetry(createMeeting, 1);
  if (response1.ok) {
    const { id, password } = await response1.json();
    setMeetingData({ id, password }, id);
    return sendMeetingData();
  }

  return sendRespStatus(res, false);
});

router.get("/join-meeting", async (req, res) => {
  if (meetingData.data) return res.send({ ...meetingData.data, signature: meetingData.signatureRole0 });
  return sendRespStatus(res, false);
});

router.get("/end-meeting", async (req, res) => {
  const meetingId = meetingData.data?.id;
  // const endZoomSession = req.query.endZoomSession === "true";

  if (meetingId) {
    // if (endZoomSession) await endMeeting(meetingId);
    setMeetingData(null);
  }

  return sendRespStatus(res, true);
});
