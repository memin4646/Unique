export const isValidLuhn = (cardNumber: string): boolean => {
    // Remove all non-digits
    const sanitized = cardNumber.replace(/\D/g, "");

    // Check basic length (usually 13-19 digits)
    if (sanitized.length < 13 || sanitized.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;

    // Iterate from right to left
    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i));

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};
