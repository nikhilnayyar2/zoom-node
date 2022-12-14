import { ZoomMtg } from "@zoomus/websdk";
import { useEffect, useState } from "react";
import "./ClientView.css";
import { endMeeting } from "./handler";

ZoomMtg.setZoomJSLib("static/zoom/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

const displayZoomOverlay = (/** @type {"none" | "block"} */ display) =>
  (document.getElementById("zmmtg-root").style.display = display);

const zoomMeetEndUrlHash = "#cp-end";

/********************************************************************** */

function removeGuestLabelFromParticipantList() {
  const listConts = document.querySelectorAll(".ReactVirtualized__Grid__innerScrollContainer");
  listConts.forEach((listCont) => {
    const plabel = listCont.querySelectorAll(".participants-item__name-label");
    for (const elem2 of plabel) if (elem2.textContent.toLowerCase().includes("guest")) elem2.textContent = "";
  });
}

function removeLeaveBtn() {
  const nodes = document.querySelectorAll('button[class *= "leave-meeting"');
  if (nodes.length) {
    for (const node of nodes.values())
      if (node.textContent.toLowerCase().includes("leave")) {
        node.parentElement.removeChild(node);
        break;
      }
  }
}

/********************************************************************** */

const createClient = (meetingData) => {
  // ZoomMtg.inMeetingServiceListener("onUserJoin", function (data) {
  //   console.log("nikhil onUserJoin", data);
  // });
  // ZoomMtg.inMeetingServiceListener("onUserLeave", function (data) {
  //   console.log("nikhil onUserLeave", data);
  // });
  // ZoomMtg.inMeetingServiceListener("onUserIsInWaitingRoom", function (data) {
  //   console.log("nikhil onUserIsInWaitingRoom", data);
  // });
  // ZoomMtg.inMeetingServiceListener("", function (data) {
  //   console.log("nikhil onUserIsInWaitingRoom", data);
  // });

  ZoomMtg.init({
    leaveUrl: window.location.href + zoomMeetEndUrlHash,
    meetingInfo: ["topic", "host", "mn", "participant", "dc", "enctype", "report"],
    disablePreview: true,
    disableInvite: true,
    debug: process.env.NODE_ENV === "development",
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
          console.log("nikhil join error", error);
          // // https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/error-codes/
          // const { errorCode, method } = error;
          // if (method === "join") {
          //   // if(errorCode === 3707) // The meeting number is not found.
          // }
        },
      });
    },
    error: (error) => console.log("nikhil init error", error),
  });
};

function ClientView({ meetingData, host, setMeetingData }) {
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
        if (window.location.hash === zoomMeetEndUrlHash) {
          displayZoomOverlay("none");
          const succussCallback = () => window.location.replace(window.location.origin);
          if (host) {
            setEndingMeetingServerSide(true);
            endMeeting().then(succussCallback).catch(succussCallback);
          } else succussCallback();
        }
      };
      window.addEventListener("popstate", popstateEvtHndlr);

      /*** */
      ZoomMtg.inMeetingServiceListener("onUserJoin", function (data) {
        // if (!host) return;

        const targetNode = document.getElementById("wc-content");

        if (targetNode && !observer) {
          observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
              if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                  if (node instanceof HTMLElement) {
                    if (
                      ["ReactVirtualized__Grid__innerScrollContainer", "participants-item-position"].some((c) =>
                        node.classList.contains(c)
                      ) ||
                      node.id === "wc-container-right"
                    )
                      removeGuestLabelFromParticipantList();
                    else if (host && node.classList.contains("leave-option-container")) removeLeaveBtn();
                  }
                });
              }
            }
          });

          observer.observe(targetNode, {
            childList: true,
            subtree: true,
          });
        }
      });
    }

    return () => {
      if (popstateEvtHndlr) window.removeEventListener("popstate", popstateEvtHndlr);
      if (observer) observer.disconnect();
    };
  }, [meetingData, host]);

  /** safelty purpose. user dont see black screen */
  useEffect(() => {
    displayZoomOverlay("block");
    return () => {
      displayZoomOverlay("none");
      setMeetingData(null);
    };
  }, [setMeetingData]);

  return endingMeetingServerSide ? <div id="zoomClientViewEndingMeetServerSide">Ending Meeting ...</div> : null;
}

export default ClientView;
