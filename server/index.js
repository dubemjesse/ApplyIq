require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { startScheduledJobs } = require("./services/scheduler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ApplyIQ server listening on http://localhost:${PORT}`);
  startScheduledJobs();
});

module.exports = app;
