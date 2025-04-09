import { createUser } from './user';
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook} from "svix";
import { api } from "./_generated/api";


const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request)=>{
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret){
            throw new Error("Missing CLERK_WEBHOOK_SECRET not found in environment variables");
          
        }

        //check headers for svix signature
        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");   
        const svix_timestamp = request.headers.get("svix-timestamp");

        if (!svix_id || !svix_signature || !svix_timestamp){
            return new Response("Missing svix headers", {
                status: 400,

            });
        }
        const payload = await request.json();
        const body = JSON.stringify(payload);

        const webhook = new Webhook(webhookSecret);
        let event: any;

        //verify the webhook signature

        try {
            event = webhook.verify(body, {
                id: svix_id,
                timestamp: svix_timestamp,
                signature: svix_signature,  
            }) as any;
            
        } catch (error) {
            console.error("Error verifying webhook", error);
            return new Response("Invalid webhook", {
                status: 400,
            });
            
        }
        const eventType = event.type;

        if (eventType === "user.created"){
            const {id,email_address,first_name,last_name,image_url}= event.data;

            const email = email_address[0].email_address;
            const name = `${first_name ||"" } ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.user.createUser, {
                    email,
                    fullname: name,
                    image: image_url,
                    clerkId: id,
                    username: email.split("@")[0],
                })
                
            } catch (error) {
                console.log("Error creating users", error);
                return new Response("Error creating user", {
                    status: 500,
                });
            }

        }
        return new Response("Webhook processed successfully", {
            status: 200,});

    })

})
export default http;
export { createUser };