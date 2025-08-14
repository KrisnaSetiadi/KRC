import { SubmissionForm } from "@/components/user/SubmissionForm";
import { UserSubmissions } from "@/components/user/UserSubmissions";

export default function UserDashboardPage() {
    return (
        <div className="space-y-8">
            <SubmissionForm />
            <UserSubmissions />
        </div>
    );
}
