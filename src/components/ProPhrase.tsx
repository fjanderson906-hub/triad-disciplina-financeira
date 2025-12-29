import { useEffect, useState } from "react";
import { getRandomProPhrase, ProPhraseCategory } from "@/lib/pro-phrases";

interface ProPhraseProps {
  category: ProPhraseCategory;
  className?: string;
}

export const ProPhrase = ({ category, className = "" }: ProPhraseProps) => {
  const [phrase, setPhrase] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setPhrase(getRandomProPhrase(category));
    
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, [category]);

  return (
    <p 
      className={`
        text-xs text-gold/60 italic tracking-wide
        transition-opacity duration-700
        ${isVisible ? "opacity-100" : "opacity-0"}
        ${className}
      `}
    >
      "{phrase}"
    </p>
  );
};
