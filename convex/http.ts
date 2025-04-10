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

        if (eventType === "user.created") {
            const { id, email_addresses, first_name, last_name, image_url } = event.data;
            
            if (!email_addresses || email_addresses.length === 0) {
                console.error("No email addresses found in user data");
                return new Response("Invalid user data", {
                    status: 400,
                });
            }

            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            // Log user data before creation
            console.log("Creating user with data:", {
                email,
                fullname: name,
                image: image_url,
                clerkId: id,
                username: email.split("@")[0],
            });

            try {
                const result = await ctx.runMutation(api.user.createUser, {
                    email,
                    fullname: name,
                    image: image_url,
                    clerkId: id,
                    username: email.split("@")[0],
                });
                
                // Log successful user creation
                console.log("User created successfully:", result);
                
            } catch (error) {
                console.error("Error creating user:", error);
                return new Response("Error creating user", {
                    status: 500,
                });
            }
        }

        return new Response("Webhook processed successfully", {
            status: 200,
        });
    })
});

export default http;