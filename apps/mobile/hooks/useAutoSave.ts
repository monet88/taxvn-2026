import { useEffect, useRef } from 'react';
import { useHistoryStore, PendingCalculation } from '../stores/useHistoryStore';

interface AutoSaveConfig {
  toolId: string;
  toolName: string;
  inputs: any;
  results: any;
  debounceMs?: number;
  taxCoreVersion?: string;
  enabled?: boolean;
}

/**
 * Debounced hook to queue a save to the history store whenever inputs/results change.
 */
export function useAutoSave({
  toolId,
  toolName,
  inputs,
  results,
  debounceMs = 5000,
  taxCoreVersion = '1.0.0',
  enabled = true,
}: AutoSaveConfig) {
  const queueSave = useHistoryStore((state) => state.queueSave);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // We keep a ref to the latest data so we can save it on unmount
  const latestDataRef = useRef({ inputs, results });

  useEffect(() => {
    latestDataRef.current = { inputs, results };
  }, [inputs, results]);

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Only save if we have meaningful results
      if (results && Object.keys(results).length > 0) {
        queueSave({
          tool_name: toolName,
          input_json: inputs,
          result_json: results,
          snapshot_version: 1,
          tax_core_version: taxCoreVersion,
        });
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputs, results, debounceMs, enabled, toolName, taxCoreVersion, queueSave]);

  // Save dynamically on unmount if it was un-saved due to navigation
  useEffect(() => {
    return () => {
      if (enabled && latestDataRef.current.results && Object.keys(latestDataRef.current.results).length > 0) {
        // Here we clear the main timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Force an immediate save
        queueSave({
          tool_name: toolName,
          input_json: latestDataRef.current.inputs,
          result_json: latestDataRef.current.results,
          snapshot_version: 1,
          tax_core_version: taxCoreVersion,
        });
      }
    };
  }, []); // Run unmount only once
}
