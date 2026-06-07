import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

serve(async (req) => {
  const signature = req.headers.get("opay-signature");
  const payload = await req.text();

  const secret = Deno.env.get("OPAY_SECRET_KEY") ?? "";
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const computedSignature = hmac.digest("hex");

  if (computedSignature !== signature) {
    return new Response("Invalid signature", { status: 403 });
  }

  const event = JSON.parse(payload);
  if (event.type === "payment.success") {
    const reference = event.data.reference;
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    await supabaseAdmin
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("invoice_number", reference);
  }

  return new Response("ok", { status: 200 });
});