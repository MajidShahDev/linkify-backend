import selfsigned from "selfsigned";
import fs from "fs";

async function generateCert() {
  const attrs = [{ name: "commonName", value: "localhost" }];

  const pems = await selfsigned.generate(attrs, {
    days: 365,
    algorithm: "sha256",
  });

  fs.mkdirSync("./ssl", { recursive: true });

  fs.writeFileSync("./ssl/key.pem", pems.privateKey || pems.private);
  fs.writeFileSync("./ssl/cert.pem", pems.cert);

}

generateCert().catch((error) => {
  console.error(error);
  process.exit(1);
});


