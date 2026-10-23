/*
 * Sample book: farewell messages for a colleague moving abroad.
 * Every field except `entries` is optional. Each entry needs `name` and `message`;
 * `photo` (any image URL or path), `caption` and `style` are optional. `style` makes
 * that person's page look like a message they sent (imessage, whatsapp, snapchat,
 * messenger, slack, gmail, outlook, canvas) or use another paper design. Without
 * it, the page uses the book's design. `group` puts a person into one of the
 * `groups`: everyone in a group shares a group chat page in that group's look
 * (whatsapp, discord or hike), each message under its sender's name.
 * The photos are placeholder illustrations.
 */
window.SAMPLE_BOOK = {
  title: 'Bon voyage, Maya',
  recipient: 'Maya Okafor',
  occasion: 'Farewell',
  from: 'With love from everyone at Northwind Studio',
  date: '2026-10-30',
  place: 'Lisbon',
  coverPhoto: 'samples/photos/lisbon.svg',
  coverCaption: 'Next stop: Lisbon',
  groups: [
    { id: 'studio', name: 'Studio crew', style: 'whatsapp' },
    { id: 'games', name: 'Friday night games', style: 'discord' },
  ],
  entries: [
    {
      name: 'Arjun',
      message: "Six years of sitting across from you and I still don't know how you kept a plant alive in that corner. Lisbon is lucky. Send pastéis photos, and please leave the good stapler.",
      style: 'imessage',
    },
    {
      name: 'Priya Raman',
      message: "You hired me when my portfolio was three projects and a lot of enthusiasm. You told me the work gets better when you show it to people before it feels ready, and that one sentence changed how I work. Every crit I run now, I hear you asking \"what is this for?\" before anyone says a word about colour.\n\nThank you for being patient, for being honest, and for always ordering extra fries for the table.",
    },
    {
      name: 'Tomás',
      message: "Boa viagem! You already know where to get the best bifanas because I've told you eleven times. My aunt lives in Alfama and she's expecting you for dinner. No excuses.",
      photo: 'samples/photos/lisbon.svg',
      caption: "From my aunt's window",
      style: 'whatsapp',
    },
    {
      name: 'Hannah',
      message: "To the only person who reads the whole brief. We're doomed without you. Come back and visit, often.",
      group: 'games',
    },
    {
      name: 'Dev',
      message: "Maya, I've been trying to write this for a week. When the Harbor project fell apart and the client walked, you were the one who stayed late, rebuilt the deck from nothing, and then took the whole team out for noodles like nothing had happened. I learned more from watching you that month than from any course.\n\nYou never made anyone feel small for asking a question, and you always made sure the quiet people in the room got heard. That's rarer than you think. I'm going to try to be that for the new folks.\n\nGo eat everything, learn the language badly, and send us the view from your new desk.",
      style: 'gmail',
    },
    {
      name: 'Sofia',
      message: 'Your Friday playlists got me through the rebrand. Please keep sending them. I am serious. I will pay.',
      group: 'studio',
    },
    {
      name: 'Ben & Olu',
      message: "We pooled our thoughts and came up with: thank you, we'll miss you, and the coffee machine will never be descaled again.",
      style: 'slack',
    },
    {
      name: 'Grace',
      message: 'Remember the offsite where we got lost for three hours and you walked us back with a paper map and total confidence? Best day of that year. Take that energy to Lisbon.',
      photo: 'samples/photos/offsite.svg',
      caption: 'Offsite, briefly lost',
      group: 'studio',
    },
    {
      name: 'Kenji',
      message: "Thank you for every \"have you tried it the other way round?\" It worked about 80% of the time, which is an outrageous hit rate. Enjoy the light there. Everyone says it's different.",
      style: 'outlook',
      group: 'games',
    },
    {
      name: 'Leila',
      message: "In my first week you walked me around the whole office and introduced me to everyone by what they're brilliant at. I still do that for new people. Obrigada for everything.",
      group: 'studio',
    },
    {
      name: 'Marcus',
      message: 'Karaoke night, 2024. No further comment. You owe me a rematch.',
      photo: 'samples/photos/karaoke.svg',
      caption: 'Exhibit A',
      group: 'studio',
    },
    {
      name: 'Nadia',
      message: 'Every team should have a Maya. We had one for six years and we know exactly how lucky that was. Go well.',
      group: 'games',
    },
  ],
};
