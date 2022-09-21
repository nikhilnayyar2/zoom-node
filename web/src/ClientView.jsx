import { ZoomMtg } from "@zoomus/websdk";
import { useEffect } from "react";
import "./ClientView.css";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.7.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

const createClient = (meetingData, host) => {
  ZoomMtg.init({
    leaveUrl: "http://localhost:3000/end-zoom-meet?host=" + host,
    success: (success) => {
      console.log("init success", success);
      ZoomMtg.join({
        signature: meetingData.signature,
        meetingNumber: meetingData.meetingNumber,
        userName: meetingData.userName + " " + new Date().getTime().toString(),
        sdkKey: meetingData.sdkKey,
        passWord: meetingData.password,
        zak: meetingData.zak,
        success: (success) => console.log("join success", success),
        error: (error) => {
          console.log("join error", error);
          // // https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/error-codes/
          // const { errorCode, method } = error;
          // if (method === "join") {
          //   // if(errorCode === 3707) // The meeting number is not found.
          // }
        },
      });
    },
    error: (error) => console.log("init error", error),
  });
};

function ClientView({ meetingData, host }) {
  useEffect(() => {
    if (meetingData) createClient(meetingData, host);
  }, [meetingData, host]);

  return null;
}

export default ClientView;
