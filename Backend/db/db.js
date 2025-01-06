const mongoose = require('mongoose');
const url = process.env.MONGO_URL;

function connectToDb() {
    mongoose.connect(url)
        .then(() => console.log("Connected to DB"))
        .catch((err) => {
            console.log(err);
        });
}

module.exports = connectToDb;