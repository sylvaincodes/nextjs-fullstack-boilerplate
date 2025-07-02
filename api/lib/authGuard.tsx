import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
// import * as Sentry from "@sentry/nextjs"; // Uncomment if Sentry is enabled

/**
 * Middleware-style helper to protect routes and optionally enforce admin-only access.
 *
 * @param options.requireAdmin - If true, the user must have 'admin' role. Defaults to true.
 * @returns Either the authenticated user context ({ userId, sessionId, user }) or a NextResponse redirect/403.
 */
export async function authGuard({ requireAdmin = true } = {}) {
  try {
    // Retrieve the authenticated user and session
    const { userId, sessionId } = await auth();

    // Redirect to sign-in if not authenticated
    if (!userId || !sessionId) {
      return NextResponse.redirect(
        new URL(
          process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
          process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"
        )
      );
    }

    // Fetch full user details from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // If admin role is required, check private metadata
    if (requireAdmin && user.privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Authorized response
    return { userId, sessionId, user };
  } catch (error) {
    // Optional: Capture exception with Sentry
    // Sentry.captureException(error);

    if (process.env.NODE_ENV === "development") {
      console.error("AuthGuard Error:", error);
    }

    // Redirect to sign-in on unexpected errors
    return NextResponse.redirect(
      new URL(
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
        process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"
      )
    );
  }
}
