"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user_controller");
exports.userRoutes = (0, express_1.Router)();
exports.userRoutes.get("/", (req, res) => {
    try {
        let filters = [];
        let email = req.query.email;
        let phoneNumber = req.query.phoneNumber;
        if (email !== undefined) {
            if (typeof email === 'string' && email.length > 0)
                filters.push({ field: 'email', value: email });
            else if (email.length > 0)
                filters.push({ field: 'email', value: email });
        }
        if (phoneNumber !== undefined) {
            if (typeof phoneNumber === 'string' && phoneNumber.length > 0)
                filters.push({ field: 'phoneNumber', value: phoneNumber });
            else if (phoneNumber.length > 0)
                filters.push({ field: 'phoneNumber', value: phoneNumber });
        }
        let u = (0, user_controller_1.GetUsers)(filters);
        res.status(200).send(u);
    }
    catch (error) {
        res.status(500).send({ message: "Failed to fetch data!", error: error });
    }
});
exports.userRoutes.get("/:id", (req, res) => {
    try {
        let u = (0, user_controller_1.GetUserById)(req.params.id);
        if (u)
            res.status(200).send(u);
        else
            res.status(404).send({ message: "User not found!" });
    }
    catch (error) {
        res.status(500).send({ message: "Failed to fetch data!", error: error });
    }
});
exports.userRoutes.post("/", (req, res) => {
    try {
        let uid = (0, user_controller_1.generateUID)();
        let email = req.body.email;
        email = email.toLowerCase();
        let firstName = req.body.firstName;
        firstName = (0, user_controller_1.capitalizeFirst)(firstName);
        let lastName = req.body.lastName;
        lastName = (0, user_controller_1.capitalizeFirst)(lastName);
        let phoneNumber = req.body.phoneNumber;
        let u = { _id: uid, email: email, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber };
        let validation = (0, user_controller_1.validate)(u);
        if (validation === null) {
            (0, user_controller_1.InsertUser)(u);
            res.status(200).send(u);
        }
        else
            res.status(403).send(validation);
    }
    catch (error) {
        res.status(500).send({ message: "Failed to add user!", error: error });
    }
});
exports.userRoutes.delete("/:id", (req, res) => {
    try {
        let status = (0, user_controller_1.DeleteUserById)(req.params.id);
        if (status)
            res.status(200).send(false);
        else
            res.status(404).send(true);
    }
    catch (error) {
        res.status(500).send({ message: "Failed to delete user!", error: error });
    }
});
exports.userRoutes.put("/:id", (req, res) => {
    try {
        let uid = req.params.id;
        let user = (0, user_controller_1.GetUserById)(uid);
        if (req.body.email !== undefined) {
            let email = req.body.email;
            email = email.toLowerCase();
            user.email = email;
        }
        if (req.body.firstName !== undefined) {
            let firstName = req.body.firstName;
            firstName = (0, user_controller_1.capitalizeFirst)(firstName);
            user.firstName = firstName;
        }
        if (req.body.lastName !== undefined) {
            let lastName = req.body.lastName;
            lastName = (0, user_controller_1.capitalizeFirst)(lastName);
            user.lastName = lastName;
        }
        if (req.body.phoneNumber !== undefined) {
            let phoneNumber = req.body.phoneNumber;
            user.phoneNumber = phoneNumber;
        }
        let validation = (0, user_controller_1.validate)(user);
        if (validation === null) {
            (0, user_controller_1.UpdateUserById)(uid, user);
            res.status(200).send(user);
        }
        else
            res.status(403).send(validation);
    }
    catch (error) {
        res.status(500).send({ message: "Failed to update user!", error: error });
    }
});
