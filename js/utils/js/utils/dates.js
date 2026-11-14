/* ========================================================================= */
/* ÖG DATES UTILS - Formateo y Manipulación de Marcas de Tiempo              */
/* ========================================================================= */

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

