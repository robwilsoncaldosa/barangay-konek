"use client";
import { useEffect, useState } from "react";

type User = {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    birthdate: string;
    permanent_address: string;
    permanent_barangay: string;
    current_address: string;
    current_barangay: string;
    contact_no: string;
    mBarangayId: number | null;
    user_type: string;
    sign_up_status: string;
};

type Props = { userType: "official" | "resident"; };

const UserTable = ({ userType }: Props) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [newUser, setNewUser] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        birthdate: "",
        permanent_address: "",
        permanent_barangay: "",
        current_address: "",
        current_barangay: "",
        contact_no: "",
        mBarangayId: "",
        user_type: userType,
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mUsers?user_type=${userType}`);
            const result = await res.json();
            if (result.success) setUsers(result.data);
            else console.error(result.message);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

const handleAddUser = async () => {
    const payload = {
        ...newUser,
        mBarangayId: newUser.mBarangayId ? Number(newUser.mBarangayId) : null
    };

    const res = await fetch("/api/mUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
        fetchUsers();
        setShowForm(false);
        setNewUser({
            first_name: "", middle_name: "", last_name: "", email: "",
            password: "", birthdate: "", permanent_address: "",
            permanent_barangay: "", current_address: "", current_barangay: "",
            contact_no: "", mBarangayId: "", user_type: userType
        });
    } else alert(result.message);
};


    const handleDelete = async (id: number) => {
        if (!confirm("Delete this user?")) return;
        const res = await fetch("/api/mUsers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        const result = await res.json();
        if (result.success) fetchUsers();
        else alert(result.message);
    };

    const handleEdit = async (id: number, status: "approved" | "rejected") => {
        try {
            const res = await fetch("/api/mUsers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, sign_up_status: status }),
            });
            const result = await res.json();
            if (result.success) fetchUsers();
            else alert(result.message);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchUsers(); }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">{userType === "official" ? "Officials" : "Residents"} Table</h1>

            {userType === "official" && (
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="mb-4 px-3 py-1 bg-blue-600 text-white rounded"
                >
                    {showForm ? "Cancel" : "Add Official"}
                </button>
            )}


            {showForm && (
                <div className="mb-4 p-4 border rounded grid gap-2">
                    <input placeholder="First Name" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Middle Name" value={newUser.middle_name} onChange={(e) => setNewUser({ ...newUser, middle_name: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Last Name" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Password (optional)" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Birthdate" type="date" value={newUser.birthdate} onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Permanent Address" value={newUser.permanent_address} onChange={(e) => setNewUser({ ...newUser, permanent_address: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Permanent Barangay" value={newUser.permanent_barangay} onChange={(e) => setNewUser({ ...newUser, permanent_barangay: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Current Address" value={newUser.current_address} onChange={(e) => setNewUser({ ...newUser, current_address: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Current Barangay" value={newUser.current_barangay} onChange={(e) => setNewUser({ ...newUser, current_barangay: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Contact No." value={newUser.contact_no} onChange={(e) => setNewUser({ ...newUser, contact_no: e.target.value })} className="p-1 border rounded" />
                    <input placeholder="Barangay ID" value={newUser.mBarangayId} onChange={(e) => setNewUser({ ...newUser, mBarangayId: e.target.value })} className="p-1 border rounded" />
                    <button onClick={handleAddUser} className="px-3 py-1 bg-green-600 text-white rounded mt-2">Add User</button>
                </div>
            )}

            <table className="w-full border border-gray-300 mt-4 ">
                <thead className="bg-gray-100 text-black">
                    <tr>
                        <th className="border px-2 py-1">ID</th>
                        <th className="border px-2 py-1">First Name</th>
                        <th className="border px-2 py-1">Middle Name</th>
                        <th className="border px-2 py-1">Last Name</th>
                        <th className="border px-2 py-1">Email</th>
                        <th className="border px-2 py-1">Birthdate</th>
                        <th className="border px-2 py-1">Contact No.</th>
                        <th className="border px-2 py-1">Sign Up Status</th>
                        <th className="border px-2 py-1">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="border px-2 py-1">{user.id}</td>
                            <td className="border px-2 py-1">{user.first_name}</td>
                            <td className="border px-2 py-1">{user.middle_name}</td>
                            <td className="border px-2 py-1">{user.last_name}</td>
                            <td className="border px-2 py-1">{user.email}</td>
                            <td className="border px-2 py-1">{user.birthdate}</td>
                            <td className="border px-2 py-1">{user.contact_no}</td>
                            <td className="border px-2 py-1">{user.sign_up_status}</td>
                            <td className="border px-2 py-1 space-x-2">
                                {userType === "official" && (
                                    <>
                                        {user.sign_up_status === "pending" && (
                                            <>
                                                <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handleEdit(user.id, "approved")}>Approve</button>
                                            </>
                                        )}

                                        <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(user.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
