const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, "First name must be at least 3 characters long"]
        },
        lastname: {
            type: String,
            minlength: [3, "Last name must be at least 3 characters long"]
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: [5, "Email must be at least 5 characters long"],
        match: [/^\S+@\S+\.\S+$/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [8, "Password must be at least 8 characters long"],
    },
    socketId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    vehicle: {
        color: {
            type: String,
            required: true,
            minlength: [3, "Vehicle color must be at least 3 characters long"]
        },
        plate: {
            type: String,
            required: true,
            minlength: [3, "Vehicle plate number must be at least 3 characters long"]
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, "Vehicle capacity must be at least 1"]
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'motorcycle', 'auto'],
            default: 'car'
        }
    },

    location: {
        lat: {
            type: Number,
        },
        lng: {
            type: Number,
        }
    }
});

captainSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
        return token;
    } catch (err) {
        console.log(err);
    }
}

captainSchema.statics.hashPassword = async function (password) {
    try {
        return await bcrypt.hash(password, 10);
    } catch (err) {
        console.log(err);
    }
}

captainSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        console.log(err);
    }
}

const CaptainModel = mongoose.model('Captain', captainSchema);
module.exports = CaptainModel;