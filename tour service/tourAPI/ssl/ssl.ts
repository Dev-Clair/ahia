import fs from "node:fs/promises";

async function SSL(
  keyFilePath: string,
  certFilePath: string
): Promise<{
  key: string;
  cert: string;
}> {
  return {
    key: await fs.readFile(keyFilePath, { encoding: "utf-8" }),
    cert: await fs.readFile(certFilePath, { encoding: "utf-8" }),
  };
}

export default SSL;
