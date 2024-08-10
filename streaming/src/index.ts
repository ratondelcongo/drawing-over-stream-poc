import type http from "node:http";

import app from "./app";
import config from "./config/config";
import logger from "./modules/logger/logger";
import { getSocketIO, setSocketIO } from "./sockets/socket-io";

const server: http.Server = app.listen(config.port, () => {
	const io = setSocketIO(server);
	const io_ = getSocketIO();
	io.on("connection", (socket) => {
		console.log("a user connected");
		socket.on("data", (data: { frame_id: string; frame: string }) => {
			console.log(data.frame_id);
			io_.emit("data", data);
		});
	});

	io.on("disconnect", () => {
		console.log("a user disconnected");
	});

	logger.info(`Listening to port ${config.port}`);
});

const exitHandler = () => {
	if (server) {
		server.close(() => {
			logger.info("Server closed");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = (error: string) => {
	logger.error(error);
	exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
	logger.info("SIGTERM received");
	if (server) {
		server.close();
	}
});
