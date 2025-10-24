import RequestListPage from "@/app/_components/request";
import UserTable from "@/app/admin/_components/user-table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { headers } from "next/headers";

export default async function ResidentPage() {
    const headersList = await headers();
    const userDataHeader = headersList.get('x-user-data');

    // Parse user data (guaranteed to exist due to middleware protection)
    const user = JSON.parse(userDataHeader!);
    return (<><DashboardLayout user={user} title="Official Panel">
        <div className="container mx-auto px-4">
            <UserTable userType="resident"/>
        </div>
    </DashboardLayout></>);
}