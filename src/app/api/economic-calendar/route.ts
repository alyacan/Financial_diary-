import { NextResponse } from "next/server";
import { fetchEconomicEvents } from "@/lib/economicCalendar";

export async function GET() {
  const events = await fetchEconomicEvents();
  return NextResponse.json({ events });
}
