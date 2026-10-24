
import { NextResponse } from "next/server";

const CHANNELS = [
  {
    id: "ert1",
    name: "ERT1",
    url: "https://www.ert.gr/tv/program/ert1/",
  },
  {
    id: "ert2",
    name: "ERT2 Sport",
    url: "https://www.ert.gr/tv/program/ert2/",
  },
  {
    id: "ert3",
    name: "ERT3",
    url: "https://www.ert.gr/tv/program/ert3/",
  },
];

type Programme = {
  title: string;
  start: string;
  end: string;
  category: string;
  episode: string;
  description: string;
};

function addDays(date: string, amount: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(
    Date.UTC(year, month - 1, day + amount)
  );

  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, "0"),
    String(result.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function parseErtDateTime(value: string): Date {
  const normalized = value
    .replace(" ", "T")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

  return new Date(normalized);
}

function getZonedMidnight(
  date: string,
  timeZone: string
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const targetUtc = Date.UTC(year, month - 1, day);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  let guess = targetUtc;

  for (let i = 0; i < 4; i++) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(guess))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

    const representedUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );

    const difference = targetUtc - representedUtc;
    guess += difference;

    if (difference === 0) break;
  }

  return new Date(guess);
}


function cleanTitle(title: string): string {
  return title
    // Remove complete style and script blocks, including their contents.
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")

    // Remove any remaining HTML tags.
    .replace(/<[^>]*>/g, " ")

    // Decode common HTML entities.
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")

    // Remove leftover CSS animation rules if they occur outside style tags.
    .replace(/@keyframes\b[\s\S]*?(?=ΠΑΙΖΕΙ ΤΩΡΑ|$)/gi, " ")
    .replace(/\.[\w-]+\s*\{[^{}]*\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


async function fetchGreekDate(
  url: string,
  greekDate: string
): Promise<Programme[]> {
  const response = await fetch(
    `${url}?dt=${encodeURIComponent(greekDate)}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`ERT returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const programmes: Programme[] = [];

  const articleRegex =
    /<article\b([^>]*)>([\s\S]*?)<\/article>/gi;

  for (const match of html.matchAll(articleRegex)) {
    const attributes = match[1];
    const content = match[2];

    const start = attributes.match(
      /\bdata-start-time="([^"]+)"/
    )?.[1];

    const end = attributes.match(
      /\bdata-end-time="([^"]+)"/
    )?.[1];

    const title = content.match(
  /<strong\b[^>]*class="[^"]*\bsection-title\b[^"]*"[^>]*>([\s\S]*?)<\/strong>/i
)?.[1];

const titleMatch = content.match(
  /<strong\b[^>]*class="[^"]*\bsection-title\b[^"]*"[^>]*>([\s\S]*?)<\/strong>/i
);

let category = "";
let episode = "";
let description = "";

if (titleMatch) {
  const titleEnd =
    content.indexOf(titleMatch[0]) + titleMatch[0].length;

  const remainingHtml = content.slice(titleEnd);

  const text = cleanTitle(
  remainingHtml
    .split(
      /ΕΠΑΝΑΛΗΨΗ|ΝΕΟ ΕΠΕΙΣΟΔΙΟ|ΝΕΟΣ ΚΥΚΛΟΣ|ΔΙΑΘΕΣΙΜΟ ΣΤΟ ERTFLIX|ΠΕΡΙΣΣΟΤΕΡΑ|Ζωντανή Μετάδοση|ΠΑΙΖΕΙ ΤΩΡΑ/i
    )[0]
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
);

  const categoryRules: { pattern: RegExp; label: string }[] = [
  { pattern: /Παιδικά|Κινούμενα σχέδια|Νεανικά/i, label: "Παιδικά" },
  { pattern: /Εκκλησιαστικά|Λειτουργία|Θρησκεία/i, label: "Εκκλησιαστικά" },
  { pattern: /Ειδήσεις/i, label: "Ειδήσεις" },
  { pattern: /Ποδόσφαιρο|Γυμναστική|Μπάσκετ|Αθλητικά|Αυτοκίνητο-Μοτοσικλέτα/i, label: "Αθλητικά" },
  { pattern: /Γαστρονομία|Μαγειρική/i, label: "Μαγειρική" },
  { pattern: /Τηλεπεριοδικό|Ενημέρωση/i, label: "Ενημέρωση" },
  { pattern: /Ελληνική σειρά|Σειρά/i, label: "Σειρές" },
  { pattern: /Ταινίες|Κινουμένων σχεδίων/i, label: "Ταινίες" },
  { pattern: /Ντοκιμαντέρ|Φύση|Βιογραφία|Πολιτισμός/i, label: "Ντοκιμαντέρ" },
  { pattern: /Εκπομπή|Ψυχαγωγία/i, label: "Ψυχαγωγία" },
];

  const normalizedText = text.replace(/\s+/g, " ").trim();

  const matchedCategory = categoryRules.find((item) =>
  item.pattern.test(normalizedText)
);

if (matchedCategory) {
  category = matchedCategory.label;
}

let details = normalizedText;

if (matchedCategory) {
  details = details.replace(matchedCategory.pattern, "").trim();
}

  const episodeMatch = details.match(
    /Επεισόδιο\s+\d+ο?(?:\s+και\s+\d+ο?)?/i
  );

  if (episodeMatch && episodeMatch.index !== undefined) {
    episode = episodeMatch[0];
    details = (
      details.slice(0, episodeMatch.index) +
      " " +
      details.slice(
        episodeMatch.index + episodeMatch[0].length
      )
    ).trim();
  }

  // Remove presenter credits from the start of the remaining details.
  details = details.replace(
    /^Παρουσίαση:\s*.*?(?=«|“|".|$)/i,
    ""
  ).trim();

  // Remove leftover programme category metadata from the description.
details = details.replace(
  /^(?:Ψυχαγωγία|Ενημέρωση|Αθλητικά|Ντοκιμαντέρ|Παιδικά-Νεανικά|Παιδικά|Εκκλησιαστικά|Ταινίες|Σειρές|Γαστρονομία|Μαγειρική)\s*\/\s*/i,
  ""
).trim();

  description = details;
}

if (!start || !end || !title) continue;

programmes.push({
  title: cleanTitle(title),
  start,
  end,
  category,
  episode,
  description,
});
  }

  return programmes;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return NextResponse.json(
      {
        error:
          "Please provide a date in YYYY-MM-DD format.",
      },
      { status: 400 }
    );
  }

  const melbourneStart = getZonedMidnight(
    date,
    "Australia/Melbourne"
  ).getTime();

  const melbourneEnd = getZonedMidnight(
    addDays(date, 1),
    "Australia/Melbourne"
  ).getTime();

  // A Melbourne calendar day can overlap several
  // Greek broadcast dates.
  const greekDates = [
    addDays(date, -1),
    date,
    addDays(date, 1),
  ];

  const results = await Promise.all(
    CHANNELS.map(async (channel) => {
      try {
        const schedules = await Promise.all(
          greekDates.map((greekDate) =>
            fetchGreekDate(channel.url, greekDate)
          )
        );

        // Remove duplicate listings from overlapping dates.
        const uniqueProgrammes = new Map<
          string,
          Programme
        >();

        for (const programme of schedules.flat()) {
          const key = [
            programme.start,
            programme.end,
            programme.title,
          ].join("|");

          uniqueProgrammes.set(key, programme);
        }

        // Keep programmes that overlap the selected
        // Melbourne calendar day.
        const programmes = Array.from(
          uniqueProgrammes.values()
        )
          .filter((programme) => {
            const start = parseErtDateTime(
              programme.start
            ).getTime();

            const end = parseErtDateTime(
              programme.end
            ).getTime();

            return (
              Number.isFinite(start) &&
              Number.isFinite(end) &&
              start < melbourneEnd &&
              end > melbourneStart
            );
          })
          .sort(
            (a, b) =>
              parseErtDateTime(a.start).getTime() -
              parseErtDateTime(b.start).getTime()
          );

        return {
          id: channel.id,
          name: channel.name,
          programmes,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ${channel.name}:`,
          error
        );

        return {
          id: channel.id,
          name: channel.name,
          programmes: [],
          error:
            "Could not retrieve this channel's schedule.",
        };
      }
    })
  );

  return NextResponse.json({ date, channels: results });
}
