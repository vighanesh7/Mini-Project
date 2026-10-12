// Central error handler: every error ends up here and becomes a consistent JSON reply.
// Stack traces and SQL details are logged on the server only, never sent to the client.
const CONNECTION_ERRORS = /^Sequelize(Connection|Host|AccessDenied|InvalidConnection)/;

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  let errors;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    const key = /for key '(.+?)'/.exec(err.parent?.sqlMessage || '');
    const field = key ? key[1].split('.').pop() : 'value';
    message = `A record with this ${field} already exists`;
  } else if (err.name === 'SequelizeValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 409;
    message = 'This record is linked to other records, or points to a record that does not exist';
  } else if (err.parent?.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    status = 400;
    message = 'Value rejected by a database constraint (price and stock cannot be negative)';
  } else if (err.parent?.code === 'ER_NO_SUCH_TABLE') {
    status = 500;
    message = 'Database tables not found. Run the migrations first: npm run migrate';
  } else if (CONNECTION_ERRORS.test(err.name || '')) {
    status = 503;
    message = 'Database is unavailable. Check that MySQL is running and the .env settings are correct';
  } else if (!err.isOperational) {
    console.error(err); // full details stay in the server console
    status = 500;
    message = 'Something went wrong on the server';
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  res.status(status).json(body);
};
