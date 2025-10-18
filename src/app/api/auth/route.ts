import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

type LoginBody = {
  action: "login" | "logout";
  email?: string;
  password?: string;
};

// export async function POST(req: Request) {
//   const body: LoginBody = await req.json();

//   // Logout
//   if (body.action === "logout") {
//     const response = NextResponse.json({ message: "Logged out" });
//     response.cookies.set("sb-access-token", "", { path: "/", maxAge: 0 });
//     response.cookies.set("sb-refresh-token", "", { path: "/", maxAge: 0 });
//     return response;
//   }

//   // Login
//   if (body.action === "login") {
//     const { email, password } = body;

//     if (!email || !password) {
//       return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
//     }

//     // Fetch user
//     const { data: user, error } = await supabase
//       .from("mUsers")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (error || !user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     // Password check
//     // const isMatch = await bcrypt.compare(password, user.password);
//     // if (!isMatch) {
//     //   return NextResponse.json({ message: "Invalid password" }, { status: 401 });
//     // }
//     if (password !== user.password) {
//       return NextResponse.json({ message: "Invalid password" }, { status: 401 });
//     }

//     if(user.sign_up_status !== "approved") {
//       return NextResponse.json({ message: `Account is ${user.sign_up_status}. Please contact admin.` }, { status: 403 });
//     }

//     // // Only allow super_admin
//     // if (user.user_type !== "super_admin") {
//     //   return NextResponse.json({ message: "Unauthorized: Not an admin" }, { status: 403 });
//     // }

//     // Login success
//     const response = NextResponse.json({ message: "Login successful", user });
//     response.cookies.set("sb-access-token", "dummy-token", { path: "/", maxAge: 3600 });
//     return response;
//   }

//   return NextResponse.json({ message: "Invalid action" }, { status: 400 });
// }
export async function POST(req: Request) {
  const body: LoginBody = await req.json();

  // ✅ Logout
  if (body.action === "logout") {
    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.set("sb-access-token", "", { path: "/", maxAge: 0 });
    response.cookies.set("sb-refresh-token", "", { path: "/", maxAge: 0 });
    return response;
  }

  // ✅ Login
  if (body.action === "login") {
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // 🔍 Fetch user
    const { data: user, error } = await supabase
      .from("mUsers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 🔑 Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    // 🚫 Check account approval
    if (user.sign_up_status !== "approved") {
      return NextResponse.json(
        { message: `Account is ${user.sign_up_status}. Please contact admin.` },
        { status: 403 }
      );
    }

    // ✅ (Optional) Role restriction
    // if (user.user_type !== "super_admin") {
    //   return NextResponse.json({ message: "Unauthorized: Not an admin" }, { status: 403 });
    // }

    // ✅ Login success
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_type: user.user_type,
      },
    });

    // Set token (temporary)
    response.cookies.set("sb-access-token", "dummy-token", {
      path: "/",
      maxAge: 3600, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}