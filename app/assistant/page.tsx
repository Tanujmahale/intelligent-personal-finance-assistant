import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/assistant/ChatInterface";

export default function AssistantPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">FinAI Assistant</h1>
        <p className="text-sm text-slate-500">
          Ask questions about your spending. Answers use only your stored data and are informational, not professional financial advice.
        </p>
      </div>
      <ChatInterface />
    </AppShell>
  );
}
