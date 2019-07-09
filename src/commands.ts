import ProxyServer, { PacketInformation, Packet } from "./server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { Client } from "minecraft-protocol";

type Logger = {
    name: string,
    patterns: RegExp[],
    packets: Packet[]
}

export default class CommandHandler {

    proxyServer: ProxyServer;
    loggers: Logger[];

    constructor(proxyServer: ProxyServer) {
        this.proxyServer = proxyServer;
        this.loggers = [];

        this.proxyServer.on("command", this.handleCommand.bind(this));
        this.proxyServer.on("packet", this.onOutgoingPacket.bind(this));
    }

    private handleCommand(message: string, client: Client) {
        const split = message.split(/\s+/);

        if (split.length == 0) {
            return;
        }

        if (split[0].toLowerCase() === "start") {
            if (split.length < 3) {
                this.sendMessage(client, "Invalid parameters, please enter logger name and packet regex(es).");
                return;
            }

            this.loggers.push({
                name: split[1].toLowerCase(),
                patterns: split.slice(2, split.length).map(regex => new RegExp(regex)),
                packets: []
            });
        } else if (split[0].toLowerCase() === "stop") {
            if (split.length < 2) {
                this.sendMessage(client, "Invalid parameters, please enter logger name.");
                return;
            }

            const loggerName = split[1].toLowerCase();
            const logger: Logger | undefined = this.loggers.find(logger => logger.name === loggerName);

            if (!logger) {
                return;
            }

            this.save(logger);
            this.loggers = this.loggers.filter(item => item !== logger);
        }
    }

    private onOutgoingPacket(packetInfo: PacketInformation) {
        const packet = packetInfo.packet;

        for (let logger of this.loggers) {
            for (let pattern of logger.patterns) {
                if (pattern.test(packet.meta.name)) {
                    this.sendMessage(packetInfo.client, `§lLogger: §b${ logger.name } §r§lPacket: §a${ packet.meta.name } §r§lPattern: §c${ pattern }`, 2);
                }
            }
        }
    }

    private save(logger: Logger) {
        if (!existsSync("./output")) {
            mkdirSync("./output");
        }
        
        writeFileSync(`./output/${logger.name}.packets.json`, JSON.stringify(logger.packets, null, 4));
    }
    
    private sendMessage(client: Client, message: string, position: number = 0) {
        client.write("chat", { message: JSON.stringify({
            text: message
        }), position: position });
    }
}