import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Required
    const name = formData.get("name") as string;
    const linkedin = formData.get("linkedin") as string;
    const targetCompany = formData.get("targetCompany") as string;
    const submitterEmail = formData.get("submitterEmail") as string;
    
    const cvFile = formData.get("cvFile") as File;
    const linkedinFile = formData.get("linkedinFile") as File;

    if (!name || !linkedin || !targetCompany || !cvFile || !linkedinFile) {
      return NextResponse.json({ error: "Missing mandatory fields or files" }, { status: 400 });
    }

    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("Missing GOOGLE_WEBHOOK_URL");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // Convert files to base64
    const cvBuffer = await cvFile.arrayBuffer();
    const cvBase64 = Buffer.from(cvBuffer).toString('base64');
    const cvExt = cvFile.name.split('.').pop() || 'pdf';

    const linkedInBuffer = await linkedinFile.arrayBuffer();
    const linkedinBase64 = Buffer.from(linkedInBuffer).toString('base64');
    const linkedinExt = linkedinFile.name.split('.').pop() || 'pdf';

    // Construct JSON payload
    const payload = {
      submitterEmail,
      name,
      linkedin,
      targetCompany,
      phone: formData.get("phone") as string || "",
      email: formData.get("email") as string || "",
      currentCompany: formData.get("currentCompany") as string || "",
      currentDesignation: formData.get("currentDesignation") as string || "",
      targetDesignation: formData.get("targetDesignation") as string || "",
      location: formData.get("location") as string || "",
      pastRoles: formData.get("pastRoles") as string || "",
      qualifications: formData.get("qualifications") as string || "",
      ctc: formData.get("ctc") as string || "",
      currency: formData.get("currency") as string || "",
      notes: formData.get("notes") as string || "",
      
      cvFile: {
        base64: cvBase64,
        mimeType: cvFile.type,
        filename: `${name} - CV.${cvExt}`
      },
      linkedinFile: {
        base64: linkedinBase64,
        mimeType: linkedinFile.type,
        filename: `${name} - LinkedIn.${linkedinExt}`
      }
    };

    // Send to Google Apps Script
    const res = await fetch(webhookUrl, {
      method: "POST",
      // Apps Script requires follow redirects to get the final response
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    // Apps Script doPost responses can be text or JSON depending on what we return
    const textRes = await res.text();
    
    let resultData;
    try {
      resultData = JSON.parse(textRes);
    } catch {
      // If it's not JSON, assume it failed or returned HTML
      throw new Error(`Webhook returned invalid response: ${textRes.substring(0, 100)}`);
    }

    if (resultData.status !== "success") {
      throw new Error(resultData.message || "Webhook failed to process request.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting candidate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
