import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanType = "BASICO" | "PRO";

export interface PlanFeatures {
  canViewProjection: boolean;
  canViewPatternDetection: boolean;
  canCreateMultipleGoals: boolean;
  canViewFullHistory: boolean;
  canViewRitmo: boolean;
  canViewStrategicDecision: boolean;
}

const FREE_FEATURES: PlanFeatures = {
  canViewProjection: false,
  canViewPatternDetection: false,
  canCreateMultipleGoals: false,
  canViewFullHistory: false,
  canViewRitmo: false,
  canViewStrategicDecision: false,
};

const PRO_FEATURES: PlanFeatures = {
  canViewProjection: true,
  canViewPatternDetection: true,
  canCreateMultipleGoals: true,
  canViewFullHistory: true,
  canViewRitmo: true,
  canViewStrategicDecision: true,
};

export const usePlan = () => {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkPlanStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Check is_pro field in profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_pro")
          .eq("id", user.id)
          .single();

        if (profile?.is_pro) {
          setIsPro(true);
        }
      } catch (error) {
        console.error("Error checking plan status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPlanStatus();
  }, []);

  const features: PlanFeatures = isPro ? PRO_FEATURES : FREE_FEATURES;
  const planName: PlanType = isPro ? "PRO" : "BASICO";

  return {
    isPro,
    isLoading,
    userId,
    planName,
    features,
  };
};
