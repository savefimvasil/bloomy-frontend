import { Editor } from "@/components/ui/editor";

const CONTENT = `
<h2>Privacy Policy</h2>
<p>Last updated: July 2026</p>
<p>This policy explains how Bloomy Ltd collects, uses, and protects your personal data when you use our service.</p>

<h2>1. What We Collect</h2>
<p>We collect the following categories of data:</p>
<ul>
  <li><strong>Account data</strong> — name, email address, and password (hashed).</li>
  <li><strong>Profile data</strong> — your role (homeowner or contractor) and optional details you provide.</li>
  <li><strong>Usage data</strong> — pages visited, features used, and general interaction patterns.</li>
  <li><strong>Project data</strong> — tile plans, garden plans, and estimates you create and save.</li>
</ul>

<h2>2. How We Use Your Data</h2>
<ul>
  <li>To provide and improve the Bloomy service.</li>
  <li>To connect homeowners with relevant contractors.</li>
  <li>To send transactional emails (account confirmations, password resets).</li>
  <li>To send promotional emails, if you opted in during registration.</li>
</ul>

<h2>3. Data Sharing</h2>
<p>We do not sell your personal data. We may share it with:</p>
<ul>
  <li>Service providers that help us operate the platform (hosting, email delivery).</li>
  <li>Other users when you choose to share a project or respond to a quote request.</li>
  <li>Authorities when required by law.</li>
</ul>

<h2>4. Data Retention</h2>
<p>We retain your data for as long as your account is active. You may request deletion at any time by contacting us.</p>

<h2>5. Your Rights</h2>
<p>Under applicable data protection law you have the right to:</p>
<ol>
  <li>Access the personal data we hold about you.</li>
  <li>Correct inaccurate data.</li>
  <li>Request deletion of your data.</li>
  <li>Object to or restrict certain processing.</li>
  <li>Data portability.</li>
</ol>

<h2>6. Cookies</h2>
<p>Bloomy uses only functional cookies necessary to keep you signed in. We do not use tracking or advertising cookies.</p>

<h2>7. Contact</h2>
<p>For privacy enquiries or to exercise your rights, contact us at <a href="mailto:privacy@bloomy.app">privacy@bloomy.app</a>.</p>
`;

export default function PrivacyPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <div className="container max-w-2xl py-16 md:py-24">
        <Editor html={CONTENT} />
      </div>
    </div>
  );
}
