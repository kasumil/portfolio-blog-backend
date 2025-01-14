const checkLoggedIn = (ctx, next) => {
  if (!JSON.parse(ctx?.header.state).user) {
    ctx.status = 401;
    return;
  }
  return next();
};

export default checkLoggedIn;
