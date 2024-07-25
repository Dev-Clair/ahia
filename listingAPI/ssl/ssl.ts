import fs from "node:fs";

const SSL = (keyFilePath: string, certFilePath: string) => {
  return {
    key: fs.readFileSync(keyFilePath),
    cert: fs.readFileSync(certFilePath),
  };
};

export default SSL;
