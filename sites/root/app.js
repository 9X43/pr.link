module.exports = {
  folder: "root",
  path: "",
  route: app => {
    app.get("/", (req, res, next) => {
      res.sendFile("index.html");
    });
  }
};
