export const joinMeeting = async (host) => {
  const res = await fetch(host ? "http://localhost:4000/create-meeting" : "http://localhost:4000/join-meeting");
  if (res.ok) {
    const { id, password, zak, signature } = await res.json();
    return {
      sdkKey: process.env.REACT_APP_sdkKey,
      signature,
      meetingNumber: id,
      password,
      userName: host ? "IamHost" : "participant",
      zak: host ? zak : undefined,
    };
  }
};

export const endMeeting = async () => {
  await fetch("http://localhost:4000/end-meeting");
};

export const checkOauthSetup = async () => {
  const res = await fetch("http://localhost:4000/oauth");
  const data = (await res.json()).data;
  return data;
};

export const generateTokens = async (code) => {
  const res = await fetch("http://localhost:4000/generate-tokens?code=" + code);
  const status = (await res.json()).status;
  return status;
};
