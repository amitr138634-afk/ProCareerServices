import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserPaidStatus } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ loggedIn: false, isPaid: false, paidServices: [] });
  }
  const service = req.nextUrl.searchParams.get("service") ?? undefined;
  const { isPaid, paidServices } = await getUserPaidStatus(session.user.email, service);
  return NextResponse.json({
    loggedIn: true,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    isPaid,
    paidServices,
  });
}
