import ProxyServer, { ServerOptions } from "./server";
import dotenv from "dotenv";
import CommandHandler from "./commands";

// Load .env file into env variables.
dotenv.config();

const options: ServerOptions = {
    host: process.env.HOST!,
    port: parseInt(process.env.TARGET_PORT!),
    email: process.env.EMAIL!,
    password: process.env.PASSWORD!,
    version: process.env.VERSION!,
    serverPort: undefined
};

if (process.env.SERVER_PORT) {
    options.serverPort = parseInt(process.env.SERVER_PORT);
}

const server = new ProxyServer(options);
const commandHandler = new CommandHandler(server);