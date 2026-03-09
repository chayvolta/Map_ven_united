// src/hooks/useLotFilters.js
// Custom hook for managing lot filtering logic

import { useMemo } from 'react';

/**
 * Hook to filter lots based on active filters
 * @param {array} lots - Array of all lots
 * @param {string} activeFilter - Active filter type ('all', 'hab', 'com', 'tur')
 * @param {string} selectedDesarrollo - Selected development ('all' or specific development name)
 * @returns {array} Filtered lots array
 */
export function useLotFilters(lots, activeFilter, selectedDesarrollo) {
    const filteredLots = useMemo(() => {
        if (!lots || lots.length === 0) {
            return [];
        }

        return lots.filter(item => {
            // Filter by land use type
            let typeMatch = true;
            if (activeFilter !== 'all') {
                const uso = item.properties.uso_suelo.toLowerCase();

                switch (activeFilter) {
                    case 'tur':
                        typeMatch = uso.includes('turístico') || uso.includes('hotelero');
                        break;
                    case 'com':
                        typeMatch = uso.includes('comercial') || uso.includes('mixto') || uso.includes('urbano');
                        break;
                    case 'hab':
                        typeMatch = uso.includes('residencial') || uso.includes('habitacional');
                        break;
                    default:
                        typeMatch = true;
                }
            }

            // Filter by development
            const devMatch = selectedDesarrollo === 'all' ||
                item.properties.desarrollo === selectedDesarrollo;

            return typeMatch && devMatch;
        });
    }, [lots, activeFilter, selectedDesarrollo]);

    return filteredLots;
}

/**
 * Sync filters with selected lot
 * @param {object} selectedLot - Currently selected lot
 * @returns {object} { suggestedFilter, suggestedDesarrollo }
 */
export function getSuggestedFilters(selectedLot) {
    if (!selectedLot) {
        return { suggestedFilter: null, suggestedDesarrollo: null };
    }

    const uso = selectedLot.properties.uso_suelo.toLowerCase();
    let suggestedFilter = 'all';

    if (uso.includes('turístico') || uso.includes('hotelero')) {
        suggestedFilter = 'tur';
    } else if (uso.includes('comercial') || uso.includes('mixto')) {
        suggestedFilter = 'com';
    } else if (uso.includes('residencial') || uso.includes('habitacional')) {
        suggestedFilter = 'hab';
    }

    return {
        suggestedFilter,
        suggestedDesarrollo: selectedLot.properties.desarrollo
    };
}
