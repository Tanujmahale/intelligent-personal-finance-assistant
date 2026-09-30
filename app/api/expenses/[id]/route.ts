import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import { updateExpenseSchema } from "@/lib/validation/schemas";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(
      body.amount !== undefined ? { ...body, amount: Number(body.amount) } : body
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const userId = getDemoUserId();

    const { data, error } = await supabase
      .from("expenses")
      .update(parsed.data)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ expense: data });
  } catch (err) {
    console.error("PATCH /api/expenses/[id] error:", err);
    return NextResponse.json(
      { error: "Could not update expense. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/expenses/[id] error:", err);
    return NextResponse.json(
      { error: "Could not delete expense. Please try again." },
      { status: 500 }
    );
  }
}
