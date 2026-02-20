/**
 * Gera uma senha temporária segura
 * @param {number} length - Comprimento da senha (padrão: 12)
 * @returns {string} Senha gerada
 */
export function generateTemporaryPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';

    // Garantir pelo menos um caractere de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Preencher o restante aleatoriamente
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
