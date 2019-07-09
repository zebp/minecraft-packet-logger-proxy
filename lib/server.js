"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var minecraft_protocol_1 = __importStar(require("minecraft-protocol"));
var States = minecraft_protocol_1.default.states;
var ProxyServer = /** @class */ (function (_super) {
    __extends(ProxyServer, _super);
    function ProxyServer(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.server = minecraft_protocol_1.createServer({
            port: options.serverPort || (options.port + 1),
            version: options.version,
            keepAlive: true
        });
        _this.server.on("login", _this.onUserConnect.bind(_this));
        return _this;
    }
    ProxyServer.prototype.onUserConnect = function (client) {
        var _this = this;
        if (this.proxyClient) {
            client.end("Proxy already has an active user.");
            return;
        }
        this.client = client;
        this.proxyClient = minecraft_protocol_1.createClient({
            username: this.options.email,
            password: this.options.password,
            host: this.options.host,
            port: this.options.port,
            keepAlive: true
        });
        this.proxyClient.on("packet", function (data, meta) {
            if (meta.state === States.PLAY && client.state === States.PLAY) {
                client.write(meta.name, data);
                if (meta.name === "set_compression") {
                    client.compressionThreshold = data.threshold;
                }
            }
        });
        client.on("packet", function (data, meta) {
            if (_this.proxyClient.state === States.PLAY && meta.state === States.PLAY) {
                if (meta.name === "chat") {
                    var message = data.message;
                    if (message.length > 0 && message.charAt(0) === "$") {
                        _this.emit("command", message.substring(1), client);
                    }
                    else {
                        _this.emit("packet", { client: client, packet: { meta: meta, data: data } });
                        _this.proxyClient.write(meta.name, data);
                    }
                }
                else if (meta.name !== "keep_alive") {
                    _this.emit("packet", { client: client, packet: { meta: meta, data: data } });
                    _this.proxyClient.write(meta.name, data);
                }
            }
        });
        this.proxyClient.on("end", this.onUserDisconnect.bind(this));
        client.on("end", this.onUserDisconnect.bind(this));
    };
    ProxyServer.prototype.onUserDisconnect = function (reason) {
        this.proxyClient = undefined;
        console.log("Connection closed: " + reason);
    };
    return ProxyServer;
}(events_1.EventEmitter));
exports.default = ProxyServer;
//# sourceMappingURL=server.js.map