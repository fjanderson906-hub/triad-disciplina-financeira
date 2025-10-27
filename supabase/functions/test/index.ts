import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Test endpoint called");

    // 1. Create a test user
    const testEmail = `test${Date.now()}@triad.com`;
    const testPassword = "test123456";
    
    console.log("Creating test user:", testEmail);
    
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: "Test User"
      }
    });

    if (authError) {
      console.error("Error creating user:", authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log("User created successfully:", userId);

    // Wait a bit for triggers to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Check if account was created automatically
    const { data: accountData, error: accountError } = await supabaseClient
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (accountError) {
      console.error("Error fetching account:", accountError);
    }

    console.log("Account data:", accountData);

    // 3. Insert a transaction
    const transactionAmount = 3000;
    
    console.log("Creating transaction for user:", userId);
    
    const { data: transactionData, error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: userId,
        type: "income",
        category: "Salário",
        amount: transactionAmount,
        description: "Entrada de teste"
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    console.log("Transaction created:", transactionData);

    // Wait for trigger to update account
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Fetch updated account balance
    const { data: updatedAccount, error: balanceError } = await supabaseClient
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (balanceError) {
      console.error("Error fetching updated balance:", balanceError);
      throw new Error(`Failed to fetch balance: ${balanceError.message}`);
    }

    console.log("Updated account:", updatedAccount);

    // 5. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test completed successfully",
        data: {
          user: {
            id: userId,
            email: testEmail,
          },
          transaction: transactionData,
          account: updatedAccount,
          regra_1_3: {
            balance: updatedAccount.balance,
            investment: updatedAccount.investment,
            reserve: updatedAccount.reserve,
            personal_use: updatedAccount.personal_use,
          }
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in test endpoint:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});