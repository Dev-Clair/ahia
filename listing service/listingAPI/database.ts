import Config from "./config";
import Connection from "./src/utils/connection";

// Create and Export New Database Connection Instance
const Database = Connection.Create(Config.MONGO_URI);

export default Database;
