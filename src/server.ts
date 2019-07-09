import { EventEmitter } from "events";
import minecraft, { Server, createServer, Client, createClient, PacketMeta } from "minecraft-protocol";

const States = (minecraft as any).states;

export interface ServerOptions {
    host: string,
    port: number,
    serverPort: number | undefined,
    email: string,
    password: string,
    version: string
}

export type PacketInformation = {
    client: Client
    packet: Packet
}

export type Packet = {
    meta: PacketMeta,
    data: any
}

export default class ProxyServer extends EventEmitter {

    options: ServerOptions;
    server: Server;
    proxyClient: Client | undefined;
    client: Client | undefined;

    constructor(options: ServerOptions) {
        super();

        this.options = options;
        this.server = createServer({
            port: options.serverPort || (options.port + 1),
            version: options.version,
            keepAlive: true
        });

        this.server.on("login", this.onUserConnect.bind(this));
    }

    private onUserConnect(client: Client) {
        if (this.proxyClient) {
            client.end("Proxy already has an active user.");
            return;
        }

        this.client = client;
        this.proxyClient = createClient({
            username: this.options.email,
            password: this.options.password,
            host: this.options.host,
            port: this.options.port,
            keepAlive: true
        });

        this.proxyClient.on("packet", (data, meta) => {
            if (meta.state === States.PLAY && client.state === States.PLAY) {
                client.write(meta.name, data);

                if (meta.name === "set_compression") {
                    (client as any).compressionThreshold = data.threshold;
                }
            }
        });

        client.on("packet", (data, meta) => {
            if (this.proxyClient!.state === States.PLAY && meta.state === States.PLAY) {
                if (meta.name === "chat") {
                    const message: string = data.message;

                    if (message.length > 0 && message.charAt(0) === "$") {
                        this.emit("command", message.substring(1), client);
                    } else {
                        this.emit("packet", { client: client, packet: { meta: meta, data: data } });
                        this.proxyClient!.write(meta.name, data);
                    }
                } else if (meta.name !== "keep_alive") {
                    this.emit("packet", { client: client, packet: { meta: meta, data: data } });
                    this.proxyClient!.write(meta.name, data);
                }
            }
        });

        this.proxyClient.on("end", this.onUserDisconnect.bind(this));
        client.on("end", this.onUserDisconnect.bind(this));
    }

    private onUserDisconnect(reason: string) {
        this.proxyClient = undefined;
        console.log(`Connection closed: ${ reason }`);
    }

}