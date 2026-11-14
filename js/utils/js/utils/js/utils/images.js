/* ========================================================================= */
/* ÖG IMAGES UTILS - Generación de Visitor ID y Utilidades Visuales          */
/* ========================================================================= */

export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('og_visitor_uuid');
  if (!visitorId) {
    visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('og_visitor_uuid', visitorId);
  }
  return visitorId;
}

