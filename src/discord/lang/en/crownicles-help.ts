import type { CommandNode } from '../types.js';

export const crowniclesHelp = {
  description: 'Browse Crownicles game data (events and their outcomes).',
  messages: {
    categoryPlaceholder: 'Choose a category',
    loading: 'Loading Crownicles data…',
    loadError: 'Could not load Crownicles data. Please try again later.',
    outcomesTitle: 'Choices and outcomes',
    autoOutcome: 'No answer',
    labels: {
      xp: 'XP',
      points: 'points',
      money: 'money',
      health: 'HP',
      energy: 'energy',
      gems: 'gems',
      tokens: 'tokens',
      item: 'Item',
      pet: 'Pet',
      timeLost: 'lost',
    },
    minutes: (count: number): string => `${count} min`,
    hours: (count: number): string => `${count} h`,
    hoursMinutes: (hours: number, minutes: number): string =>
      `${hours} h ${minutes} min`,

    home: {
      name: 'Home',
      description: 'The help center entry point',
      title: 'Crownicles help center',
      welcome:
        'Pick a category below to explore the game. For now you can browse events and the rewards their choices give.',
    },

    events: {
      name: 'Events',
      description: 'Events browsable by location',
      intro:
        'Pick a location, then an event to see what its choices can lead to.',
      noLocations: 'No location has any event yet.',
      locationPlaceholder: 'Choose a location',
      locationsPageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      previous: 'Previous',
      next: 'Next',
      selectedLocation: (name: string): string => `Location: ${name}`,
      noEvents: 'No event is available at this location.',
      eventPlaceholder: 'Choose an event',
      backToLocations: 'Back to locations',
      backToEvents: 'Back to events',
    },

    special: {
      name: 'Special events',
      description: 'Seasonal events with no fixed location',
      intro:
        'Location-less events (Halloween, Christmas, April Fools…). Pick one to see its outcomes.',
      noEvents: 'No special event is available.',
      eventPlaceholder: 'Choose an event',
      backToEvents: 'Back to events',
    },
  },
} as const satisfies CommandNode;
