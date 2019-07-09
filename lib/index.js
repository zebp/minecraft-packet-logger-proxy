"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./server"));
var dotenv_1 = __importDefault(require("dotenv"));
var commands_1 = __importDefault(require("./commands"));
// Load .env file into env variables.
dotenv_1.default.config();
var options = {
    host: process.env.HOST,
    port: parseInt(process.env.TARGET_PORT),
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    version: process.env.VERSION,
    serverPort: undefined
};
if (process.env.SERVER_PORT) {
    options.serverPort = parseInt(process.env.SERVER_PORT);
}
var server = new server_1.default(options);
var commandHandler = new commands_1.default(server);
//# sourceMappingURL=index.js.map