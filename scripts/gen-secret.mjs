import crypto from "node:crypto";

const secret = crypto.randomBytes(32).toString("hex");
console.log("\nPaste this into .env.local as AUTH_SECRET:\n");
console.log(secret);
console.log("");
