const fs = require("fs-extra");
const destPath = `${process.env.NODE_ENV === "production" ? "build" : "public"}/static/zoom/lib`;
fs.copySync("node_modules/@zoomus/websdk/dist/lib", destPath);
