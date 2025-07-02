/**
 * Clerk Webhook Handler for User & Session events.
 * Handles `user.created`, `user.updated`, `user.deleted`, `session.created`, `session.removed`.
 * Automatically syncs Clerk user data with local MongoDB database and logs relevant user activity.
 */

import connectDB from "@/lib/database";
import { userRepository } from "@/repositories/UserRepository";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import type { Handler } from "@netlify/functions";
import isEqual from "lodash.isequal";
import { Webhook } from "svix";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("Missing CLERK_WEBHOOK_SECRET in .env");
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const headers = event.headers;
  const payload = event.body;

  if (!payload) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No payload provided" }),
    };
  }

  // Extract Svix signature headers
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing Svix signature headers" }),
    };
  }

  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Svix verification failed:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid webhook signature" }),
    };
  }

  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    console.log("📥 Incoming Clerk event:", evt.type);

    // Route the event type to the appropriate handler
    switch (evt.type) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      case "session.created":
        await handleSessionCreated(evt.data);
        break;
      case "session.removed":
        await handleSessionRemoved(evt.data);
        break;
      default:
        console.log(`⚠️ Unhandled Clerk event: ${evt.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Webhook processed successfully" }),
    };
  } catch (error) {
    console.error("🔥 Webhook processing failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};

async function handleUserCreated(userData: any) {
  try {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      username,
      image_url,
    } = userData;

    // Get primary email
    const primaryEmail = email_addresses.find(
      (email: any) => email.id === userData.primary_email_address_id
    );

    if (!primaryEmail) {
      throw new Error("No primary email found");
    }

    // Check if user already exists by clerkId
    const existingUser = await userRepository.findByClerkId(clerkId);

    if (existingUser) {
      if (existingUser.status === "inactive") {
        console.log(`Reactivating user ${clerkId}`);
        await userRepository.updateByClerkId(clerkId, {
          status: "active",
          updatedAt: new Date(),
        });

        await logUserActivity(existingUser._id, "user.reactivated", {
          clerkId,
          email: existingUser.email,
          source: "clerk_webhook",
        });
      } else {
        console.log(`User ${clerkId} already active`);
      }
      return;
    }

    // 🔍 Check by email in case user recreated their Clerk account
    const existingByEmail = await userRepository.findByEmail(
      primaryEmail.email_address
    );

    if (existingByEmail) {
      console.log(
        `User with email ${primaryEmail.email_address} exists but has a different Clerk ID. Re-linking...`
      );

      await userRepository.updateById(existingByEmail._id, {
        clerkId,
        status: "active",
        updatedAt: new Date(),
      });

      try {
        await logUserActivity(existingByEmail._id, "user.relinked", {
          clerkId,
          email: existingByEmail.email,
          source: "clerk_webhook",
        });
        console.log("✅ User activity logged (user.relinked)");
      } catch (err) {
        console.error("❌ Failed to log user activity:", err);
      }

      return;
    }

    // Create new user
    console.log("Creating new user with email:", primaryEmail.email_address);
    const newUser = await userRepository.create({
      clerkId,
      email: primaryEmail.email_address,
      firstName: first_name || "",
      lastName: last_name || "",
      username: username || undefined,
      avatar: image_url || undefined,
      plan: "free",
      role: "user",
      status: "active",
      preferences: {
        theme: "light",
        language: "en",
        notifications: {
          email: true,
          push: true,
          marketing: false,
        },
      },
      stats: {
        totalPortfolios: 0,
        totalViews: 0,
        totalProjects: 0,
      },
    });
    console.log("User created successfully:", newUser.email);

    // Handle Clerk user private metadata update
    let clerk = null;
    try {
      const clerkAwait = await clerkClient();
      console.log(`Fetching Clerk user with id: ${clerkId}`);
      clerk = await clerkAwait.users.getUser(clerkId);
      console.log("Clerk user fetched:", clerk);

      const newPrivateMetadata = {
        role: "user",
        plan: "free",
      };

      const shouldUpdate = clerk
        ? !isEqual(clerk.privateMetadata, newPrivateMetadata)
        : false;

      if (shouldUpdate) {
        try {
          await clerkAwait.users.updateUser(clerkId, {
            privateMetadata: newPrivateMetadata,
          });
          console.log("Clerk user privateMetadata updated");
        } catch (updateError) {
          console.error(
            "Failed to update Clerk user privateMetadata:",
            updateError
          );
        }
      } else {
        console.log("No privateMetadata update needed");
      }
    } catch (err) {
      console.error("Failed to get Clerk user:", err);
      // Decide: continue or throw
      clerk = null;
    }

    // Log user activity
    console.log("Logging user activity for user.created event");
    await logUserActivity(newUser._id, "user.created", {
      clerkId,
      email: newUser.email,
      source: "clerk_webhook",
    });
    console.log("User activity logged successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      username,
      image_url,
      updated_at,
    } = userData;

    // Get primary email
    const primaryEmail = email_addresses.find(
      (email: any) => email.id === userData.primary_email_address_id
    );

    if (!primaryEmail) {
      throw new Error("No primary email found");
    }

    // Find existing user
    const existingUser = await userRepository.findByClerkId(clerkId);
    if (!existingUser) {
      console.log(`User with Clerk ID ${clerkId} not found, creating new user`);
      await handleUserCreated(userData);
      return;
    }

    // Update user
    const updatedUser = await userRepository.updateByClerkId(clerkId, {
      email: primaryEmail.email_address,
      firstName: first_name || existingUser.firstName,
      lastName: last_name || existingUser.lastName,
      username: username || existingUser.username,
      avatar: image_url || existingUser.avatar,
      updatedAt: new Date(updated_at),
    });

    console.log(`User updated successfully: ${updatedUser?.email}`);

    // Log activity
    if (updatedUser) {
      await logUserActivity(updatedUser._id, "user.updated", {
        clerkId,
        email: updatedUser.email,
        source: "clerk_webhook",
        changes: {
          firstName: first_name !== existingUser.firstName,
          lastName: last_name !== existingUser.lastName,
          username: username !== existingUser.username,
          avatar: image_url !== existingUser.avatar,
        },
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  try {
    const { id: clerkId } = userData;

    // Find existing user
    const existingUser = await userRepository.findByClerkId(clerkId);
    if (!existingUser) {
      console.log(`User with Clerk ID ${clerkId} not found`);
      return;
    }

    // Soft delete user (update status instead of hard delete)
    const deletedUser = await userRepository.updateByClerkId(clerkId, {
      status: "inactive",
      updatedAt: new Date(),
    });

    console.log(`User soft deleted successfully: ${deletedUser?.email}`);

    // Log activity
    if (deletedUser) {
      await logUserActivity(deletedUser._id, "user.deleted", {
        clerkId,
        email: deletedUser.email,
        source: "clerk_webhook",
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

async function handleSessionCreated(sessionData: any) {
  try {
    const { id: sessionId, user_id: clerkUserId, ...rest } = sessionData;

    // Find user by Clerk ID
    const user = await userRepository.findByClerkId(clerkUserId);
    if (!user) {
      console.log(`Session created but user ${clerkUserId} not found`);
      return;
    }

    console.log(
      `Session created for user ${clerkUserId}, session ID: ${sessionId}`
    );

    // Optional: update user's session info or status if needed
    // await userRepository.addSession(user._id, sessionId);

    // Log session created activity
    await logUserActivity(user._id, "session.created", {
      sessionId,
      source: "clerk_webhook",
      details: rest,
    });
  } catch (error) {
    console.error("Error handling session.created:", error);
    throw error;
  }
}

async function handleSessionRemoved(sessionData: any) {
  try {
    const { id: sessionId, user_id: clerkUserId } = sessionData;

    // Find user by Clerk ID
    const user = await userRepository.findByClerkId(clerkUserId);
    if (!user) {
      console.log(`Session removed but user ${clerkUserId} not found`);
      return;
    }

    console.log(
      `Session removed for user ${clerkUserId}, session ID: ${sessionId}`
    );

    // Optional: update user's session info or status if needed
    // await userRepository.removeSession(user._id, sessionId);

    // Log session removed activity
    await logUserActivity(user._id, "session.removed", {
      sessionId,
      source: "clerk_webhook",
    });
  } catch (error) {
    console.error("Error handling session.removed:", error);
    throw error;
  }
}
