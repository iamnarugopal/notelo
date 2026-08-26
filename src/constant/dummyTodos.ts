import { Note } from "@/types/note";

const dummyNotes = [
  {
    title: "Ideas for the weekend",
    content:
      "Try the new farmers market, finish the book on the nightstand, and take a long walk before dinner.",
  },
  {
    title: "Grocery list",
    content:
      "Eggs, sourdough bread, spinach, tomatoes, coffee beans, oranges, and dark chocolate.",
  },
  {
    title: "Project launch checklist",
    content:
      "Confirm the release notes, run the final smoke test, check the analytics event names, and send the customer update.",
  },
  {
    title: "Book recommendations",
    content:
      "Look for a thoughtful history book, something light for travel, and the latest novel from the author recommended by Maya.",
  },
  {
    title: "Dentist appointment",
    content:
      "Appointment on Thursday at 10:30 AM. Bring the insurance card and arrive ten minutes early.",
  },
  {
    title: "Morning routine",
    content:
      "Drink water, stretch for five minutes, review the calendar, and choose the three most important tasks.",
  },
  {
    title: "Kitchen renovation notes",
    content:
      "Compare cabinet samples in natural oak and white. Ask about delivery times and measure the wall beside the window.",
  },
  {
    title: "Questions for the team",
    content:
      "Which metrics define success for this release? Do we need a migration plan? Who owns the support documentation?",
  },
  {
    title: "Travel packing list",
    content:
      "Passport, chargers, headphones, comfortable shoes, light jacket, medication, and a small notebook.",
  },
  {
    title: "Dinner recipe",
    content:
      "Roast chickpeas with cumin and paprika, serve over lemon rice, then add cucumber, herbs, and yogurt sauce.",
  },
  {
    title: "Things to fix at home",
    content:
      "Replace the hallway bulb, tighten the loose cabinet handle, clean the balcony drain, and test the smoke alarm.",
  },
  {
    title: "Design review feedback",
    content:
      "The new layout feels clearer. Increase the contrast on secondary text, keep the action close to the title, and check the empty state on a small screen.",
  },
  {
    title: "Monthly budget",
    content:
      "Review subscriptions, move the travel savings transfer to payday, and set aside the annual insurance payment.",
  },
  {
    title: "Garden plans",
    content:
      "Plant basil and mint near the kitchen window. The tomatoes need a taller support and more afternoon sun.",
  },
  {
    title: "Podcast queue",
    content:
      "Listen to the interview about urban design, the episode on sleep science, and the short series about early computing.",
  },
  {
    title: "Quarterly goals",
    content:
      "Ship the notes redesign, improve startup time, document the storage layer, and make space for one experimental feature.",
  },
  {
    title: "Gift ideas",
    content:
      "A ceramic travel mug, a small framed print, a cooking class voucher, or the blue scarf they liked in the window.",
  },
  {
    title: "Learning plan",
    content:
      "Complete the TypeScript module, build one small SQLite experiment, and write down the questions that come up.",
  },
  {
    title: "Weekend chores",
    content:
      "Wash the bedding, back up the laptop, return the library books, and clean out the email inbox.",
  },
  {
    title: "Reflection",
    content:
      "The week felt busy but focused. The best progress came from finishing one small task before opening another.",
  },
];

const now = Date.now();

export const dummyTodos: Note[] = dummyNotes.map((note, index) => {
  const createdAt = new Date(now - index * 36 * 60 * 60 * 1000).toISOString();

  return {
    ...note,
    id: index + 1,
    created_at: createdAt,
    updated_at: createdAt,
  };
});
