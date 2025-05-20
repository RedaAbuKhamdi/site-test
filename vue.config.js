function getPublicPath() {
    switch (process.env.NODE_ENV) {
        case 'staging': return '/site-test';
        default: return '/';
    }
}

module.exports = {
    publicPath: getPublicPath()
}