// src/hooks/useExchangeRates.js
// Custom hook for managing exchange rates from Banco de México

import { useEffect, useState } from 'react';
import { getCurrentRates } from '../utils/fetchRates';

// Fallback values (same as in fetchRates.js) - only used for initial state
const FALLBACK_USD = getCurrentRates.rates?.usd;
const FALLBACK_EUR = getCurrentRates.rates?.eur;

/**
 * Hook to fetch and manage exchange rates
 * Exchange rates are fetched from Banco de México API (banxico.org.mx)
 * @param {number} refreshInterval - Interval in milliseconds to refresh rates (default: 12 hours)
 * @returns {object} { rates, loading, error, source }
 */
export function useExchangeRates(refreshInterval = 12 * 60 * 60 * 1000) {
  const [rates, setRates] = useState({
    usd: FALLBACK_USD,
    eur: FALLBACK_EUR,
    source: 'initializing',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);

        const fresh = await getCurrentRates();

        if (mounted) {
          setRates(fresh);
          setLoading(false);
        }
      } catch (e) {
        console.error('❌ Error fetching exchange rates:', e);
        if (mounted) {
          setError(e.message);
          setLoading(false);
          // Keep using fallback rates on error
        }
      }
    };

    // Initial fetch
    fetchRates();

    // Set up interval for periodic refresh
    const interval = setInterval(fetchRates, refreshInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return { rates, loading, error, source: rates.source };
}
