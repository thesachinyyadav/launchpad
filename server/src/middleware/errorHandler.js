function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: 'route_not_found',
    message: `No route found for ${req.method} ${req.originalUrl}`,
  })
}

function errorHandler(error, req, res, next) {
  void next
  const statusCode = error.statusCode || 500

  if (process.env.NODE_ENV !== 'test') {
    console.error(error)
  }

  res.status(statusCode).json({
    ok: false,
    error: error.code || 'internal_server_error',
    message: error.message || 'Unexpected server error',
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
