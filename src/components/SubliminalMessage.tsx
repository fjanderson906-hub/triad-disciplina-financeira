import { useEffect, useState } from "react";

const SUBLIMINAL_MESSAGES = [
  "O silêncio é o terreno onde o poder floresce.",
  "Fale pouco, mas observe tudo.",
  "Controle a si mesmo, e o resto se curva naturalmente.",
  "A arte da guerra começa na mente, não no campo.",
  "Quem domina as aparências, domina o destino dos outros.",
  "Jamais revele o plano — apenas os resultados.",
  "A frieza é o escudo dos que enxergam além do momento.",
  "A verdadeira sedução é o mistério de quem não precisa ser visto.",
  "Poder é disciplina disfarçada de calma.",
  "O estrategista não reage — ele antecipa.",
];

interface SubliminalMessageProps {
  position?: "top" | "bottom" | "center";
  className?: string;
}

const getRandomMessage = (): string => {
  const lastMessage = localStorage.getItem("triad-last-subliminal");
  let availableMessages = SUBLIMINAL_MESSAGES;
  
  // Avoid repeating the last message shown
  if (lastMessage) {
    availableMessages = SUBLIMINAL_MESSAGES.filter(msg => msg !== lastMessage);
  }
  
  const randomIndex = Math.floor(Math.random() * availableMessages.length);
  const selectedMessage = availableMessages[randomIndex];
  
  localStorage.setItem("triad-last-subliminal", selectedMessage);
  return selectedMessage;
};

export const SubliminalMessage = ({ 
  position = "bottom",
  className = "" 
}: SubliminalMessageProps) => {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Select a new random message on mount
    setMessage(getRandomMessage());
    
    // Fade in after a short delay
    const fadeInTimer = setTimeout(() => setIsVisible(true), 500);
    
    // Rotate message every 30 seconds
    const rotateTimer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setMessage(getRandomMessage());
        setIsVisible(true);
      }, 1000); // Wait for fade out before changing
    }, 30000); // Every 30 seconds
    
    return () => {
      clearTimeout(fadeInTimer);
      clearInterval(rotateTimer);
    };
  }, []);

  const positionClasses = {
    top: "top-8",
    bottom: "bottom-8",
    center: "top-1/2 -translate-y-1/2",
  };

  return (
    <div 
      className={`
        fixed left-0 right-0 ${positionClasses[position]} 
        px-4 pointer-events-none z-10
        transition-opacity duration-1000
        ${isVisible ? "opacity-100" : "opacity-0"}
        ${className}
      `}
    >
      <p className="
        text-center text-xs md:text-sm 
        text-gold/30 
        font-body tracking-widest 
        italic
        max-w-2xl mx-auto
      ">
        "{message}"
      </p>
    </div>
  );
};
