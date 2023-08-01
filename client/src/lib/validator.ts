export function validateEmail (email: string) {
    return email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null
}

export function validateName (name: string) {
    return name.match(/^[A-Z][a-z]+$/) !== null
}

export function validatePhone (phone: string) {
    return phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) !== null
}
