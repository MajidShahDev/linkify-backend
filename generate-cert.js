import selfsigned from "selfsigned";
import fs from "fs";

async function generateCert() {
  const attrs = [{ name: "commonName", value: "localhost" }];

  const pems = await selfsigned.generate(attrs, {
    days: 365,
    algorithm: "sha256",
  });

  // console.log(pems);

  fs.mkdirSync("./ssl", { recursive: true });

  fs.writeFileSync("./ssl/key.pem", pems.privateKey || pems.private);
  fs.writeFileSync("./ssl/cert.pem", pems.cert);

  console.log("SSL certificate generated successfully!");
}

generateCert();

// PEM = Privacy Enhanced Mail(Base64-encoded text format for cryptographic data)
//
// cert.pem (Certificate) > This file contains:
// > Public key
// > Domain info (localhost, yourdomain.com)
// > Signature
// > Issuer info (self-signed or CA)
