/**
 * Validators for frontend
 */

/**
 * Validate email
 * @param email E-mail
 * @returns `true` - OK | `false` - Wrong e-mail format
 */
export function validateEmail (email: string) {
    return email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null
}

/**
 * Validate name
 * @param name Name
 * @returns `true` - OK | `false` - Wrong name format
 */
export function validateName (name: string) {
    return name.match(/^[A-Z][a-z]+$/) !== null
}

/**
 * Validate phone
 * @param phone Phone
 * @returns `true` - OK | `false` - Wrong phone format
 */
export function validatePhone (phone: string) {
    return phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) !== null
}
