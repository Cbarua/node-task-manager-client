// Middleware to verify signed cookies
const auth = (req, res, next) => {
  const signedToken = req.signedCookies.token;
  if (!signedToken) {
    return res.status(403).redirect("login");
  }
  req.token = signedToken;
  req.axiosAuthHeader = { headers: { Authorization: "Bearer " + signedToken }};
  next();
};

module.exports = auth;
