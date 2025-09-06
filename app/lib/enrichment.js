import lookup from '../medicineLookup.json';

// Create an efficient Map for quick lookups, ignoring case.
const canonical = s => s?.trim().toLowerCase();
const medicineIndex = new Map(lookup.map(m => [canonical(m.brand), m]));

/**
 * Enriches a raw disposal document with metadata like category and manufacturer.
 * This function works in memory and does not alter the database document.
 * @param {object} disposal - A raw disposal object from Mongoose (.lean()).
 * @returns {object} The disposal object with enriched items.
 */
export function enrichDisposal(disposal) {
  return {
    ...disposal,
    items: disposal.items.map(item => {
      // Find metadata by looking up the brand name (or the medicine name as a fallback)
      const meta = medicineIndex.get(canonical(item.brand)) || medicineIndex.get(canonical(item.medicineName));
      // Merge the found metadata (category, manufacturer, etc.) into the item
      return { ...item, ...meta };
    })
  };
}
