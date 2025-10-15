import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET → fetch requests (optionally filter by resident_id or status)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const resident_id = url.searchParams.get("resident_id"); // optional
    const status = url.searchParams.get("status"); // optional, e.g., pending, approved

    let query = supabase.from("mRequest").select("*").order("id", { ascending: true });

    if (resident_id) query = query.eq("resident_id", resident_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST → create a new request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { m_certificate_id, resident_id, purpose } = body;

    if (!m_certificate_id || !resident_id || !purpose) {
      return NextResponse.json(
        { success: false, message: "m_certificate_id, resident_id, and purpose are required" },
        { status: 400 }
      );
    }

    const insertData = {
      m_certificate_id,
      resident_id,
      purpose,
      document_type: body.document_type || "",
      request_date: body.request_date || new Date().toISOString().split("T")[0],
      priority: body.priority || "Normal",
      status: "pending",
      payment_status: "unpaid",
      del_flag: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("mRequest").insert([insertData]).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Request submitted successfully", data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

