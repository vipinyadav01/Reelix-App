import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook} from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

//1- we need to make sure that the webhook event is coming from clerk
//2- if so,we will listen for user.created event
//3- we will save the user to the database

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        console.log("Received webhook request");
        
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("Missing CLERK_WEBHOOK_SECRET");
            throw new Error("Missing CLERK_WEBHOOK_SECRET not found in environment variables");
        }
            // check headers
        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");   
        const svix_timestamp = request.headers.get("svix-timestamp");

        if (!svix_id || !svix_signature || !svix_timestamp) {
            console.error("Missing headers:", { svix_id, svix_signature, svix_timestamp });
            return new Response("Missing svix headers", {
                status: 400,
            });
        }

        const payload = await request.json();
        const body = JSON.stringify(payload);
        
        // Log the received payload
        console.log("Webhook payload:", payload);

        const webhook = new Webhook(webhookSecret);
        let event: any;

        try {
            event = webhook.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,  
            }) as any;
            
            // Log successful verification
            console.log("Webhook verified successfully");
            
        } catch (error) {
            console.error("Error verifying webhook:", error);
            return new Response("Invalid webhook", {
                status: 400,
            });
        }

        const eventType = event.type;
        console.log("Event type:", eventType);

        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name, image_url, username } = event.data;
            
            if (!email_addresses || email_addresses.length === 0) {
                console.error("No email addresses found in user data");
                return new Response("Invalid user data", {
                    status: 400,
                });
            }

            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();
            const userUsername = username || email.split("@")[0];

            // Log user data before creation/update
            console.log(`${eventType === "user.created" ? "Creating" : "Updating"} user with data:`, {
                email,
                fullname: name || "Unknown User",
                image: image_url || "",
                clerkId: id,
                username: userUsername,
            });

            try {
                const result = await ctx.runMutation(api.user.createUser, {
                    email,
                    fullname: name || "Unknown User",
                    image: image_url || "",
                    clerkId: id,
                    username: userUsername,
                    bio: "",
                });
                
                // Log successful user creation/update
                console.log(`User ${eventType === "user.created" ? "created" : "updated"} successfully:`, result);
                
            } catch (error) {
                console.error(`Error ${eventType === "user.created" ? "creating" : "updating"} user:`, error);
                return new Response(`Error ${eventType === "user.created" ? "creating" : "updating"} user`, {
                    status: 500,
                });
            }
        } else if (eventType === "user.deleted") {
            const { id } = event.data;
            
            console.log("User deleted event received for Clerk ID:", id);
            // Note: We'll let the client handle user deletion cleanup
            // since we can't directly access the database from http actions
            console.log("User deletion event processed");
        } else {
            console.log("Ignored webhook event type:", eventType);
        }

        return new Response("Webhook processed successfully", {
            status: 200,
        });
    })
});

export default http;