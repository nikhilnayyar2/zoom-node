import { useState } from "react";
import { useEffect } from "react";
import { endMeeting } from "./handler";

export default function ZoomMeetEnd() {
  const [meetEnded, setMeetEnded] = useState(false);

  useEffect(() => {
    const host = new URLSearchParams(window.location.search).get("host");
    host === "true" && !meetEnded && endMeeting().then(() => setMeetEnded(true));
  }, [meetEnded]);

  return <div>{meetEnded ? "Meet ended!" : "ending..."}</div>;
}
