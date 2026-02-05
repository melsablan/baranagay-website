import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: 'Certificate Requests',
      questions: [
        {
          question: 'How long does it take to process a Barangay Clearance?',
          answer: 'Processing typically takes 3-5 business days. You will receive a notification via email or SMS once your certificate is ready for pickup.'
        },
        {
          question: 'What documents do I need for a Certificate of Indigency?',
          answer: 'You need to provide: Valid ID, Proof of residency (utility bill or lease contract), and a brief statement explaining your need for the certificate.'
        },
        {
          question: 'Can I request certificates online?',
          answer: 'Yes! You can submit your certificate request through our website. Simply click on "Request Certificate" on the homepage and fill out the form.'
        },
        {
          question: 'How much do certificates cost?',
          answer: 'Barangay Clearance costs ₱50, Certificate of Indigency is free, and Certificate of Residency costs ₱30.'
        }
      ]
    },
    {
      category: 'Health Services',
      questions: [
        {
          question: 'What are the health center operating hours?',
          answer: 'The health center is open Monday to Friday, 8:00 AM to 5:00 PM. Emergency services are available 24/7.'
        },
        {
          question: 'How do I book a health appointment?',
          answer: 'You can book appointments online through our website or call (02) 8123-4567. Walk-ins are also welcome but may have longer wait times.'
        },
        {
          question: 'Are vaccinations free?',
          answer: 'Yes, all government-mandated vaccines are provided free of charge to qualified residents.'
        },
        {
          question: 'Do you offer dental services?',
          answer: 'Yes, we have dental services available every Tuesday and Thursday from 9:00 AM to 4:00 PM.'
        }
      ]
    },
    {
      category: 'Permits & Clearances',
      questions: [
        {
          question: 'What is required for a Business Permit?',
          answer: 'Requirements include: Barangay Clearance, DTI/SEC registration, Lease contract, and valid ID. Additional documents may be required depending on business type.'
        },
        {
          question: 'How do I apply for a Building Permit?',
          answer: 'Submit architectural plans, lot title or proof of ownership, Barangay Clearance, and Engineering plans to the Barangay Hall.'
        },
        {
          question: 'Can I renew my Business Permit online?',
          answer: 'Currently, renewals must be done in person at the Barangay Hall. Online renewal is being developed.'
        }
      ]
    },
    {
      category: 'General Information',
      questions: [
        {
          question: 'What are the office hours of Barangay Hall?',
          answer: 'The Barangay Hall is open Monday to Friday, 8:00 AM to 5:00 PM. We are closed on weekends and holidays.'
        },
        {
          question: 'How can I file a complaint?',
          answer: 'You can file complaints in person at the Barangay Hall, through our website\'s contact form, or by calling our hotline at (02) 8123-4567.'
        },
        {
          question: 'Where can I park when visiting the Barangay Hall?',
          answer: 'Parking is available in front of the Barangay Hall and at the designated parking area near the health center.'
        },
        {
          question: 'How do I become a resident of Barangay NIT?',
          answer: 'Visit the Barangay Hall with proof of residency (rental contract or property title), valid ID, and fill out the resident registration form.'
        }
      ]
    }
  ];

  const toggleAccordion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQ based on search
  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="container">
          <div className="faq-hero-icon">
            <HelpCircle size={48} />
          </div>
          <h1 className="faq-hero-title">Frequently Asked Questions</h1>
          <p className="faq-hero-subtitle">Find answers to common questions about our services</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="faq-search-section">
        <div className="container">
          <div className="faq-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faq-search-input"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="faq-content-section">
        <div className="container">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((category, categoryIndex) => (
              <div key={categoryIndex} className="faq-category">
                <h2 className="faq-category-title">{category.category}</h2>
                <div className="faq-accordion">
                  {category.questions.map((item, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === index;

                    return (
                      <div key={questionIndex} className="faq-item">
                        <button
                          className={`faq-question ${isOpen ? 'active' : ''}`}
                          onClick={() => toggleAccordion(categoryIndex, questionIndex)}
                        >
                          <span>{item.question}</span>
                          <ChevronDown 
                            size={20} 
                            className={`faq-chevron ${isOpen ? 'rotate' : ''}`} 
                          />
                        </button>
                        <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No questions found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="faq-cta-section">
        <div className="container">
          <div className="faq-cta">
            <h2 className="faq-cta-title">Still have questions?</h2>
            <p className="faq-cta-text">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <a href="/contact" className="faq-cta-btn">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;