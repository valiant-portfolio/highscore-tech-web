import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#0f0f23] text-[#e2e8f0] py-16 px-6 sm:px-10 lg:px-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 text-white drop-shadow-lg">
          Privacy Policy
        </h1>
        <p className="text-center text-[#94a3b8] mb-12">
          <strong className="text-white">Last Updated:</strong> September 11, 2025
        </p>

        <section className="space-y-8 leading-relaxed">
          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#06b6d4] mb-4">1. Information We Collect</h2>
            <p className="text-sm">
              We collect information to provide and improve our Services. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>
                <strong className="text-white">Personal Information:</strong> We collect your name, email address, phone number, and any account credentials you create. We also collect payment details when you make a transaction.
              </li>
              <li>
                <strong className="text-white">Non-Personal Information:</strong> We automatically collect device information (like your IP address, browser type, and operating system) and usage data (such as pages visited and time spent).
              </li>
              <li>
                <strong className="text-white">Third-Party Information:</strong> We may receive information about you from social media platforms or other third-party services if you connect them to our Services.
              </li>
            </ul>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#7c3aed] mb-4">2. How We Use Your Information</h2>
            <p className="text-sm">
              We use the information we collect for several purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>
                <strong className="text-white">Service Delivery:</strong> To provide and maintain our Services, process transactions, and fulfill your requests.
              </li>
              <li>
                <strong className="text-white">Personalization:</strong> To enhance your user experience by improving and tailoring our content and offerings.
              </li>
              <li>
                <strong className="text-white">Communication:</strong> To send you updates, promotional materials, and support messages, and to respond to your inquiries.
              </li>
              <li>
                <strong className="text-white">Security & Analysis:</strong> To monitor and analyze usage patterns, prevent fraud, and ensure the security of our Services.
              </li>
            </ul>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#ec4899] mb-4">3. Sharing Your Information</h2>
            <p className="text-sm">
              We do not sell your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>
                <strong className="text-white">Service Providers:</strong> Vendors who help operate our services, such as web hosting and payment processing.
              </li>
              <li>
                <strong className="text-white">Legal & Security Compliance:</strong> We may disclose your information when legally required or to protect our rights, property, or safety.
              </li>
              <li>
                <strong className="text-white">Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.
              </li>
            </ul>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#facc15] mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-sm">
              We use cookies and similar tracking technologies to enhance your experience. These technologies help us remember your preferences and analyze site traffic. You can manage your cookie preferences through your browser settings.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#22c55e] mb-4">5. Data Security</h2>
            <p className="text-sm">
              We have implemented measures to protect your information, but please be aware that no method of transmission over the Internet is entirely secure.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#f97316] mb-4">6. Your Rights and Choices</h2>
            <p className="text-sm">
              You have certain rights regarding your data. You may have the right to access, correct, or request the deletion of your personal data. To exercise these rights, please contact us.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#a855f7] mb-4">7. Children's Privacy</h2>
            <p className="text-sm">
              Our Services are not intended for individuals under 15 years of age. We do not knowingly collect personal data from children.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#3b82f6] mb-4">8. International Data Transfers</h2>
            <p className="text-sm">
              If you are accessing our Services from outside Nigeria, your information may be transferred to and processed in Nigeria.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#ef4444] mb-4">9. Changes to This Policy</h2>
            <p className="text-sm">
              We may update this Privacy Policy periodically. We will notify you of any significant changes by posting the new policy on our website.
            </p>
          </div>

          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#14b8a6] mb-4">10. Contact Us</h2>
            <p className="text-sm">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li><strong className="text-white">Email:</strong> info@highzcore.tech</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}