import { useCallback, useEffect, useState } from "react";
import ClientView from "./ClientView";
// import ComponentView from "./ComponentView";
import { checkOauthSetup, joinMeeting } from "./handler";
import { Routes, Route } from "react-router-dom";
import ZoomMeetEnd from "./ZoomMeetEnd";

const isOauthSetup = async () => {
  if (!(await checkOauthSetup())) window.location.href = `http://localhost:4000/oauth${window.location.search}`;
  else return true;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [meetingData, setMeetingData] = useState(null);
  const [host, setHost] = useState(false);

  const joinMeet = useCallback(async (host) => {
    setMeetingData(await joinMeeting(host));
    setHost(host)
  }, []);

  useEffect(() => {
    isOauthSetup().then((t) => setLoading(!t));
  }, []);

  return (
    <Routes>
      <Route
        index
        element={
          <div className="App">
            {!(loading || meetingData) && (
              <div style={{ position: "fixed", top: "0", left: "0", zIndex: "1000" }}>
                <button
                  style={{ padding: "1rem", background: "wheat", marginRight: "1rem" }}
                  onClick={() => joinMeet(true)}
                >
                  Start
                </button>
                <button style={{ padding: "1rem", background: "wheat" }} onClick={() => joinMeet(false)}>
                  Join
                </button>
              </div>
            )}
            {/* <ComponentView meetingData={meetingData} /> */}
            <ClientView meetingData={meetingData} host={host} />
          </div>
        }
      />
      <Route path="end-zoom-meet" element={<ZoomMeetEnd />} />
    </Routes>
  );
}

export default App;
