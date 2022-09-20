import { useState } from "react";
import { useEffect } from "react";
import { endMeeting } from "./handler";

export default function ZoomMeetEnd() {
  const [meetEnded, setMeetEnded] = useState(false);

  useEffect(() => {
    !meetEnded && endMeeting().then(() => setMeetEnded(true));
  }, [meetEnded]);

  return <div>{meetEnded ? "Meet ended!" : "ending..."}</div>;
}
