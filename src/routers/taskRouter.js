const express = require("express");
const axios = require("axios");
const pug = require("pug");
const path = require("path");
const auth = require("../middlewares/auth");

const api = process.env.API || "http://localhost:3000";

const router = express.Router();
axios.defaults.baseURL = api;

router.get("/tasks", auth, async (req, res) => {
  try {
    const query =
      "?sortBy=createdAt:desc" +
      (req.query.completed ? "&completed=" + req.query.completed : "");

    const { data } = await axios.get("/tasks" + query, req.axiosAuthHeader);

    res.render("index", { tasks: data });
  } catch (error) {
    console.log(error.message);
    res.render("index", { error: "Something went wrong" });
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const { data } = await axios.get(
      "/tasks/" + req.params.id,
      req.axiosAuthHeader
    );

    res.render("index", { tasks: [data] });
  } catch (error) {
    console.log(error.message);
    res.render("index", { error: "Something went wrong" });
  }
});

router.post("/tasks", auth, async (req, res) => {
  try {
    req.body.completed = req.body.completed === "on" ? true : false;
    const { data } = await axios.post("tasks", req.body, req.axiosAuthHeader);

    // Load the data with same filter if js is disabled
    if (req.headers["hx-request"] !== "true") {
      const redirectUrl = req.headers.referer.split(req.headers.host)[1];
      return res.redirect(redirectUrl);
    }

    const currentUrl = req.headers["hx-current-url"];

    if (currentUrl.includes("completed=")) {
      // Check current task filter is matches the new task
      const isMatch =
        currentUrl.split("completed=")[1] === String(data.completed);
      // If new task does not belong to current filter
      if (!isMatch) {
        return res.send("");
      }
    }

    const taskMarkupTemplate = pug.compileFile(
      path.join(__dirname, "../views/includes/task.pug")
    );

    const taskMarkup = taskMarkupTemplate({ task: data });

    res.send(taskMarkup);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/editTask/:id", auth, async (req, res) => {
  try {
    const { data } = await axios.get(
      "/tasks/" + req.params.id,
      req.axiosAuthHeader
    );

    res.render("editTask", { task: data });
  } catch (error) {
    console.log(error.message);
    res.render("index", { error: "Something went wrong" });
  }
});

router.post("/updateTask/:id", auth, async (req, res) => {
  try {
    req.body.completed = req.body.completed === "on" ? true : false;
    const { status } = await axios.patch(
      "tasks/" + req.params.id,
      req.body,
      req.axiosAuthHeader
    );

    if (status !== 200) {
      throw new Error("Response status: " + status);
    }

    res.redirect(303, '/');
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/deleteTask/:id", auth, async (req, res) => {
  try {
    const { status } = await axios.delete(
      "tasks/" + req.params.id,
      req.axiosAuthHeader
    );

    if (status !== 200) {
      throw new Error("Response status: " + status);
    }

    console.log(req.headers["hx-request"]);

    if (req.headers["hx-request"] !== "true") {
      const redirectUrl = req.headers.referer.split(req.headers.host)[1];
      return res.redirect(redirectUrl);
    }

    res.send("");
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
