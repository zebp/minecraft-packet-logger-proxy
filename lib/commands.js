"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var CommandHandler = /** @class */ (function () {
    function CommandHandler(proxyServer) {
        this.proxyServer = proxyServer;
        this.loggers = [];
        this.proxyServer.on("command", this.handleCommand.bind(this));
        this.proxyServer.on("packet", this.onOutgoingPacket.bind(this));
    }
    CommandHandler.prototype.handleCommand = function (message, client) {
        var split = message.split(/\s+/);
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
                patterns: split.slice(2, split.length).map(function (regex) { return new RegExp(regex); }),
                packets: []
            });
        }
        else if (split[0].toLowerCase() === "stop") {
            if (split.length < 2) {
                this.sendMessage(client, "Invalid parameters, please enter logger name.");
                return;
            }
            var loggerName_1 = split[1].toLowerCase();
            var logger_1 = this.loggers.find(function (logger) { return logger.name === loggerName_1; });
            if (!logger_1) {
                return;
            }
            this.save(logger_1);
            this.loggers = this.loggers.filter(function (item) { return item !== logger_1; });
        }
    };
    CommandHandler.prototype.onOutgoingPacket = function (packetInfo) {
        var packet = packetInfo.packet;
        for (var _i = 0, _a = this.loggers; _i < _a.length; _i++) {
            var logger = _a[_i];
            for (var _b = 0, _c = logger.patterns; _b < _c.length; _b++) {
                var pattern = _c[_b];
                if (pattern.test(packet.meta.name)) {
                    this.sendMessage(packetInfo.client, "\u00A7lLogger: \u00A7b" + logger.name + " \u00A7r\u00A7lPacket: \u00A7a" + packet.meta.name + " \u00A7r\u00A7lPattern: \u00A7c" + pattern, 2);
                }
            }
        }
    };
    CommandHandler.prototype.save = function (logger) {
        if (!fs_1.existsSync("./output")) {
            fs_1.mkdirSync("./output");
        }
        fs_1.writeFileSync("./output/" + logger.name + ".packets.json", JSON.stringify(logger.packets, null, 4));
    };
    CommandHandler.prototype.sendMessage = function (client, message, position) {
        if (position === void 0) { position = 0; }
        client.write("chat", { message: JSON.stringify({
                text: message
            }), position: position });
    };
    return CommandHandler;
}());
exports.default = CommandHandler;
//# sourceMappingURL=commands.js.map