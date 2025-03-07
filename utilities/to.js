function to(promise) {
    return promise.then(data => {
        return data;
    })
    .catch(err => {
        const data = {};
        data.errors = err;
        console.log("Console errors (to.js): " + err);
        return data;
    });
}

module.exports = to;  // Export function using CommonJS
