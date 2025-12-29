// Frases psicológicas para usuários PRO - frias, estratégicas, sem motivação emocional

export const PRO_PHRASES = {
  projecao: [
    "Previsibilidade é o terreno de quem antecipa.",
    "Quem calcula o tempo, não é surpreendido por ele.",
    "A clareza elimina a ilusão. Você agora vê.",
    "Projetar é controlar. O resto é reação.",
    "Tempo mapeado é vantagem acumulada.",
  ],
  ritmo: [
    "Constância detectada. Padrão consolidado.",
    "Repetição disciplinada é a base do controle.",
    "Seu ritmo fala. Você agora escuta.",
    "Disciplina gera padrão. Padrão gera previsibilidade.",
    "O que se repete, se domina.",
  ],
  decisao: [
    "Decisões estratégicas são silenciosas.",
    "Quem analisa antes, executa com precisão.",
    "A frieza precede a clareza.",
    "Sem emoção, sem erro.",
    "Calcular é vencer antes de agir.",
  ],
  cofre: [
    "O cofre guarda mais que valores — guarda disciplina.",
    "Acesso total. Responsabilidade total.",
    "Histórico completo. Visão completa.",
    "Quem controla o passado, domina o futuro.",
    "Transparência interna é poder externo.",
  ],
} as const;

export type ProPhraseCategory = keyof typeof PRO_PHRASES;

export const getRandomProPhrase = (category: ProPhraseCategory): string => {
  const phrases = PRO_PHRASES[category];
  const lastKey = `triad-last-phrase-${category}`;
  const lastPhrase = localStorage.getItem(lastKey);
  
  let availablePhrases = [...phrases];
  if (lastPhrase) {
    availablePhrases = phrases.filter(p => p !== lastPhrase);
  }
  
  const randomIndex = Math.floor(Math.random() * availablePhrases.length);
  const selectedPhrase = availablePhrases[randomIndex];
  
  localStorage.setItem(lastKey, selectedPhrase);
  return selectedPhrase;
};
