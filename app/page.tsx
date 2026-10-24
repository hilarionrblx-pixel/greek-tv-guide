
"use client";

import { useEffect, useMemo, useState } from "react";

type Channel = {
  id: string;
  name: string;
  description: string;
  shows: string[];
};

const channels: Channel[] = [
  {
    id: "ert1",
    name: "ERT1",
    description: "Public television",
    shows: [
      "Overnight News",
      "Morning News",
      "Breakfast",
      "News and Reports",
      "Afternoon Magazine",
      "Evening News",
      "Greek Drama",
    ],
  },
  {
    id: "ert2",
    name: "ERT2 Sport",
    description: "Sport and events",
    shows: [
      "Sports Highlights",
      "Morning Sports",
      "Live Sports",
      "Sports Magazine",
      "Athletics",
      "Football",
      "Sports Review",
    ],
  },
  {
    id: "ert3",
    name: "ERT3",
    description: "Regional programming",
    shows: [
      "Regional News",
      "Morning Magazine",
      "Greek Culture",
      "Documentaries",
      "Regional Stories",
      "News from Northern Greece",
      "Documentary",
    ],
  },
  {
    id: "mega",
    name: "MEGA",
    description: "Entertainment",
    shows: [
      "Classic Greek Series",
      "Morning Show",
      "Lifestyle",
      "Daily Magazine",
      "Greek Series",
      "Prime-Time Drama",
      "Late-Night Show",
    ],
  },
  {
    id: "ant1",
    name: "ANT1",
    description: "Entertainment and news",
    shows: [
      "Overnight Series",
      "Breakfast Show",
      "Morning Magazine",
      "News",
      "Afternoon Entertainment",
      "Game Show",
      "Comedy Series",
    ],
  },
  {
    id: "alpha",
    name: "ALPHA",
    description: "News and entertainment",
    shows: [
      "Night-Time Series",
      "Morning Show",
      "Lifestyle Magazine",
      "News",
      "Greek Drama",
      "Prime-Time Series",
      "Late-Night Entertainment",
    ],
  },
  {
    id: "skai",
    name: "SKAI",
    description: "News and documentaries",
    shows: [
      "Documentary",
      "Morning News",
      "Current Affairs",
      "News",
      "Travel Documentary",
      "Current Affairs Tonight",
      "International Documentary",
    ],
  },
  {
    id: "star",
    name: "STAR",
    description: "Entertainment",
    shows: [
      "Late-Night Movie",
      "Morning Entertainment",
      "Lifestyle Show",
      "News",
      "Reality Entertainment",
      "International Series",
      "Movie",
    ],
  },
  {
    id: "open",
    name: "OPEN",
    description: "News and entertainment",
    shows: [
      "Night-Time Programme",
      "Morning News",
      "Talk Show",
      "News",
      "Afternoon Talk Show",
      "Entertainment Tonight",
      "Greek Series",
    ],
  },
  {
    id: "vouli",
    name: "Vouli TV",
    description: "Parliament and public affairs",
    shows: [
      "Parliamentary Archive",
      "Political Discussion",
      "Committee Session",
      "Parliamentary Proceedings",
      "Public Affairs",
      "Parliamentary Debate",
      "Recorded Proceedings",
    ],
  },
];

const programmeBoundaries = [
  0, 360, 540, 720, 960, 1140, 1320, 1440,
];

const categories = [
  "Overnight",
  "News",
  "Lifestyle",
  "Daytime",
  "Entertainment",
  "Prime time",
  "Late night",
];

const categoryColors = [
  "bg-slate-100 border-slate-300",
  "bg-sky-100 border-sky-300",
  "bg-emerald-100 border-emerald-300",
  "bg-amber-100 border-amber-300",
  "bg-violet-100 border-violet-300",
  "bg-rose-100 border-rose-300",
  "bg-indigo-100 border-indigo-300",
];

function formatTime(minutes: number) {
  const normalizedMinutes = minutes % 1440;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function Home() {
  const [now, setNow] = useState<Date>(
  new Date("2000-01-01T12:00:00Z")
);
  const [selectedDay, setSelectedDay] = useState(0);
  const [search, setSearch] = useState("");
  const [favourites, setFavourites] = useState<string[]>([]);
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  useEffect(() => {
  setNow(new Date());

  const timer = window.setInterval(() => {
    setNow(new Date());
  }, 60_000);

  return () => window.clearInterval(timer);
  }, []);

  // Start two hours before now, rounded down to a half-hour boundary.
  const currentMinutes =
  now.getHours() * 60 + now.getMinutes();
  const startMinutes = Math.max(
    0,
    Math.floor((currentMinutes - 120) / 30) * 30
  );

  // Display every half-hour slot through midnight.
  const timeSlots = Array.from(
    { length: (1440 - startMinutes) / 30 },
    (_, index) => startMinutes + index * 30
  );

  const timelineWidth = timeSlots.length * 110;

  const dates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        return new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + index
        );
      }),
    [now]
  );

  const visibleChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(search.toLowerCase()) ||
      channel.description.toLowerCase().includes(search.toLowerCase()) ||
      channel.shows.some((show) =>
        show.toLowerCase().includes(search.toLowerCase())
      );

    const matchesFavourites =
      !favouritesOnly || favourites.includes(channel.id);

    return matchesSearch && matchesFavourites;
  });

  function toggleFavourite(channelId: string) {
    setFavourites((previous) =>
      previous.includes(channelId)
        ? previous.filter((id) => id !== channelId)
        : [...previous, channelId]
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-blue-950 px-5 py-7 text-white md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            Your Greek television companion
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Greek TV Guide
          </h1>

          <p className="mt-2 text-blue-100">
            Discover what is on Greek television.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
        <div className="mb-5 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">Choose a date</h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse the next seven calendar days.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date, index) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDay(index)}
                className={`min-w-[112px] rounded-xl border px-4 py-3 text-left transition ${
                  selectedDay === index
                    ? "border-blue-900 bg-blue-950 text-white shadow"
                    : "border-slate-300 bg-white hover:border-blue-500"
                }`}
              >
                <span className="block text-xs font-medium opacity-80">
                  {index === 0 ? "TODAY" : formatDate(date).split(",")[0].toUpperCase()}
                </span>
                <span className="mt-1 block text-base font-bold">
                  {date.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search channels or programmes..."
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={() => setFavouritesOnly((value) => !value)}
            className={`rounded-xl border px-4 py-3 font-semibold transition ${
              favouritesOnly
                ? "border-amber-500 bg-amber-100 text-amber-950"
                : "border-slate-300 bg-white hover:bg-slate-50"
            }`}
          >
            {favouritesOnly ? "★ Showing favourites" : "☆ Favourites only"}
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              TV schedule — {formatDate(dates[selectedDay])}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {formatTime(startMinutes)} – 12:00 AM
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Times use your device&apos;s local time.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
          <div
            className="grid min-w-max"
            style={{
              gridTemplateColumns: `160px repeat(${timeSlots.length}, 110px)`,
              gridAutoRows: "96px",
            }}
          >
            <div
              className="sticky left-0 z-30 flex items-center border-b border-r border-slate-300 bg-slate-200 px-4 font-bold"
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              CHANNEL
            </div>

            {timeSlots.map((time, index) => (
              <div
                key={time}
                style={{ gridColumn: index + 2, gridRow: 1 }}
                className="flex items-center border-b border-r border-slate-300 bg-slate-200 px-2 text-xs font-bold"
              >
                {formatTime(time)}
              </div>
            ))}

            {visibleChannels.map((channel, channelIndex) => {
              const row = channelIndex + 2;

              return (
                <div key={channel.id} className="contents">
                  <div
                    style={{ gridColumn: 1, gridRow: row }}
                    className="sticky left-0 z-20 flex items-center gap-2 border-b border-r border-slate-300 bg-white px-3"
                  >
                    <button
                      onClick={() => toggleFavourite(channel.id)}
                      title={
                        favourites.includes(channel.id)
                          ? "Remove favourite"
                          : "Add favourite"
                      }
                      className={`text-xl ${
                        favourites.includes(channel.id)
                          ? "text-amber-500"
                          : "text-slate-300 hover:text-amber-400"
                      }`}
                    >
                      ★
                    </button>

                    <div className="min-w-0">
                      <div className="truncate font-bold">
                        {channel.name}
                      </div>
                      <div className="truncate text-[10px] text-slate-500">
                        {channel.description}
                      </div>
                    </div>
                  </div>

                  {timeSlots.map((time, slotIndex) => (
                    <div
                      key={`${channel.id}-slot-${time}`}
                      style={{
                        gridColumn: slotIndex + 2,
                        gridRow: row,
                      }}
                      className="border-b border-r border-slate-200 bg-slate-50"
                    />
                  ))}

                  {channel.shows.map((show, programmeIndex) => {
                    const programmeStart =
                      programmeBoundaries[programmeIndex];
                    const programmeEnd =
                      programmeBoundaries[programmeIndex + 1];

                    const visibleStart = Math.max(
                      programmeStart,
                      startMinutes
                    );
                    const visibleEnd = Math.min(programmeEnd, 1440);

                    if (visibleEnd <= visibleStart) return null;

                    const firstSlot = (visibleStart - startMinutes) / 30;
                    const spanSlots = (visibleEnd - visibleStart) / 30;

                    return (
                      <button
                        key={`${channel.id}-${programmeIndex}`}
                        onClick={() =>
                          window.alert(
                            `${channel.name}\n${show}\n${formatTime(programmeStart)} – ${formatTime(programmeEnd)}\n\nThese are sample listings. Real programme information has not been connected yet.`
                          )
                        }
                        title={`${show} (${formatTime(programmeStart)} – ${formatTime(programmeEnd)})`}
                        style={{
                          gridColumn: `${firstSlot + 2} / span ${spanSlots}`,
                          gridRow: row,
                          zIndex: 10,
                        }}
                        className={`m-1 flex min-w-0 flex-col items-start overflow-hidden rounded-lg border p-2 text-left transition hover:brightness-95 ${
                          categoryColors[programmeIndex]
                        }`}
                      >
                        <span className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-slate-600">
                          {categories[programmeIndex]}
                        </span>
                        <span className="line-clamp-3 text-xs font-bold leading-snug sm:text-sm">
                          {show}
                        </span>
                        <span className="mt-1 text-[10px] text-slate-600">
                          {formatTime(programmeStart)} –{" "}
                          {formatTime(programmeEnd)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {visibleChannels.length === 0 && (
          <div className="mt-4 rounded-xl border border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">No channels found.</p>
            <p className="mt-1 text-sm text-slate-600">
              Try another search or turn off the favourites filter.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Development version:</strong> Programme names and times are
          placeholders for now. The dates and timeline are dynamic, but the
          programme listings will repeat until we connect a real TV schedule
          data source.
        </div>

        <footer className="py-6 text-center text-xs text-slate-500">
          Greek TV Guide · A guide to Greek television
        </footer>
      </section>
    </main>
  );
}
