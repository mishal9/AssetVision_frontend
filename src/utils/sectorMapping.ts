/**
 * Sector name mapping utilities
 * Handles consolidation of similar sector names from different data sources
 */

// Map similar sector names to standardized names
const SECTOR_NAME_MAPPING: { [key: string]: string } = {
  'tech': 'technology',
  'financial': 'financials',
  'consumer': 'consumer_cyclical',
  'industrial': 'industrials',
  'material': 'materials',
  'healthcare': 'healthcare',
  'utilities': 'utilities',
  'energy': 'energy',
  'real estate': 'real_estate',
  'communication': 'communication_services',
  'consumer defensive': 'consumer_defensive',
  'consumer cyclical': 'consumer_cyclical',
  'communication services': 'communication_services'
};

/**
 * Normalize sector name to a standardized format
 * @param name - The sector name to normalize
 * @returns The normalized sector name
 */
export const normalizeSectorName = (name: string): string => {
  const lowerName = name.toLowerCase().trim();
  return SECTOR_NAME_MAPPING[lowerName] || lowerName;
};

/**
 * Group items by normalized sector name, consolidating similar sectors
 * @param items - Array of items with sector names
 * @returns Array of grouped items with consolidated sector names
 */
export const groupSectorItems = <T extends { name: string; currentAllocation: number; targetAllocation: number; absoluteDrift: number; relativeDrift: number }>(items: T[]) => {
  const groupedItems = items.reduce((acc, item) => {
    const normalizedName = normalizeSectorName(item.name);
    
    if (!acc[normalizedName]) {
      acc[normalizedName] = {
        name: item.name,
        currentAllocation: 0,
        targetAllocation: 0,
        absoluteDrift: 0,
        relativeDrift: 0,
        count: 0
      };
    }
    
    // Sum allocations and drifts
    acc[normalizedName].currentAllocation += item.currentAllocation;
    acc[normalizedName].targetAllocation += item.targetAllocation;
    acc[normalizedName].absoluteDrift += item.absoluteDrift;
    acc[normalizedName].count += 1;
    
    // Use the longest name for display (e.g., "Technology" over "Tech")
    if (item.name.length > acc[normalizedName].name.length) {
      acc[normalizedName].name = item.name;
    }
    
    return acc;
  }, {} as { [key: string]: any });

  // Calculate average relative drift for grouped items
  Object.values(groupedItems).forEach((item: any) => {
    if (item.targetAllocation > 0) {
      item.relativeDrift = (item.absoluteDrift / item.targetAllocation) * 100;
    }
  });

  return Object.values(groupedItems);
};

/**
 * Get all sector name mappings
 * @returns Object mapping lowercase sector names to standardized names
 */
export const getSectorNameMapping = (): { [key: string]: string } => {
  return { ...SECTOR_NAME_MAPPING };
};

/**
 * Check if two sector names should be considered the same
 * @param name1 - First sector name
 * @param name2 - Second sector name
 * @returns True if the names represent the same sector
 */
export const isSameSector = (name1: string, name2: string): boolean => {
  return normalizeSectorName(name1) === normalizeSectorName(name2);
}; 