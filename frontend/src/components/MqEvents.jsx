import { useEffect, useState } from "react";
import { CalendarDays, Clock, ExternalLink, Loader2, MapPin, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const fallbackSourceUrl = "https://www.mq.edu.au/about/about-the-university/events";

function EventCard({ event }) {
  return (
    <Card className="h-full p-0">
      <CardHeader className="gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">{event.audience || "MQ event"}</Badge>
          <CalendarDays className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
          <CardDescription className="leading-6">{event.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 pt-0">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            <span>{event.location}</span>
          </div>
        </div>
        <Button className="w-full sm:w-fit" variant="outline" asChild>
          <a href={event.url} target="_blank" rel="noreferrer">
            Open on MQ
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card className="border-dashed p-0">
      <CardContent className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm font-semibold text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading MQ events...
      </CardContent>
    </Card>
  );
}

export default function MqEvents({ apiUrl }) {
  const [eventsData, setEventsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEvents() {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("/api/mq-events"));
      if (!response.ok) {
        throw new Error("Could not load MQ events.");
      }

      const data = await response.json();
      setEventsData(data);
    } catch (eventError) {
      setError(eventError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const events = eventsData?.events || [];
  const browseUrl = eventsData?.browseUrl || fallbackSourceUrl;
  const sourceUrl = eventsData?.sourceUrl || fallbackSourceUrl;

  return (
    <section id="events" className="border-b bg-secondary/45">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="warm">
              <CalendarDays aria-hidden="true" />
              MQ Events
            </Badge>
            <h2 className="text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              Events from Macquarie University.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Source: {eventsData?.sourceName || "Macquarie University Events"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchEvents} type="button" variant="outline">
              {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
              Refresh
            </Button>
            <Button asChild variant="warm">
              <a href={browseUrl} target="_blank" rel="noreferrer">
                Live MQ list
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-destructive/40 bg-destructive/5 p-0">
            <CardContent className="p-5 text-sm font-semibold text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            events.map((event) => <EventCard event={event} key={event.title} />)
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-secondary-foreground">{eventsData?.status || "Official MQ source"}</span>
          <span aria-hidden="true">/</span>
          <a className="font-semibold text-primary underline-offset-4 hover:underline" href={sourceUrl} target="_blank" rel="noreferrer">
            mq.edu.au events
          </a>
        </div>
      </div>
    </section>
  );
}
