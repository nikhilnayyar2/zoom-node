import { ZoomMtg } from "@zoomus/websdk";
import { useEffect } from "react";
import "./ClientView.css"

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.7.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

const createClient = (meetingData) => {
  ZoomMtg.init({
    leaveUrl: "http://localhost:3000/end-zoom-meet",
    success: (success) => {
      console.log("init success", success);
      ZoomMtg.join({
        signature: meetingData.signature,
        meetingNumber: meetingData.meetingNumber,
        userName: meetingData.userName + " " + (new Date().getTime()).toString(),
        sdkKey: meetingData.sdkKey,
        passWord: meetingData.password,
        zak: meetingData.zak,
        success: (success) => console.log("join success", success),
        error: (error) => console.log("join error", error),
      });
    },
    error: (error) => console.log("init error", error),
  });
};

function ClientView({ meetingData }) {
  useEffect(() => {
    if (meetingData) createClient(meetingData);
  }, [meetingData]);

  return null;
}

export default ClientView;
