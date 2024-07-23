function route(){
    const route = {
        "/":"index",
        "/index":"index.ejs",
        "/login":"login.ejs",
        "/signUp":"signUp.ejs",
        "/poster":"new_poster.ejs",
        "/post":"post.ejs",
    }
    return route;
}

module.exports = route();
