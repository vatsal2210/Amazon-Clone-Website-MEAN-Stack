module.exports = function (module, appContext) {

    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const User = module.User;
    const jwtUtil = module.jwtUtil;
    const async = appContext.async;

    app.get('/products', (req, res, next) => {
        
    });
};