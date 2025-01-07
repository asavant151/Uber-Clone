const BlacklistToken = require("../models/blacklistToken.model");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");

const registerCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyExists = await captainModel.findOne({ email });
    if (isCaptainAlreadyExists) {
        return res.status(400).json({ error: "Captain already exists" });
    }

    const hashedPassword = await captainModel.hashPassword(password);

    try {
        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        const token = await captain.generateAuthToken();
        res.status(201).json({ captain, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const captain = await captainModel.findOne({ email }).select("+password");
        if (!captain) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = await captain.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = await captain.generateAuthToken();

        res.cookie('token', token);
        res.status(200).json({ captain, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCaptainProfile = async (req, res) => {
    res.status(200).json({ captain: req.captain });
}

const logoutCaptain = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    await BlacklistToken.create({ token });
    res.clearCookie('token');
    res.status(200).json({ message: "Logout successful" });
}

module.exports = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
};