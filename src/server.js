const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const port = process.env.PORT || 3333;
const secret = process.env.SECRET || "masP23$";

const server = express();

server.use(express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(cookieParser(secret));

server.set("views", path.join(__dirname, "/views"));
server.set("view engine", "pug");

server.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

server.use(userRouter);
server.use(taskRouter);

server.get("*", (req, res) => {
  res.status(404).send("Not found");
});

process.on("uncaughtException", (e) => {
  console.error(e);
});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
