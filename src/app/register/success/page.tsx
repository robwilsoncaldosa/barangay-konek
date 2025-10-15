"use client";

export default function RegistrationSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Registration Successful</h1>
        <p className="mb-4">
          Your account has been created! An email has been sent to your address. Please wait for an admin to approve your account before logging in.
        </p>
        <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
      </div>
    </div>
  );
}
