import bcrypt from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  console.error("Or:    npm run hash -- <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

const authDir = join(process.cwd(), ".auth");
const hashPath = join(authDir, "password.hash");

await mkdir(authDir, { recursive: true });
await writeFile(hashPath, hash, "utf-8");

console.log("\nHash generated and written to:");
console.log(`  ${hashPath}`);
console.log("\nThis file is gitignored. The admin auth reads from it directly,");
console.log("bypassing .env.local entirely (no $ escaping headaches).\n");
console.log("Hash value (for reference):");
console.log(`  ${hash}\n`);
