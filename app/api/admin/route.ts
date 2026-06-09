import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getAllPayments, getAllRequests, getUserPaidStatus, updateRequestStatus, deletePayment } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  if (!pw) return false;
  const okPw = req.headers.get("x-admin-password") === pw;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, payments, requests] = await Promise.all([
    getAllUsers(),
    getAllPayments(),
    getAllRequests(),
  ]);

  // Enrich users with live paid status
  const enriched = await Promise.all(
    users.map(async (u) => {
      const paid = await getUserPaidStatus(u.email);
      return { ...u, isPaid: paid.isPaid, paidServices: paid.paidServices };
    })
  );

  const totalRevenue = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const paidUsers = enriched.filter((u) => u.isPaid).length;

  return NextResponse.json({
    stats: {
      totalUsers: users.length,
      paidUsers,
      totalRevenue,
      totalRequests: requests.length,
      newRequests: requests.filter((r) => r.status === "new").length,
    },
    users: enriched,
    payments,
    requests,
  });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deletePayment(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  await updateRequestStatus(id, status);
  return NextResponse.json({ success: true });
}
