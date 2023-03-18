import { server } from "./server";

server.listen(process.env.VITE_APP_API_PORT || 3001, () => console.log("Server started"));
