/* ========================================================================= */
/* ÖG VALIDATION UTILS - Validación de Nombres de Usuario y Entradas         */
/* ========================================================================= */

export function isValidUsername(username) {
  if (!username) return false;
  return /^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase());
}

export function isValidPassword(password) {
  if (!password) return false;
  return password.length >= 8;
}

