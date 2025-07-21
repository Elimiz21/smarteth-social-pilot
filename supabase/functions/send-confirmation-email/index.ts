import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  userEmail: string;
  userName: string;
  status: 'approved' | 'rejected';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userEmail, userName, status }: EmailRequest = await req.json();

    const subject = status === 'approved' 
      ? "Account Approved - Welcome to Social Media Management Platform"
      : "Account Application Status";

    const html = status === 'approved' 
      ? `
        <h1>Welcome to the platform, ${userName}!</h1>
        <p>Your account has been approved and you can now access the Social Media Management Platform.</p>
        <p>Email: ${userEmail}</p>
        <p>You can now log in and start managing your social media campaigns.</p>
        <p>Best regards,<br>The Team</p>
      `
      : `
        <h1>Account Application Update</h1>
        <p>Dear ${userName},</p>
        <p>Thank you for your interest in joining our platform. After review, we are unable to approve your account at this time.</p>
        <p>If you have questions, please contact support.</p>
        <p>Best regards,<br>The Team</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "Social Media Platform <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);