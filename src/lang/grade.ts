import { md } from "@/lib/markdown.js";

export const grade = {
  commandDescription: 'Affiche votre niveau de permission sur le bot.',
  description: {
    explication:
      "Votre grade détermine votre niveau de permission sur le bot, celui-ci détermine l'accès à certaines commandes et l'accès à diverses fonctionnalités supplémentaires.",
    userGrade: (userGrade: string) => `${md.bold('Grade actuel :')} ${userGrade}`,
    gradeRank: (gradeRank: number) => `${md.bold('Niveau de permission :')} ${gradeRank}`,
  },
} as const;
