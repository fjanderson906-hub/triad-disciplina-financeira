import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  isSubscribed: boolean;
  planType: "mensal" | "anual" | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    planType: null,
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState({
        isSubscribed: data.subscribed || false,
        planType: data.plan_type || null,
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    // Check subscription every minute
    const interval = setInterval(checkSubscription, 60000);

    // Also check on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  return {
    ...state,
    refreshSubscription: checkSubscription,
  };
};
