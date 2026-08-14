import React, { useState, useEffect } from "react";

/**
 * Hook to check if the component has been hydrated on the client.
 * Returns false on the server and until the first client-side effect runs.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Component that only renders its children on the client after hydration.
 */
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  return hydrated ? <>{children}</> : <>{fallback}</>;
}
