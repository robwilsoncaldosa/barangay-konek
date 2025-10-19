import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import formidable, { File } from "formidable";
import { IncomingMessage } from "http";

function parseForm(req: Request): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Disable default body parser
export const config = { api: { bodyParser: false } };

// GET → fetch requests
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const resident_id = url.searchParams.get("resident_id");
    const status = url.searchParams.get("status");

    let query = supabase.from("mRequest").select("*").order("id", { ascending: true });
    if (resident_id) query = query.eq("resident_id", resident_id);
    if (status) query = query.eq("status", status);

    const { data: requests, error } = await query;
    if (error) throw error;
    if (!requests) return NextResponse.json({ success: true, data: [] });

    const residentIds = [...new Set(requests.map((r) => r.resident_id))];
    const { data: users, error: usersError } = await supabase
      .from("mUsers")
      .select("id, email")
      .in("id", residentIds);

    if (usersError) throw usersError;

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

// PUT → upload PDF and mark request completed
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const request_id = formData.get("request_id")?.toString();
    const file = formData.get("file") as (Blob & { name: string }) | null;
    const blockchain = formData.get("blockchain")?.toString() === "1";
    const tx_hash = formData.get("tx_hash")?.toString();

    if (!request_id || !file) {
      return NextResponse.json({ success: false, message: "Missing request_id or file" }, { status: 400 });
    }

    // Save PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(filePath, buffer);

    // Fetch request to get resident_id
    const { data: requestData, error: requestError } = await supabase
      .from("mRequest")
      .select("id, resident_id")
      .eq("id", request_id)
      .single();
    if (requestError || !requestData) throw requestError || new Error("Request not found");

    // Fetch email from mUsers using resident_id
    const { data: userData, error: userError } = await supabase
      .from("mUsers")
      .select("email")
      .eq("id", requestData.resident_id)
      .single();
    if (userError) throw userError;

    const email = userData?.email;

    // Prepare data for updating request
    const updateData: any = { status: "completed", document_type: file.name };
    if (blockchain && tx_hash) updateData.tx_hash = tx_hash;

    const { data, error } = await supabase
      .from("mRequest")
      .update(updateData)
      .eq("id", request_id)
      .select()
      .single();
    if (error) throw error;

    // Send email if blockchain step included
    if (blockchain && tx_hash && email) {
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
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f3f6f9; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #2563eb; color: #ffffff; padding: 16px 24px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h2 style="margin: 0; font-size: 20px;">Barangay Konek</h2>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h3 style="margin: 0 0 12px; color: #1f2937;">Your Requested Document is Ready</h3>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Dear Resident,
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for using our service. Please find the attached document you requested.
              </p>
              ${
                tx_hash
                  ? `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      Blockchain transaction: <a href="https://sepolia-blockscout.lisk.com/tx/${tx_hash}">${tx_hash}</a>
                     </p>`
                  : ""
              }
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                If you have any concerns or need additional assistance, feel free to reply to this email.
              </p>
              <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
                Best regards,<br/>
                <strong>Barangay Konek Team</strong>
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; font-size: 12px; color: #777;">
            &copy; ${new Date().getFullYear()} Barangay Konek. All rights reserved.
          </div>
        </div>
        `,
        attachments: [{ filename: file.name, path: filePath }],
      });
    }

    return NextResponse.json({ success: true, message: "PDF uploaded and request updated", data });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
