# scrapbook-maker

Collect messages from lots of people and print them together as one scrapbook.

Each person's message (a name, the text, and optionally a photo) becomes an entry. You pick a page design and a paper size, and the tool lays every entry out across printable pages, starting with a cover.

## Try it

Open `index.html` in a browser. It loads 12 sample farewell messages. Pick a design and paper size, then press **Print / Save as PDF**. In the print dialog, set margins to **None** and turn on **Background graphics**.

To use your own messages, press **Load messages (.json)** and choose a file in the format below.

## Page designs

| Design | Best for | Per page |
| --- | --- | --- |
| **Kraft & Washi** | Any occasion. Notes on mixed papers taped to kraft card, names on label-maker tape, photos as polaroids. | Up to 6 notes |
| **Airmail** | Farewells and moves abroad. Each message is a typed postcard with its own stamp and postmark. | 2 postcards |
| **Keepsake** | Weddings, retirements, memorials. Centred serif type, gilt rules, arched photos, the date written out in words. | 2 messages |
| **Corkboard** | Office farewells and big groups. Sticky notes and ruled index cards pinned to a cork board. | Up to 6 notes |
| **Riso Zine** | Birthdays and celebrations. Two-colour risograph print with huge names and duotone photos. | 3 messages |
| **Notebook** | Teachers and classmates. Wide-ruled paper, each message in its own pen and handwriting. | As many as fit |

Long messages get more space automatically: a full row, a full page, or two columns, depending on the design. Text that still doesn't fit is shrunk a little. Spare space on the last page becomes blank notes, so anyone who missed the deadline can write theirs in by hand.

All designs print on A4 or US Letter.

## Message format

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
  "entries": [
    { "name": "Arjun", "message": "Lisbon is lucky. Please leave the good stapler." },
    { "name": "Tomás", "message": "Boa viagem!", "photo": "photos/tomas.jpg", "caption": "Alfama" }
  ]
}
```

Only `entries` is required, and each entry needs `name` and `message`. A blank line in a message starts a new paragraph. Photo paths are relative to `index.html`, or can be full URLs.

## How it's built

- `src/scrapbook.js` is the renderer. It loads each design's fonts, splits entries across pages, and fits text to its space.
- `templates/<design>.js` and `templates/<design>.css` define each design: its cover, how one entry looks, and how much room each entry takes.
- `samples/farewell.js` holds the sample messages. `samples/photos/` has placeholder illustrations.

To add a design, copy one of the existing pairs in `templates/`, give it a new `id`, and include both files in `index.html`.
