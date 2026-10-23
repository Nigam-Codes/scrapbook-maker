# scrapbook-maker

Collect messages from lots of people and print them together as one scrapbook.

Each person's message (a name, the text, and optionally a photo) gets a printable page of its own. You pick a page design and a paper size, and the tool makes a cover followed by one page per person.

## Use it

1. Get the files: on GitHub, choose **Code → Download ZIP**, then unzip it. (Or clone the repository.)
2. Open `index.html` in Chrome, Edge, Safari or Firefox. You need to be online the first time so the fonts can load.
3. Fill in the cover on the left: title, who it's for, occasion, how it's signed, and the date. A cover photo is optional.
4. Add each person: their name, their message, and a photo if you have one. Use the arrows to change the order. The preview on the right updates as you type, one page per person.
5. Optionally choose **Looks like** on a person's card to make their page look like a text, chat or email they sent, or put several people together in a **group chat** (see below).
6. Pick a design and paper size at the top. Untick **Cover page** to leave the cover out.
7. Press **Print / Save as PDF**. In the print dialog, set margins to **None** and turn on **Background graphics**.

Everything you type is saved in that browser automatically. **Save to file** keeps a copy you can open later or on another computer with **Open file**. **Load example** fills the book with 12 sample messages so you can try the designs.

## Page designs

| Design | Best for | Each person's page |
| --- | --- | --- |
| **Kraft & Washi** | Any occasion | A big note on its own scrap of paper, taped to kraft card, signed on label-maker tape. Photos become polaroids. |
| **Airmail** | Farewells, moves abroad | A typed airmail letter with its own stamp and postmark, signed by hand. |
| **Keepsake** | Weddings, retirements, memorials | The message centred in serif type inside a gilt border, photos in an arched frame. |
| **Corkboard** | Office farewells, big groups | A big sticky note pinned to a framed cork board, signed in marker. |
| **Riso Zine** | Birthdays, celebrations | The person's name printed huge in pink and blue, with duotone photos. |
| **Notebook** | Teachers, classmates, kids | A wide-ruled page, written on the lines in its own pen and handwriting. |

Each message is sized to fill its page: short ones are written large, long ones smaller.

All designs print on A4 or US Letter.

## Message looks

Any person's page can look like a message they sent instead of the book's design. Choose **Looks like** on their card, or use **Make every page look like** to set everyone at once. A person's page can also use any of the six paper designs above. The cover always uses the book's design.

To mix things up, press **Shuffle looks** for a random mix of every look, or choose **Random message apps** or **Random paper designs** from **Make every page look like**. Looks are dealt like cards: each one is used before any repeats, and the same look never lands on two pages in a row. Shuffle again until you like it, then change any single page by hand.

| Look | Their page shows |
| --- | --- |
| **iMessage** | A phone screen with their message in grey bubbles, their initials and name at the top. |
| **WhatsApp** | A phone screen with white chat bubbles on the beige wallpaper, under the green header with their name. |
| **Snapchat** | A phone chat screen with their name in blue capitals above their messages, each marked with a blue line. |
| **Messenger** | A phone chat screen with grey bubbles beside their small avatar, and blue icons. |
| **Slack** | A direct message in a desktop chat window: their avatar, name and time above the message. |
| **Discord** | A dark desktop chat: their avatar, name and timestamp above the message. |
| **Hike** | A phone chat under a bright blue header, with rounded white bubbles. |
| **Gmail** | An email open in the inbox: the book's title as the subject, their name and letter avatar, "to me". |
| **Outlook** | An email in the reading pane: subject, their initials, "To:" the recipient. |
| **Canvas Inbox** | A message in the Canvas course inbox: subject, their initials and name "to" the recipient, with a Reply button. |

Every look shows the message arriving on the recipient's screen, on the book's date, with each person at a different time of day. Photos appear the way that app shows them, with the caption as a message or label. The looks are drawn from each app's general layout, colours and type; no logos are used, and the app names belong to their owners.

## Group chats

Several people can share one page as a group chat, with each person's message arriving on its own under their name, avatar and a time a few minutes after the last.

1. In **Group chats**, press **New group chat**, give it a name (such as "Design team") and choose its look: **WhatsApp**, **Discord** or **Hike**.
2. On each person's card, choose that group under **Group chat**.

The group's page goes where its first member is in the list, and its members appear in list order. A person in a group keeps their own message and photo; their **Looks like** choice is set aside while they're in it. The recipient counts as a member too ("…, You" on WhatsApp, the member list on Discord, "N members" on Hike).

If a group has too much to fit on one page at a readable size, the chat continues on the next page, split as evenly as possible. Removing a group gives its people their own pages again.

## Saved file format

**Save to file** writes a JSON file like this. You don't need to write it by hand, but you can.

```json
{
  "title": "Bon voyage, Maya",
  "recipient": "Maya Okafor",
  "occasion": "Farewell",
  "from": "With love from everyone at Northwind Studio",
  "date": "2026-10-30",
  "place": "Lisbon",
  "coverPhoto": "photos/cover.jpg",
  "coverCaption": "Next stop: Lisbon",
  "groups": [
    { "id": "studio", "name": "Studio crew", "style": "whatsapp" }
  ],
  "entries": [
    { "name": "Arjun", "message": "Lisbon is lucky. Please leave the good stapler." },
    { "name": "Tomás", "message": "Boa viagem!", "photo": "photos/tomas.jpg", "caption": "Alfama", "style": "whatsapp" },
    { "name": "Sofia", "message": "Keep sending the playlists.", "group": "studio" }
  ]
}
```

Only `entries` is required, and each entry needs `name` and `message`. `style` is a message look (`imessage`, `whatsapp`, `snapchat`, `messenger`, `slack`, `discord`, `hike`, `gmail`, `outlook`, `canvas`) or a paper design (`kraft`, `airmail`, `keepsake`, `corkboard`, `riso`, `notebook`); leave it out to use the book's design. `group` is the `id` of one of the `groups`, whose `style` is `whatsapp`, `discord` or `hike`. A blank line in a message starts a new paragraph. Photos added in the editor are stored inside the file; a photo can also be a path relative to `index.html` or a full URL.

## How it's built

- `index.html`, `src/editor.js` and `src/editor.css` are the editor: the form, the live preview, saving, and printing.
- `src/scrapbook.js` is the renderer. It loads each design's fonts, makes one page per person (or per group chat, split across pages when needed), and sizes each message to fill its page.
- `templates/<design>.js` and `templates/<design>.css` define each design: its cover and how one person's page looks.
- `templates/messages.js` and `templates/messages.css` define the message looks. They have no cover and are picked per person. Looks with a `group()` function can also draw a group chat.
- `samples/farewell.js` holds the sample messages. `samples/photos/` has placeholder illustrations.

To add a design, copy one of the existing pairs in `templates/`, give it a new `id`, and include both files in `index.html`.
