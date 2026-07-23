import { Editor } from "@/components/ui/editor";

const CONTENT = `
<h2>Terms of Service</h2>
<p>Last updated: July 2026</p>
<p>By using Bloomy you agree to these terms. Please read them carefully before creating an account or using any of our services.</p>

<h2>1. Use of the Service</h2>
<p>Bloomy provides tools for garden planning, material estimation, and connecting homeowners with contractors. You may use the service only for lawful purposes and in accordance with these terms.</p>
<ul>
  <li>You must be at least 18 years old to create an account.</li>
  <li>You are responsible for keeping your login credentials secure.</li>
  <li>You agree not to misuse the platform or attempt to access it in unauthorised ways.</li>
</ul>

<h2>2. User Accounts</h2>
<p>When you create an account you provide accurate and complete information. You are responsible for all activity that occurs under your account.</p>

<h2>3. Contractor Listings</h2>
<p>Bloomy facilitates connections between homeowners and contractors but does not employ contractors or guarantee the quality of their work. You are responsible for independently verifying any contractor you engage.</p>
<ul>
  <li>Contractors are independent professionals, not employees of Bloomy.</li>
  <li>Bloomy does not guarantee estimates, timelines, or outcomes.</li>
  <li>All agreements between homeowners and contractors are made directly between those parties.</li>
</ul>

<h2>4. Intellectual Property</h2>
<p>All content, designs, and software on Bloomy are owned by or licensed to Bloomy Ltd. You may not copy, reproduce, or distribute them without our written consent.</p>

<h2>5. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, Bloomy is not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

<h2>6. Changes to These Terms</h2>
<p>We may update these terms from time to time. We will notify registered users of material changes via email. Continued use of the service after changes constitutes acceptance.</p>

<h2>7. Contact</h2>
<p>Questions about these terms? Email us at <a href="mailto:legal@bloomy.app">legal@bloomy.app</a>.</p>
`;

export default function TermsPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <div className="container max-w-2xl py-16 md:py-24">
        <Editor html={CONTENT} />
      </div>
    </div>
  );
}
