import Config from "./config";
import Connection from "./src/utils/connection";

const Database = Connection.Create(Config.MONGO_URI);

export default Database;
