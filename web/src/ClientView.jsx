import { ZoomMtg } from "@zoomus/websdk";
import { useEffect, useState } from "react";
import "./ClientView.css";
import { endMeeting } from "./handler";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.7.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

const createClient = (meetingData) => {
  ZoomMtg.init({
    leaveUrl: window.location.href + "#cp-end",
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
  const [endingMeetingServerSide, setEndingMeetingServerSide] = useState(false);

  /** this effect should be called atmost twice */
  useEffect(() => {
    let popstateEvtHndlr, /** @type {MutationObserver} */ observer;

    /*** */
    if (meetingData) {
      /** */
      createClient(meetingData);

      /** */
      popstateEvtHndlr = () => {
        if (window.location.hash === "#cp-end") {
          document.getElementById("zmmtg-root").style.display = "none";

          if (host) {
            setEndingMeetingServerSide(true);
            endMeeting().then(() => {
              window.location.replace("http://localhost:3000");
            });
          }
        }
      };
      window.addEventListener("popstate", popstateEvtHndlr);

      /*** */
      ZoomMtg.inMeetingServiceListener("onUserJoin", function (data) {
        // Select the node that will be observed for mutations
        const targetNode = document.getElementById("wc-footer");

        if (targetNode) {
          // Options for the observer (which mutations to observe)
          const config = { childList: true };
          // Callback function to execute when mutations are observed
          const callback = (mutationList) => {
            for (const mutation of mutationList) {
              if (mutation.type === "childList") {
                // remove leave meeting btn for host
                if (data.isHost) {
                  const nodes = document.querySelectorAll('button[class *= "leave-meeting"');
                  if (nodes.length) {
                    for (const node of nodes.values())
                      if (node.textContent.toLowerCase().includes("leave")) {
                        node.parentElement.removeChild(node);
                        break;
                      }
                  }
                }
              }
            }
          };
          // Create an observer instance linked to the callback function
          observer = new MutationObserver(callback);
          // Start observing the target node for configured mutations
          observer.observe(targetNode, config);
        }
      });
    }

    return () => {
      if (popstateEvtHndlr) window.removeEventListener("popstate", popstateEvtHndlr);
      if (observer) observer.disconnect();
    };
  }, [meetingData, host]);

  return endingMeetingServerSide ? <div id="endingMeetingServerSide">Ending Meeting ...</div> : null;
}

export default ClientView;
