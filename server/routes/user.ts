import { Router } from "express";
import { DeleteUserById, GetUserById, GetUsers, InsertUser, UpdateUserById, capitalizeFirst, generateUID, validate } from "../controllers/user_controller";
import User from "../models/user";

export const userRoutes = Router()

userRoutes.get("/", (req, res) => {
    try {
        let filters = []
        let email : string | string[] = req.query.email as string | string[]
        let phoneNumber : string | string[] = req.query.phoneNumber as string | string[]
        if (email !== undefined) {
            if (typeof email === 'string' && email.length > 0) filters.push({field: 'email', value: email})
            else if (email.length > 0) filters.push({field: 'email', value: email})
        }
        if (phoneNumber !== undefined) {
            if (typeof phoneNumber === 'string' && phoneNumber.length > 0) filters.push({field: 'phoneNumber', value: phoneNumber})
            else if (phoneNumber.length > 0) filters.push({field: 'phoneNumber', value: phoneNumber})
        }
        let u = GetUsers(filters)
        res.status(200).send(u)
    }
    catch (error) {
        res.status(500).send({message: "Failed to fetch data!"})
    }
})

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

userRoutes.post("/", (req, res) => {
    try {
        let uid : string = generateUID()
        let email : string = req.body.email
        email = email.toLowerCase()
        let firstName : string = req.body.firstName
        firstName = capitalizeFirst(firstName)
        let lastName : string = req.body.lastName
        lastName = capitalizeFirst(lastName)
        let phoneNumber : string = req.body.phoneNumber
        let u : User = {_id: uid, email: email, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber}
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

userRoutes.put("/:id", (req, res) => {
    try {
        let uid : string = req.params.id
        let user : User = GetUserById(uid)
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
