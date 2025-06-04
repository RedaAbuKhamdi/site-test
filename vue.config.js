function getPublicPath() {
    switch (process.env.NODE_ENV) {
        case 'staging': return process.env.LANGUAGE && process.env.LANGUAGE === "ru" ?  "/ru-site-test" : "/site-test";
        default: return '/';
    }
}

module.exports = {
    publicPath: getPublicPath()
}