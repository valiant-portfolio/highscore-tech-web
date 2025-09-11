import React from 'react';
export default function TermsOfService() {
  return (
    <div className="bg-[#0f0f23] text-[#e2e8f0] py-16 px-6 sm:px-10 lg:px-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 text-white drop-shadow-lg">
          Terms of Service
        </h1>
        <p className="text-center text-[#94a3b8] mb-12">
          <strong className="text-white">Last Updated:</strong> September 11, 2025
        </p>

        <section className="space-y-8 leading-relaxed">
          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#06b6d4] mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm">
              Welcome to Highzcore! These Terms of Service (&quot;Terms&quot;) govern your use of our website,{' '}
              <a href="https://highzcore.tech" className="text-[#06b6d4] hover:underline" target="_blank" rel="noopener noreferrer">highzcore.tech</a>, and all related services. By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our services.
            </p>
            <p className="text-sm mt-3">
              By using our website or any of our services, you confirm that you are at least 15 years of age or have the consent of a parent or legal guardian. You also agree to comply with all applicable laws and regulations.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#7c3aed] mb-4">2. Services Provided</h2>
            <p className="text-sm">Highzcore offers a range of services, including:</p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>
                <strong className="text-white">Software Development:</strong> We provide professional services for web development, mobile applications, AI solutions, and more.
              </li>
              <li>
                <strong className="text-white">Tech Education:</strong> We offer courses and training programs in areas such as frontend, backend, data science, and AI.
              </li>
            </ul>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#ec4899] mb-4">3. User Obligations</h2>
            <p className="text-sm">As a user, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>Provide accurate and complete information.</li>
              <li>Use our services for lawful purposes only.</li>
              <li>Refrain from transmitting malicious code or viruses.</li>
              <li>Respect our intellectual property rights.</li>
            </ul>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#facc15] mb-4">4. Intellectual Property Rights</h2>
            <p className="text-sm">
              All content on the Highzcore website, including text, graphics, logos, images, code, and course materials, is the exclusive property of Highzcore or its licensors.
            </p>
            <p className="text-sm mt-3">
              You may not reproduce, distribute, modify, or create derivative works without our express written permission.
            </p>
          </div>

<div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
    <h2 className="text-2xl font-bold text-[#22c55e] mb-4">5. Disclaimer of Warranties</h2>
    <p className="text-sm">
      Our services are provided "as is" without any warranties of any kind. We do not guarantee that our services will be uninterrupted, error-free, or secure.
    </p>
</div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#f97316] mb-4">6. Limitation of Liability</h2>
            <p className="text-sm">
              To the fullest extent permitted by law, Highzcore will not be liable for any damages, including but not limited to, loss of profits, goodwill, or data, resulting from your use of our services.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#a855f7] mb-4">7. Indemnification</h2>
            <p className="text-sm">
              You agree to indemnify and hold harmless Highzcore, its affiliates, and employees from any and all claims and expenses arising from your use of our services or your violation of these Terms.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#3b82f6] mb-4">8. Governing Law</h2>
            <p className="text-sm">
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#ef4444] mb-4">9. Changes to Terms</h2>
            <p className="text-sm">
              We reserve the right to modify these Terms at any time. We will post any changes on our website. Your continued use of our services after such changes constitutes your acceptance of the new Terms.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#14b8a6] mb-4">10. Contact Information</h2>
            <p className="text-sm">
              If you have any questions, please contact us at:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li><strong className="text-white">Email:</strong> info@highzcore.tech</li>
              <li><strong className="text-white">Phone:</strong> +234 811 263 9073</li>
              <li><strong className="text-white">Address:</strong> Ayilara Street, Surulere, Lagos, Nigeria</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}