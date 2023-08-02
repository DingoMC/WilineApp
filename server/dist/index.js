"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./routes/user");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
// JSON, CORS, and URL encoding middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/users", user_1.userRoutes); // Routes group
// Testing route
app.get('/', (req, res) => {
    res.send('If You are seeing this, the server is working properly!');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
