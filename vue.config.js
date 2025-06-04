function getPublicPath() {
    switch (process.env.NODE_ENV) {
        case 'staging': return process.env.VUE_APP_LANGUAGE && process.env.VUE_APP_LANGUAGE === "ru" ?  "/ru-site-test" : "/site-test";
        default: return '/';
    }
}

module.exports = {
    publicPath: getPublicPath()
}