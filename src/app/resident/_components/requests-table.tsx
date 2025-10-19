import { Tables } from "../../../../database.types";

type Request = Tables<"mRequest">;

interface RequestsTableProps {
  requests: Request[];
}

export default function RequestsTable({ requests }: RequestsTableProps) {
  if (requests.length === 0) {
    return <p className="text-gray-500">No requests submitted yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Certificate ID</th>
            <th className="border p-2 text-left">Document Type</th>
            <th className="border p-2 text-left">Purpose</th>
            <th className="border p-2 text-left">Request Date</th>
            <th className="border p-2 text-left">Priority</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Payment</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="border p-2">{request.mCertificateId}</td>
              <td className="border p-2">{request.document_type}</td>
              <td className="border p-2">{request.purpose}</td>
              <td className="border p-2">{request.request_date}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    request.priority === "Urgent"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {request.priority}
                </span>
              </td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    request.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : request.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {request.status}
                </span>
              </td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    request.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {request.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}