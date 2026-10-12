// An error we throw on purpose (404, 409, 400...). The error handler turns it into JSON.
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }
}

module.exports = AppError;
