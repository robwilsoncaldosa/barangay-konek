import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mCertificate")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Error fetching certificates:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
