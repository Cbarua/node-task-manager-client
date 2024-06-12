const express = require("express");
const axios = require("axios");
const auth = require("../middlewares/auth");

const api = process.env.API || "http://localhost:3000";

const router = express.Router();
axios.defaults.baseURL = api;

router.get("/", auth, async (req, res) => {
  try {
    const messages = {
      loggedIn: "Succesfully logged in!",
      signedup: "Signed up succesfully!",
      error: "Something went wrong",
    };
    const templateData = { tasks: [], message: "" };

    const query = "?sortBy=createdAt:desc";
    const { data } = await axios.get("/tasks" + query, req.axiosAuthHeader);
    templateData.tasks = data;
    templateData.message = messages[Object.keys(req.query)[0]];

    res.render("index", { ...templateData });
  } catch (error) {
    console.error(error.message);
    res.render("index", { error: "Something went wrong" });
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const { data } = await axios.post("/users/login", req.body);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: true,
      signed: true,
      expires: expirationDate,
    }); // Secure flag for HTTPS

    res.redirect("/?loggedIn");
  } catch (error) {
    const { message, response } = error;
    console.error(message);
    res.render("login", { error: response.data.message });
  }
});

router.get("/signup", (req, res) => {
  try {
    const exampleUser = {
      name: "something",
      email: "abc@xyz.com",
      gender: "male",
      password: "hEllo_34",
    };
    res.render("signup", {
      ...exampleUser,
      dob: new Date().toISOString().slice(0, 10),
    });
  } catch (error) {
    const { message } = error;
    console.error(message);
    res.render("signup", { message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { data } = await axios.post("/users", req.body);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: true,
      signed: true,
      expires: expirationDate,
    });

    res.redirect("/?signedup");
  } catch (error) {
    const { message } = error;
    console.error(message);
    res.render("signup", { message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const { data } = await axios.get("/users/me", req.axiosAuthHeader);

    const { name, email, gender, dob } = data;

    res.render("me", { name, email, gender, dob });
  } catch (error) {
    console.error(error.message);
    res.redirect("/?error");
  }
});

router.post("/me", auth, async (req, res) => {
  try {
    if (req.body.password === '') {
      delete req.body.password
    }

    const { data } = await axios.patch(
      "/users/me",
      req.body,
      req.axiosAuthHeader,
    );

    const { name, email, gender, dob } = data;

    res.render("me", { name, email, gender, dob });
  } catch (error) {
    console.error(error.message);
    res.render("me", { error: "Something went wrong" });
  }
});

router.get("/logout", auth, async (req, res) => {
  try {
    const { status } = await axios.post(
      "/users/logoutall",
      {},
      req.axiosAuthHeader,
    );

    if (status !== 200) throw new Error("Response status: " + status);

    res.clearCookie("token", { path: "/" });
    res.redirect("/login");
  } catch (error) {
    console.error(error.message);
    res.render("me", { error: "Something went wrong" });
  }
});

module.exports = router;
