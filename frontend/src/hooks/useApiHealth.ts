import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

export function useApiHealth() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const ok = await checkHealth();
      if (mounted) setHealthy(ok);
    };
    tick();
    const iv = setInterval(tick, 30_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);
  return healthy;
}
