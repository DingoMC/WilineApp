/**
 * This file contains endpoints to /users
 * Bad requests are standarized to contain error data in form {message: string}
 */

import { Router } from "express";
import { DeleteUserById, GetUserById, GetUsers, InsertUser, UpdateUserById, capitalizeFirst, generateUID, validate } from "../controllers/user_controller";
import User from "../models/user";

export const userRoutes = Router()

// GET /users
userRoutes.get("/", (req, res) => {
    try {
        let filters = [] // Filter Array
        // Get params from query
        let email : string | string[] = req.query.email as string | string[]
        let phoneNumber : string | string[] = req.query.phoneNumber as string | string[]
        // Add params to filter list
        if (email !== undefined) {
            if (typeof email === 'string' && email.length > 0) filters.push({field: 'email', value: email})
            else if (email.length > 0) filters.push({field: 'email', value: email})
        }
        if (phoneNumber !== undefined) {
            if (typeof phoneNumber === 'string' && phoneNumber.length > 0) filters.push({field: 'phoneNumber', value: phoneNumber})
            else if (phoneNumber.length > 0) filters.push({field: 'phoneNumber', value: phoneNumber})
        }
        let u = GetUsers(filters) // Fetch users
        res.status(200).send(u)
    }
    catch (error) {
        res.status(500).send({message: "Failed to fetch data!"})
    }
})

// GET /users/{id}
userRoutes.get("/:id", (req, res) => {
    try {
        let u = GetUserById(req.params.id)
        if (u) res.status(200).send(u)
        else res.status(404).send({message: "User not found!"})
    }
    catch (error) {
        res.status(500).send({message: "Failed to fetch data!"})
    }
})

// POST /users
userRoutes.post("/", (req, res) => {
    try {
        let uid : string = generateUID() // Generate unique Hex uid
        // Gather data from request body and correct it (needed only when using the endpoint directly)
        let email : string = req.body.email
        email = email.toLowerCase()
        let firstName : string = req.body.firstName
        firstName = capitalizeFirst(firstName)
        let lastName : string = req.body.lastName
        lastName = capitalizeFirst(lastName)
        let phoneNumber : string = req.body.phoneNumber
        let u : User = {_id: uid, email: email, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber}
        // Backend validation (needed only when using the endpoint directly)
        let validation = validate(u)
        if (validation === null) {
            InsertUser(u)
            res.status(200).send(u)
        }
        else res.status(403).send(validation)
    }
    catch (error) {
        res.status(500).send({message: "Failed to add user!"})
    }
})

// DELETE /users/{id}
userRoutes.delete("/:id", (req, res) => {
    try {
        let status = DeleteUserById(req.params.id)
        if (status) res.status(200).send(false)
        else res.status(404).send({message: "User not found!"})
    }
    catch (error) {
        res.status(500).send({message: "Failed to delete user!"})
    }
})

// PUT /users/{id}
userRoutes.put("/:id", (req, res) => {
    try {
        let uid : string = req.params.id
        let user : User = GetUserById(uid)
        // Gather data from request body and correct it (needed only when using the endpoint directly)
        if (req.body.email !== undefined) {
            let email : string = req.body.email
            email = email.toLowerCase()
            user.email = email
        }
        if (req.body.firstName !== undefined) {
            let firstName : string = req.body.firstName
            firstName = capitalizeFirst(firstName)
            user.firstName = firstName
        }
        if (req.body.lastName !== undefined) {
            let lastName : string = req.body.lastName
            lastName = capitalizeFirst(lastName)
            user.lastName = lastName
        }
        if (req.body.phoneNumber !== undefined) {
            let phoneNumber : string = req.body.phoneNumber
            user.phoneNumber = phoneNumber
        }
        // Backend validation (needed only when using the endpoint directly)
        let validation = validate(user)
        if (validation === null) {
            UpdateUserById(uid, user)
            res.status(200).send(user)
        }
        else res.status(403).send(validation)
    }
    catch (error) {
        res.status(500).send({message: "Failed to update user!"})
    }
})
