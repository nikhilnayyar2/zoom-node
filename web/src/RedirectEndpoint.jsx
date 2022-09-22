import { useEffect } from "react";

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "https:";
}

export function RedirectEndpoint() {
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");

    if (isValidHttpUrl(state)) window.location.replace(state + "&code=" + code);
  }, []);

  return "authorizing...";
}
