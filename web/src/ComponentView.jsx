import { useCallback, useEffect, useRef } from "react";
import ZoomMtgEmbedded from "@zoomus/websdk/embedded";

const createClient = (elem) => {
  const client = ZoomMtgEmbedded.createClient();
  client.init({
    debug: true,
    zoomAppRoot: elem,
    language: "en-US",
    customize: {
      meetingInfo: ["topic", "host", "mn", "pwd", "telPwd", "invite", "participant", "dc", "enctype"],
      // toolbar: {
      //   buttons: [
      //     {
      //       text: "Custom Button",
      //       className: "CustomButton",
      //       onClick: () => {
      //         console.log("custom button");
      //       },
      //     },
      //   ],
      // },
      // video: {
      //   isResizable: true,
      //   viewSizes: {
      //     default: {
      //       width: 1000,
      //       height: 600,
      //     },
      //   },
      // },
    },
  });
  return client;
};

function connectionChange({ state }) {
  if (state === "Closed") alert("user left");
}

function ComponentView({ meetingData }) {
  const zoomAppRootRef = useRef(null);
  const zoomClientRef = useRef(/** @type {import("@zoomus/websdk/embedded")["EmbeddedClient"]} */ (null));

  const _createClient = useCallback(() => {
    if (zoomClientRef.current) {
      zoomClientRef.current.off("connection-change", connectionChange);
    }
    zoomClientRef.current = createClient(zoomAppRootRef.current);
    zoomClientRef.current.on("connection-change", connectionChange);
  }, []);

  useEffect(() => {
    _createClient();
    if (meetingData) zoomClientRef.current.join(meetingData);
  }, [meetingData, _createClient]);

  return <div ref={zoomAppRootRef}></div>;
}

export default ComponentView;
