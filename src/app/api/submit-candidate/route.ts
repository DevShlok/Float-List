import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Required
    const name = formData.get("name") as string;
    const linkedin = formData.get("linkedin") as string;
    const targetCompany = formData.get("targetCompany") as string;
    const submitterEmail = formData.get("submitterEmail") as string;
    
    const cvFile = formData.get("cvFile") as File | null;
    const linkedinFile = formData.get("linkedinFile") as File | null;

    if (!name && !linkedin && !targetCompany && (!cvFile || cvFile.size === 0) && (!linkedinFile || linkedinFile.size === 0)) {
      return NextResponse.json({ error: "Please provide at least one piece of information or document" }, { status: 400 });
    }

    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("Missing GOOGLE_WEBHOOK_URL");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // Convert files to base64
    let cvBase64 = "", cvExt = "", cvMime = "";
    if (cvFile && cvFile.size > 0) {
      const cvBuffer = await cvFile.arrayBuffer();
      cvBase64 = Buffer.from(cvBuffer).toString('base64');
      cvExt = cvFile.name.split('.').pop() || 'pdf';
      cvMime = cvFile.type;
    }

    let linkedinBase64 = "", linkedinExt = "", linkedinMime = "";
    if (linkedinFile && linkedinFile.size > 0) {
      const linkedInBuffer = await linkedinFile.arrayBuffer();
      linkedinBase64 = Buffer.from(linkedInBuffer).toString('base64');
      linkedinExt = linkedinFile.name.split('.').pop() || 'pdf';
      linkedinMime = linkedinFile.type;
    }

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
      
      cvFile: cvBase64 ? {
        base64: cvBase64,
        mimeType: cvMime,
        filename: `${name || "Unknown Candidate"} - CV.${cvExt}`
      } : null,
      linkedinFile: linkedinBase64 ? {
        base64: linkedinBase64,
        mimeType: linkedinMime,
        filename: `${name || "Unknown Candidate"} - LinkedIn.${linkedinExt}`
      } : null
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
