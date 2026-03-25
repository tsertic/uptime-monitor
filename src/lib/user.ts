import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

  const user = await prisma.user.create({
    data: {
      clerkId: userId,
      email,
      name: name || null,
      notifications: {
        create: { emailEnabled: true, emailAddress: email },
      },
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
