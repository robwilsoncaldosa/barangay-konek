import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";
// import formidable from "formidable";
import fs from "fs";
import path from "path";
import { registerRequestOnChain } from "@/lib/blockchain";
import { IncomingMessage } from "http";
import formidable, { File } from "formidable";

function parseForm(req: Request): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};


// GET → fetch requests (optionally filter by resident_id or status)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const resident_id = url.searchParams.get("resident_id"); // optional
    const status = url.searchParams.get("status"); // optional, e.g., pending, approved

    // Step 1: Fetch requests
    let query = supabase.from("mRequest").select("*").order("id", { ascending: true });
    if (resident_id) query = query.eq("resident_id", resident_id);
    if (status) query = query.eq("status", status);

    const { data: requests, error } = await query;
    if (error) throw error;

    if (!requests) return NextResponse.json({ success: true, data: [] });

    // Step 2: Fetch users for resident_ids
    const residentIds = [...new Set(requests.map((r) => r.resident_id))]; // unique IDs
    const { data: users, error: usersError } = await supabase
      .from("mUsers")
      .select("id, email")
      .in("id", residentIds);

    if (usersError) throw usersError;

    // Step 3: Map email to requests
    const requestsWithEmail = requests.map((r) => {
      const user = users?.find((u) => u.id === r.resident_id);
      return { ...r, email: user?.email || "" };
    });

    return NextResponse.json({ success: true, data: requestsWithEmail });
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


export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const request_id = formData.get("request_id")?.toString();
    const email = formData.get("email")?.toString();
    const file = formData.get("file") as (Blob & { name: string }) | null;

    if (!request_id || !email || !file) {
      return NextResponse.json(
        { success: false, message: "Missing request_id, email, or file" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(filePath, buffer);

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_USER,
        pass: process.env.NEXT_PUBLIC_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.NEXT_PUBLIC_SMTP_USER ?? undefined,
      to: email,
      subject: "Your Requested Document",
      text: "Please find the attached document.",
      attachments: [{ filename: file.name, path: filePath }],
    });

    // Update Supabase
    const { data, error } = await supabase
      .from("mRequest")
      .update({ status: "completed", document_type: file.name })
      .eq("id", request_id)
      .select()
      .single();

    if (error) throw error;

    // Return data; blockchain registration happens client-side
    return NextResponse.json({
      success: true,
      message: "Request updated, PDF saved, and email sent",
      data,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

