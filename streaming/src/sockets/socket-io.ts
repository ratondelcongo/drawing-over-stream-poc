import { Server } from "socket.io";

let io: Server | undefined;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const setSocketIO = (server: any): Server => {
	io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	return io;
};

const getSocketIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized");
	}

	return io;
};

export { setSocketIO, getSocketIO };
