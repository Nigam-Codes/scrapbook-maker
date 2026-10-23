# scrapbook-maker

Collect messages from lots of people and print them together as one scrapbook.

Each person's message (a name, the text, and optionally a photo) gets a printable page of its own. You pick a page design and a paper size, and the tool makes a cover followed by one page per person.

## Try it

Open `index.html` in a browser. It loads 12 sample farewell messages. Pick a design and paper size (untick **Cover page** to leave the cover out), then press **Print / Save as PDF**. In the print dialog, set margins to **None** and turn on **Background graphics**.

To use your own messages, press **Load messages (.json)** and choose a file in the format below.

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

- `src/scrapbook.js` is the renderer. It loads each design's fonts, makes one page per person, and sizes each message to fill its page.
- `templates/<design>.js` and `templates/<design>.css` define each design: its cover and how one person's page looks.
- `samples/farewell.js` holds the sample messages. `samples/photos/` has placeholder illustrations.

To add a design, copy one of the existing pairs in `templates/`, give it a new `id`, and include both files in `index.html`.
