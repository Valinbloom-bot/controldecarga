import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useCompAccess() {
  const { user } = useAuth();
  const [hasComp, setHasComp] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComp = useCallback(async () => {
    if (!user) {
      setHasComp(false);
      setLoading(false);
      return;
    }
    const { data } = await supabase.rpc("current_user_has_comp_access");
    setHasComp(!!data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchComp();
  }, [fetchComp]);

  return { hasComp, loading, refetch: fetchComp };
}
