const multer = require("multer");

// Centralized error handler. Any controller can `next(err)` and land here.
function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err instanceof multer.MulterError || err.message === "Only PDF files are accepted") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  res.status(status).json({ message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
