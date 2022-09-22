import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import ComponentView from "./ComponentView";
import { checkOauthSetup, joinMeeting } from "./handler";
import { Routes, Route, useNavigate } from "react-router-dom";

const ClientView = lazy(() => import("./ClientView"));

const isOauthSetup = async () => {
  if (!(await checkOauthSetup())) window.location.href = `http://localhost:4000/oauth${window.location.search}`;
  else return true;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [meetingData, setMeetingData] = useState(null);
  const [host, setHost] = useState(false);
  const navigate = useNavigate(false);

  const joinMeet = useCallback(async (host) => {
    setMeetingData(await joinMeeting(host));
    setHost(host);
    navigate("/client");
  }, [navigate]);

  useEffect(() => {
    isOauthSetup().then((t) => setLoading(!t));
  }, []);

  return (
    <Suspense fallback={null}>
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
            </div>
          }
        />
        <Route path="client" element={<ClientView meetingData={meetingData} host={host} />} />
        <Route path="component" element={<ComponentView meetingData={meetingData} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
