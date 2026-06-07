import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { clientName, clientEmail, clientWhatsapp, tierId, amount } = await req.json();

    // Supabase admin client (service_role key)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Insert client (or find existing by email)
    let clientId = null;
    if (clientEmail) {
      const { data: existing } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("email", clientEmail)
        .maybeSingle();
      if (existing) clientId = existing.id;
    }
    if (!clientId) {
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({ name: clientName, email: clientEmail, whatsapp: clientWhatsapp })
        .select("id")
        .single();
      if (clientError) throw new Error(clientError.message);
      clientId = newClient?.id;
    }

    // 2. Generate invoice number
    const invoiceNumber = "INV-" + Date.now();

    // 3. Insert invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert({
        client_id: clientId,
        tier_id: tierId,
        amount: amount,
        status: "pending",
        invoice_number: invoiceNumber,
      })
      .select("id")
      .single();
    if (invoiceError) throw new Error(invoiceError.message);

    // 4. Call Opay API (sandbox or live)
    // IMPORTANT: Replace with actual Opay endpoint and authentication
    const opayResponse = await fetch("https://sandboxapi.opaycheckout.com/api/v1.0/international/cashier/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPAY_PUBLIC_KEY")}`,
      },
      body: JSON.stringify({
        amount: amount.toString(),
        reference: invoiceNumber,
        currency: "NGN",
        callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/opay-webhook`,
        returnUrl: "https://your-frontend.com/payment-success",  // adjust later
        customerEmail: clientEmail,
        customerName: clientName,
        description: "TDS Video Production Invoice",
      }),
    });

    const opayData = await opayResponse.json();
    if (!opayResponse.ok) throw new Error(opayData.message || "Opay error");

    // 5. Update invoice with Opay details
    await supabaseAdmin
      .from("invoices")
      .update({
        payment_reference: opayData.data?.reference,
        payment_url: opayData.data?.cashierUrl,
      })
      .eq("id", invoice.id);

    return new Response(JSON.stringify({ payment_url: opayData.data?.cashierUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});