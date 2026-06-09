"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: "",
    linkedin: "",
    targetCompany: "",
    phone: "",
    email: "",
    currentCompany: "",
    designation: "",
    location: "",
    pastRoles: "",
    qualifications: "",
    ctc: "",
    currency: "INR",
    notes: "",
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [showAdditional, setShowAdditional] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.linkedin || !form.targetCompany || !cvFile || !linkedinFile) {
      setErrorMessage("Please fill out all mandatory fields and upload both files.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      // Required fields
      formData.append("name", form.name);
      formData.append("linkedin", form.linkedin);
      formData.append("targetCompany", form.targetCompany);
      formData.append("cvFile", cvFile);
      formData.append("linkedinFile", linkedinFile);
      
      // We pass the email from the authenticated session
      formData.append("submitterEmail", session?.user?.email || "Unknown");

      // Optional fields
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("currentCompany", form.currentCompany);
      formData.append("designation", form.designation);
      formData.append("location", form.location);
      formData.append("pastRoles", form.pastRoles);
      formData.append("qualifications", form.qualifications);
      formData.append("ctc", form.ctc);
      formData.append("currency", form.currency);
      formData.append("notes", form.notes);

      const res = await fetch("/api/submit-candidate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit candidate.");
      }

      setStatus("success");
      
      // Reset form
      setForm({
        name: "", linkedin: "", targetCompany: "", phone: "", email: "", 
        currentCompany: "", designation: "", location: "", pastRoles: "", 
        qualifications: "", ctc: "", currency: "INR", notes: ""
      });
      setCvFile(null);
      setLinkedinFile(null);
      
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#f4f7fd] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4E0F0] max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#111] mb-2 font-serif">Candidate Added!</h2>
          <p className="text-[#6b7a99] mb-6">
            The candidate details have been successfully mapped to the database and Drive folders.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="px-6 py-2.5 rounded-md text-[14px] font-bold bg-[#D8B15B] text-[#0d2f6e] hover:bg-[#e8c97a] transition-all w-full"
          >
            Add Another Candidate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fd] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#111] mb-1">Float List DB</h1>
            <p className="text-[#6b7a99] text-sm">Upload candidate details and CVs directly to the central database.</p>
          </div>
          {session?.user && (
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-[#D4E0F0]">
              <div className="text-xs text-[#6b7a99]">
                Logged in as <span className="font-bold text-[#111]">{session.user.email}</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="text-[#123D8D] hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#D4E0F0] overflow-hidden">
          
          <div className="bg-[#123D8D] px-6 py-4 border-b border-[#0d2f6e] flex items-center gap-2">
            <span className="text-red-300">●</span> 
            <span className="text-[13px] font-bold uppercase tracking-wide text-white">Candidate Upload Form</span>
          </div>
          
          <div className="p-6 sm:p-8 space-y-8">
            
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-[14px]">{errorMessage}</span>
              </div>
            )}

            {/* Section: Mandatory */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9ca8be] mb-4 border-b border-[#f0f0f0] pb-2">Mandatory Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">
                    Candidate Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">
                    LinkedIn URL <span className="text-red-500">*</span>
                  </label>
                  <input type="url" required value={form.linkedin} onChange={e=>setForm({...form, linkedin:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">
                    Dream Company (Target Company) <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={form.targetCompany} onChange={e=>setForm({...form, targetCompany:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="e.g. HDFC Bank" />
                </div>
              </div>
            </div>

            {/* Section: Documents */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9ca8be] mb-4 border-b border-[#f0f0f0] pb-2">Documents <span className="text-red-500">*</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-2">
                    LinkedIn Screenshot (PDF/Img) <span className="text-red-500">*</span>
                  </label>
                  <label className="border-2 border-dashed border-[#D4E0F0] rounded-xl p-6 text-center cursor-pointer hover:border-[#123D8D] hover:bg-[#DCE5F4] bg-[#f4f7fd] transition-all block relative group">
                    <input type="file" required accept="application/pdf,image/*" className="hidden" onChange={e => setLinkedinFile(e.target.files?.[0] || null)} />
                    <UploadCloud className="w-8 h-8 text-[#123D8D] opacity-40 group-hover:opacity-80 transition-opacity mx-auto mb-2" />
                    <div className="text-[13px] font-semibold text-[#123D8D]">{linkedinFile ? 'Change File' : 'Click to upload LinkedIn file'}</div>
                    {linkedinFile && <div className="mt-2 text-[12px] font-bold text-[#111] overflow-hidden text-ellipsis whitespace-nowrap">{linkedinFile.name}</div>}
                  </label>
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-2">
                    CV / Resume (PDF/Word) <span className="text-red-500">*</span>
                  </label>
                  <label className="border-2 border-dashed border-[#D4E0F0] rounded-xl p-6 text-center cursor-pointer hover:border-[#123D8D] hover:bg-[#DCE5F4] bg-[#f4f7fd] transition-all block relative group">
                    <input type="file" required accept="application/pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                    <UploadCloud className="w-8 h-8 text-[#123D8D] opacity-40 group-hover:opacity-80 transition-opacity mx-auto mb-2" />
                    <div className="text-[13px] font-semibold text-[#123D8D]">{cvFile ? 'Change File' : 'Click to upload CV'}</div>
                    {cvFile && <div className="mt-2 text-[12px] font-bold text-[#111] overflow-hidden text-ellipsis whitespace-nowrap">{cvFile.name}</div>}
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Fields Toggle */}
            <div className="pt-4 pb-2">
              <button
                type="button"
                onClick={() => setShowAdditional(!showAdditional)}
                className="flex items-center gap-2 text-[#123D8D] font-bold text-[13px] hover:text-[#0d2f6e] transition-colors"
              >
                {showAdditional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAdditional ? 'Hide Additional Details' : 'Show Additional Details (Optional)'}
              </button>
            </div>

            {showAdditional && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Section: Contact & Basic */}
                <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9ca8be] mb-4 border-b border-[#f0f0f0] pb-2">Contact & Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Phone Number</label>
                  <input type="text" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="email@domain.com" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Location</label>
                  <input type="text" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="City" />
                </div>
              </div>
            </div>

            {/* Section: Professional details */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9ca8be] mb-4 border-b border-[#f0f0f0] pb-2">Professional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Current Company</label>
                  <input type="text" value={form.currentCompany} onChange={e=>setForm({...form, currentCompany:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="Company Name" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Designation / Role</label>
                  <input type="text" value={form.designation} onChange={e=>setForm({...form, designation:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="Title" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Past Roles & Experience</label>
                  <textarea rows={2} value={form.pastRoles} onChange={e=>setForm({...form, pastRoles:e.target.value})} className="w-full border-[1.5px] border-[#D4E0F0] rounded-md p-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="e.g. CFO - HDFC Bank"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Qualifications / Education</label>
                  <input type="text" value={form.qualifications} onChange={e=>setForm({...form, qualifications:e.target.value})} className="w-full h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="e.g. CA, MBA" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Annual CTC</label>
                  <div className="flex gap-2">
                    <select value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})} className="w-20 h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-2 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]">
                      <option>INR</option><option>USD</option><option>GBP</option><option>EUR</option>
                    </select>
                    <input type="number" value={form.ctc} onChange={e=>setForm({...form, ctc:e.target.value})} className="flex-1 h-[42px] border-[1.5px] border-[#D4E0F0] rounded-md px-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="Amount" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Notes */}
            <div>
              <label className="block text-[12px] font-bold tracking-wide uppercase text-[#6b7a99] mb-1.5">Additional Notes</label>
              <textarea rows={3} value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} className="w-full border-[1.5px] border-[#D4E0F0] rounded-md p-3 text-[14px] outline-none bg-white text-[#111] focus:border-[#123D8D]" placeholder="Any extra information..."></textarea>
            </div>
          </div>
          )}

          </div>

          <div className="bg-[#f8fafc] px-6 sm:px-8 py-5 border-t border-[#D4E0F0] flex justify-end">
            <button 
              type="submit"
              disabled={status === "submitting"} 
              className="px-8 py-3 rounded-lg text-[14px] font-bold bg-[#D8B15B] text-[#0d2f6e] hover:bg-[#e8c97a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {status === "submitting" ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0d2f6e] border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Candidate"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
