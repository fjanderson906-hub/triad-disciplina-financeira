import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();
        
        if (profile?.name) {
          setUserName(profile.name);
        } else {
          setUserName(user.email?.split("@")[0] || "Usuário");
        }
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    }
  };

  return (
    <div className="w-full bg-black border-b border-[#C0A060] p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#C0A060]">TRIAD</h1>
          <span className="text-[#D9D9D9] text-sm">| Ordem. Disciplina. Resultado.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#D9D9D9]">
            <User className="h-4 w-4" />
            <span className="text-sm">{userName}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-[#C0A060] text-[#D9D9D9] hover:bg-[#C0A060] hover:text-black"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;