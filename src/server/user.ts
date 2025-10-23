'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import type { Database } from '../../database.types'
import nodemailer from "nodemailer";

type User = Database['public']['Tables']['mUsers']['Row']
type UserInsert = Database['public']['Tables']['mUsers']['Insert']
type UserUpdate = Database['public']['Tables']['mUsers']['Update']

type CustomAuthUser = Pick<User, 'id' | 'email' | 'user_type' | 'mbarangayid'>

export interface AuthUser {
  id: number
  email: string
  user_metadata: {
    user_type: Pick<User, 'user_type'>['user_type']
    mbarangayid: Pick<User, 'mbarangayid'>['mbarangayid']
  }
}

export async function GetUser(): Promise<{ success: boolean; data?: AuthUser | null; message?: string }> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const customAuthCookie = cookieStore.get("custom-auth-user");

    if (!customAuthCookie) {
      return { success: false, message: "No authentication cookie found." };
    }

    try {
      const userData: CustomAuthUser = JSON.parse(customAuthCookie.value);

      return {
        success: true,
        data: {
          id: userData.id,
          email: userData.email,
          user_metadata: {
            user_type: userData.user_type,
            mbarangayid: userData.mbarangayid,
          },
        },
      };
    } catch {
      throw new Error("Invalid or corrupted authentication cookie.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return { success: false, message };
  }
}


export async function GetUserById(userId: number): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mUsers')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function GetUsersByType(userType: 'official' | 'resident' = 'official'): Promise<User[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mUsers')
      .select('*')
      .eq('user_type', userType)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching users by type:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function CreateUser(
  userData: Pick<
    UserInsert,
    | "first_name"
    | "last_name"
    | "email"
    | "password"
    | "birthdate"
    | "permanent_address"
    | "permanent_barangay"
    | "current_address"
    | "current_barangay"
    | "contact_no"
    | "middle_name"
    | "mbarangayid"
    | "user_type"
  >
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const insertData: UserInsert = {
      ...userData,
      password: hashedPassword,
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

    if (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_USER,
        pass: process.env.NEXT_PUBLIC_SMTP_PASS,
      },
    });

    const subject = "Welcome to Barangay Konek!";
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f3f6f9; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #2563eb; color: #ffffff; padding: 16px 24px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="margin: 0; font-size: 20px;">Barangay Konek</h2>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <h3 style="margin: 0 0 12px; color: #1f2937;">Registration Successful!</h3>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Dear ${data.first_name} ${data.last_name},
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Thank you for registering on <strong>Barangay Konek</strong>.
              Your account is currently <strong>pending approval</strong> by your Barangay officials.
              You will receive another email once your account has been verified.
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              If you have any concerns, please contact your Barangay Office.
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
    `;

    await transporter.sendMail({
      from: `"Barangay Konek" <${process.env.NEXT_PUBLIC_SMTP_USER ?? undefined}>`,
      to: data.email,
      subject,
      html,
    });

    console.log(`📧 Registration email sent to ${data.email}`);

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}


export async function UpdateUser(
  userId: string,
  userData: Pick<
    UserUpdate,
    | "first_name"
    | "last_name"
    | "email"
    | "password"
    | "birthdate"
    | "permanent_address"
    | "permanent_barangay"
    | "current_address"
    | "current_barangay"
    | "contact_no"
    | "middle_name"
    | "mbarangayid"
    | "user_type"
    | "sign_up_status"
  >
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    const updateData: UserUpdate = {
      ...userData,
      updated_at: new Date().toISOString(),
    };

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      updateData.password = hashedPassword;
    }

    const { data, error } = await supabase
      .from("mUsers")
      .update(updateData)
      .eq("id", Number(userId))
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }

    if (data?.email && userData.sign_up_status) {
      const transporter = nodemailer.createTransport({
        host: process.env.NEXT_PUBLIC_SMTP_HOST,
        port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
        auth: {
          user: process.env.NEXT_PUBLIC_SMTP_USER,
          pass: process.env.NEXT_PUBLIC_SMTP_PASS,
        },
      });

      const isApproved = userData.sign_up_status === "approved";
      const subject = isApproved
        ? "Barangay Konek Account Approved"
        : "Barangay Konek Registration Rejected";

      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f3f6f9; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #2563eb; color: #ffffff; padding: 16px 24px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h2 style="margin: 0; font-size: 20px;">Barangay Konek</h2>
            </div>
            <div style="padding: 24px;">
              <h3 style="margin: 0 0 12px; color: #1f2937;">Account Status Update</h3>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Dear ${data.first_name || "User"},
              </p>
              ${isApproved
          ? `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      We are pleased to inform you that your <b>Barangay Konek</b> account has been <b>approved</b>.
                    </p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      You can now log in and access all available features.
                    </p>`
          : `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      We regret to inform you that your <b>Barangay Konek</b> registration has been <b>rejected</b>.
                    </p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      If you believe this was an error, please contact your Barangay Office for assistance.
                    </p>`
        }
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
      `;

      await transporter.sendMail({
        from: `"Barangay Konek" <${process.env.NEXT_PUBLIC_SMTP_USER}>`,
        to: data.email,
        subject,
        html,
      });

      console.log(`📧 Email sent to ${data.email}: ${subject}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error in updateUser:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

export async function DeleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Soft delete by setting del_flag to 1
    const { error } = await supabase
      .from('mUsers')
      .update({
        del_flag: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(userId))

    if (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function RegisterUser(
  userData: Pick<UserInsert, 'first_name' | 'last_name' | 'email' | 'password' | 'birthdate' | 'permanent_address' | 'permanent_barangay' | 'current_address' | 'current_barangay' | 'contact_no' | 'middle_name' | 'mbarangayid' | 'user_type'>
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    // Validate required fields
    if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
      return { success: false, error: 'Missing required fields' }
    }

    // Check if user already exists
    const supabase = await createSupabaseServerClient()
    const { data: existingUser } = await supabase
      .from('mUsers')
      .select('id')
      .eq('email', userData.email)
      .eq('del_flag', 0) // Only check active users
      .single()

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Create the user using existing CreateUser function (which now hashes password)
    return await CreateUser(userData)
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export async function HandleUserRedirect(user: AuthUser | null) {
  if (!user) return

  const userType = user.user_metadata?.user_type

  switch (userType) {
    case 'official':
      return '/official'
    case 'resident':
      return '/resident'
    default:
      return '/dashboard'
  }
}