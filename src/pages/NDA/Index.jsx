
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Index.css';

const NDAIndex = () => {
    const [activeSection, setActiveSection] = useState('parties');
    const [recipientName, setRecipientName] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [disclosingName, setDisclosingName] = useState('');
    const [recipientSignedName, setRecipientSignedName] = useState('');
    const [isPdfDownloading, setIsPdfDownloading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const sections = {
        parties: '1. Parties & Purpose',
        confidential: '2. Confidential Info',
        obligations: '3. Your Obligations',
        exclusions: '4. Exclusions',
        term: '5. Term & Termination',
        legal: '6. Legal & Signatures',
    };

    const dateToday = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const showMessage = (text, duration = 3000) => {
        setStatusMessage(text);
        setTimeout(() => {
            setStatusMessage('');
        }, duration);
    };

    const checkInputs = () => {
        return recipientName.trim() !== '' && recipientAddress.trim() !== '' && disclosingName.trim() !== '' && recipientSignedName.trim() !== '';
    };

    const handleDownloadPdf = async () => {
        setIsPdfDownloading(true);
        showMessage('Generating PDF, please wait...');

        const doc = new jsPDF('p', 'mm', 'a4');
        const content = document.getElementById('nda-content');
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= doc.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= doc.internal.pageSize.getHeight();
        }

        doc.save('Highscore_Tech_NDA.pdf');
        setIsPdfDownloading(false);
        showMessage('PDF downloaded successfully!', 5000);
    };

    const AccordionItem = ({ title, children }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <div className={`accordion-item border rounded-lg overflow-hidden ${isOpen ? 'open' : ''}`}>
                <button
                    className="accordion-header w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="font-semibold text-gray-800">{title}</span>
                    <span className="accordion-arrow text-gray-500 text-xl font-bold">&darr;</span>
                </button>
                <div className="accordion-content">
                    <p className="p-4 text-gray-700 bg-white border-t">{children}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-800">Interactive Non-Disclosure Agreement</h1>
                    <p className="text-sm text-gray-500">For HIGHSCORE TECH</p>
                </div>
            </header>

            <div className="flex-grow max-w-7xl w-full mx-auto flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-8">
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <nav id="nda-nav" className="bg-white rounded-lg p-4 shadow-sm sticky top-24">
                        <ul className="space-y-2">
                            {Object.keys(sections).map((key) => (
                                <li key={key}>
                                    <a
                                        href={`#${key}`}
                                        data-section={key}
                                        className={`nav-link block w-full text-left p-3 rounded-md text-gray-700 font-medium ${activeSection === key ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveSection(key);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        {sections[key]}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main id="nda-content" className="w-full md:w-3/4 lg:w-4/5">
                    {activeSection === 'parties' && (
                        <section id="section-parties" className="nda-section bg-white rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Parties & Purpose</h2>
                            <p className="mb-6 text-gray-600">This section identifies the parties involved in this agreement and outlines its purpose. This agreement is a legally binding contract intended to protect sensitive information.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <h3 className="font-bold text-indigo-800">Disclosing Party</h3>
                                    <p className="text-gray-700 font-semibold text-lg">HIGHSCORE TECH</p>
                                    <p className="text-gray-600 text-sm">
                                        <span id="disclosing-party-address">
                                            [Company Address]
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-bold text-green-800">Recipient</h3>
                                    <input type="text" id="recipient-name-input" placeholder="Recipient Name" className="text-gray-700 font-semibold text-lg bg-gray-100 border border-gray-300 p-2 rounded-md w-full mb-2" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                                    <input type="text" id="recipient-address-input" placeholder="Recipient Address" className="text-gray-600 text-sm bg-gray-100 border border-gray-300 p-2 rounded-md w-full" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Purpose of the Agreement</h3>
                            <p className="text-gray-700 leading-relaxed">
                                HIGHSCORE TECH is involved in technology education, client services, and developing its own software projects. To collaborate effectively, we may need to share proprietary and confidential information. The purpose of this Agreement is to ensure that this information remains private and is used only for our mutual business relationship.
                            </p>
                            <div className="mt-8 text-right">
                                <button onClick={() => setActiveSection('confidential')} className="next-btn bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Next &rarr;</button>
                            </div>
                        </section>
                    )}
                    
                    {activeSection === 'confidential' && (
                        <section id="section-confidential" className="nda-section bg-white rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">2. What is Considered Confidential?</h2>
                            <p className="mb-6 text-gray-600">"Confidential Information" covers a wide range of materials and knowledge. It's essentially anything we share with you that isn't public knowledge. Click on the categories below to see detailed examples.</p>
                            
                            <div id="accordion-container" className="space-y-3">
                                <AccordionItem title="Source Code, Object Code, and Algorithms">
                                    All proprietary software code, including but not limited to, the structure, logic, and design of applications, scripts, and software.
                                </AccordionItem>
                                <AccordionItem title="Business Processes and Strategies">
                                    Information related to client management, project execution methodologies, marketing plans, pricing models, and business development strategies.
                                </AccordionItem>
                                <AccordionItem title="Technical Information">
                                    Trade secrets, know-how, inventions, designs, specifications, and other technical data related to the Disclosing Party's projects and services.
                                </AccordionItem>
                                <AccordionItem title="Client Information">
                                    Any data, information, or materials provided by or related to clients of the Disclosing Party.
                                </AccordionItem>
                                <AccordionItem title="Project Documentation">
                                    All documents, drafts, and materials related to projects developed by the Disclosing Party.
                                </AccordionItem>
                            </div>
                            <div className="mt-8 text-right">
                                <button onClick={() => setActiveSection('obligations')} className="next-btn bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Next &rarr;</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 'obligations' && (
                        <section id="section-obligations" className="nda-section bg-white rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Your Obligations</h2>
                            <p className="mb-6 text-gray-600">This section outlines your core responsibilities under this agreement. In short: keep our information safe and use it only for its intended purpose.</p>
                            <div className="space-y-4">
                                <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-green-600 text-2xl mr-4">&#10003;</span>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Hold Information in Strict Confidence</h3>
                                        <p className="text-gray-700">You must not disclose any Confidential Information to anyone outside of this agreement without our written permission.</p>
                                    </div>
                                </div>
                                <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-green-600 text-2xl mr-4">&#10003;</span>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Use Information Appropriately</h3>
                                        <p className="text-gray-700">Use the Confidential Information only for the purpose of our business relationship. No side projects or personal use.</p>
                                    </div>
                                </div>
                                <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-green-600 text-2xl mr-4">&#10003;</span>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Protect the Information</h3>
                                        <p className="text-gray-700">Take all reasonable steps to protect our secrets, just as you would protect your own most valuable information.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 text-right">
                                <button onClick={() => setActiveSection('exclusions')} className="next-btn bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Next &rarr;</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 'exclusions' && (
                        <section id="section-exclusions" className="nda-section bg-white rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Exclusions: What is NOT Confidential?</h2>
                            <p className="mb-6 text-gray-600">This agreement does not apply to all information. The following categories are excluded from the definition of "Confidential Information".</p>
                            <ul className="space-y-4 list-disc list-inside text-gray-700">
                                <li>Information that is or becomes public knowledge through no fault of your own.</li>
                                <li>Information you rightfully had in your possession before we disclosed it to you.</li>
                                <li>Information you develop independently, without using any of our confidential data.</li>
                                <li>Information you rightfully receive from another source that has no confidentiality obligations.</li>
                                <li>Information required to be disclosed by law or a court order. (You must notify us promptly if this happens).</li>
                            </ul>
                            <div className="mt-8 text-right">
                                <button onClick={() => setActiveSection('term')} className="next-btn bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Next &rarr;</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 'term' && (
                        <section id="section-term" className="nda-section bg-white rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Agreement Term & Termination</h2>
                            <p className="mb-6 text-gray-600">This section explains how long the agreement lasts and what happens when our business relationship ends.</p>
                            
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Duration of Agreement</h3>
                            <p className="text-gray-700 mb-6">This Agreement begins on the date it is signed. Your obligation to protect our confidential information continues for a period of <strong>five (5) years</strong> after our business relationship ends.</p>

                            <div className="relative pl-8 py-4 border-l-2 border-indigo-200">
                                <div className="absolute -left-4 top-4 h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                <h4 className="font-semibold">Agreement Signed</h4>
                                <p className="text-sm text-gray-600">The agreement becomes effective.</p>
                            </div>
                            <div className="relative pl-8 py-4 border-l-2 border-indigo-200">
                                <div className="absolute -left-4 top-4 h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                <h4 className="font-semibold">Business Relationship Ends</h4>
                                <p className="text-sm text-gray-600">The 5-year confidentiality period begins.</p>
                            </div>
                            <div className="relative pl-8 py-4 border-l-2 border-transparent">
                                <div className="absolute -left-4 top-4 h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                <h4 className="font-semibold">5 Years Later</h4>
                                <p className="text-sm text-gray-600">Confidentiality obligations under this term expire.</p>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3">Return of Materials</h3>
                            <p className="text-gray-700 leading-relaxed">
                                When our business relationship ends, or if we ask you to, you must promptly return or securely destroy all materials containing our Confidential Information, including any copies you have made.
                            </p>

                            <div className="mt-8 text-right">
                                <button onClick={() => setActiveSection('legal')} className="next-btn bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Next &rarr;</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 'legal' && (
                        <section id="section-legal" className="nda-section bg-white rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">6. Legal Clauses & Signatures</h2>
                            <p className="mb-6 text-gray-600">This final section contains standard legal clauses and the signature block to make the agreement official.</p>
                            
                            <div className="space-y-6 bg-gray-50 p-6 rounded-lg border">
                                <div>
                                    <h3 className="font-semibold text-gray-800">Governing Law</h3>
                                    <p className="text-gray-700">This Agreement shall be governed by and construed in accordance with the laws of <input type="text" id="jurisdiction-input" placeholder="e.g., the State of California" className="bg-gray-100 border border-gray-300 p-1 rounded-md text-sm w-48 inline-block" /></p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Entire Agreement</h3>
                                    <p className="text-gray-700">This document represents the entire understanding between the parties and replaces any previous agreements or discussions.</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Agreement Execution</h3>
                            <p className="text-gray-600 mb-6">By signing below, both parties acknowledge that they have read, understood, and agree to be bound by the terms of this Non-Disclosure Agreement.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t pt-8">
                                <div>
                                    <h4 className="font-bold text-gray-800">DISCLOSING PARTY:</h4>
                                    <p className="font-semibold text-lg mb-6">HIGHSCORE TECH</p>
                                    <div className="space-y-6">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Signature:</span>
                                            <input type="text" id="disclosing-signature-input" placeholder="Type Your Signature" className="mt-1 block w-full border-b pb-2 focus:border-indigo-500 focus:outline-none" />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Name:</span>
                                            <input type="text" id="disclosing-name-input" placeholder="Your Name" className="mt-1 block w-full border-b pb-2 focus:border-indigo-500 focus:outline-none" value={disclosingName} onChange={(e) => setDisclosingName(e.target.value)} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Title:</span>
                                            <input type="text" id="disclosing-title-input" placeholder="Your Title" className="mt-1 block w-full border-b pb-2 focus:border-indigo-500 focus:outline-none" />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Date:</span>
                                            <input type="text" id="disclosing-date-input" placeholder="Date" value={dateToday} readOnly className="mt-1 block w-full border-b pb-2 focus:outline-none bg-transparent" />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">RECIPIENT:</h4>
                                    <p className="font-semibold text-lg mb-6"><span id="recipient-name-display">{recipientName || '[Recipient Name]'}</span></p>
                                    <div className="space-y-6">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Signature:</span>
                                            <input type="text" id="recipient-signature-input" placeholder="Type Your Signature" className="mt-1 block w-full border-b pb-2 focus:border-indigo-500 focus:outline-none" />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Name:</span>
                                            <input type="text" id="recipient-name-signed-input" placeholder="Recipient's Name" className="mt-1 block w-full border-b pb-2 focus:border-indigo-500 focus:outline-none" value={recipientSignedName} onChange={(e) => setRecipientSignedName(e.target.value)} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Title:</span>
                                            <input type="text" id="recipient-title-input" placeholder="Recipient's Title" className="mt-1 block w-full border-b pb-2 focus:border-indigo-500 focus:outline-none" />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-500">Date:</span>
                                            <input type="text" id="recipient-date-input" placeholder="Date" value={dateToday} readOnly className="mt-1 block w-full border-b pb-2 focus:outline-none bg-transparent" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 text-right">
                                <button id="download-pdf-btn" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition" disabled={!checkInputs() || isPdfDownloading} onClick={handleDownloadPdf}>
                                    {isPdfDownloading ? 'Generating PDF...' : 'Complete & Download PDF'}
                                </button>
                            </div>
                        </section>
                    )}
                    
                    {statusMessage && (
                        <div id="status-message" className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                            {statusMessage}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default NDAIndex;
