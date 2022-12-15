# zoom-node


## zoom OAuth 2 integration

PKCE code part implemented from https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js

ZOOM oauth flow https://marketplace.zoom.us/docs/guides/auth/oauth/#getting-an-access-token

## zoom docs

https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#overview
https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/
https://marketplace.zoom.us/docs/sdk/native-sdks/web/#sample-apps
https://marketplace.zoom.us/docs/sdk/native-sdks/web/build/
https://marketplace.zoom.us/docs/guides/build/sdk-app/


## setup 
- `.env` file at root
  ```
  clientID=XYZ
  clientSecret=XYZ
  redirectUri=https://localhost:3000/web
  serverPort= 4000
  sdkKey= XYZ
  sdkSecret= XYZ
  ```
- create `web/.env`
  ```
  REACT_APP_sdkKey=XYZ
  HTTPS=true
  ```
- run server - `npm run start` in root
- run web - `cd web && npm run start`

## UX
- goto `https://localhost:3000`
- grant permission on zoom page
- when you come back to `https://localhost:3000` you will see buttons
- if you are host then click start
- if you are participant then click join
- when host starts the meeting, participants will be able to join

