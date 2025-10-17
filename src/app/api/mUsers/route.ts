import nodemailer from "nodemailer"; // For sending email
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET → fetch users by type
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const user_type = url.searchParams.get("user_type"); // official or resident

        const { data, error } = await supabase
            .from("mUsers")
            .select("*")
            .eq("user_type", user_type || "official")
            .order("id", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

// POST → create user

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      password,
      birthdate,
      permanent_address,
      permanent_barangay,
      current_address,
      current_barangay,
      contact_no,
      middle_name,
      mBarangayId,
      user_type,
    } = body;

    // Required fields
    if (!first_name || !last_name || !email || !birthdate || !permanent_address || !contact_no) {
      return NextResponse.json(
        { success: false, message: "First name, last name, email, birthdate, permanent address, and contact no. are required" },
        { status: 400 }
      );
    }

    // Check duplicate email/contact
    const { data: existing } = await supabase
      .from("mUsers")
      .select("*")
      .or(`email.eq.${email},contact_no.eq.${contact_no}`)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email or contact number already exists" },
        { status: 409 }
      );
    }

    const tempPassword = password || Math.random().toString(36).slice(-8);

    const insertData = {
      first_name,
      last_name,
      email,
      password: tempPassword, // TODO: hash this later
      birthdate,
      permanent_address,
      permanent_barangay: permanent_barangay || "",
      current_address: current_address || "",
      current_barangay: current_barangay || "",
      contact_no,
      middle_name: middle_name || "",
      mBarangayId: null,
      user_type: user_type || "resident",
      sign_up_status: "pending",
      del_flag: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("mUsers")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    // 2️⃣ Send email to the user
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_USER,
        pass: process.env.NEXT_PUBLIC_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Barangay Konek" <${process.env.NEXT_PUBLIC_SMTP_USER}>`,
      to: email,
      subject: "Account Created - Awaiting Admin Approval",
      html: `
        <p>Hi ${first_name},</p>
        <p>Thank you for registering! Your account is pending approval by an admin.</p>
        <p>You will receive another email once your account is approved.</p>
      `,
    });

    return NextResponse.json({ success: true, message: "Account created. Check your email for approval.", data });
  } catch (err) {
    console.error("CATCH ERROR:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}



// PUT → update user info
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...fields } = body;

        const { data, error } = await supabase
            .from("mUsers")
            .update({ ...fields, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

// DELETE → delete user
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        const { data, error } = await supabase
            .from("mUsers")
            .delete()
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
