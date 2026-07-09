import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../../components/layout/Layout';

function StaticShell({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <Layout>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="display text-3xl sm:text-4xl">{title}</h1>
          {updated && <p className="text-sm text-gray-500 mt-3">Last updated: {updated}</p>}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:mb-2 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:text-[15px] [&_ul]:text-gray-600 [&_ul]:text-[15px] [&_ul]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          {children}
        </div>
      </div>
    </Layout>
  );
}

export function AboutPage() {
  return (
    <StaticShell title="About Labyro">
      <section>
        <h2>What we're building</h2>
        <p>
          Labyro is a platform that connects university students with research
          opportunities posted by professors, labs, and academic organizations. Students
          discover openings that match their field, skills, and availability — and apply
          with a structured profile instead of a cold email. Labs receive applications
          they can actually compare, and manage their pipeline in one place.
        </p>
      </section>
      <section>
        <h2>Why</h2>
        <p>
          Research experience shapes careers, yet finding it still runs on cold emails and
          word of mouth. Talented students miss opportunities they never heard about;
          professors sift through unstructured inquiries. We think the process deserves
          real infrastructure — clear listings, comparable applications, and honest
          communication about deadlines and expectations.
        </p>
      </section>
      <section>
        <h2>Where we are</h2>
        <p>
          Labyro is young and growing lab by lab. If you're a professor or lab
          coordinator interested in being one of our founding labs — or a student with
          feedback — we'd genuinely love to hear from you at{' '}
          <a href="mailto:peocz55@gmail.com" className="text-primary-600 font-medium hover:underline">peocz55@gmail.com</a>.
        </p>
      </section>
      <div className="pt-4">
        <Link to="/signup" className="btn-primary">
          Join Labyro <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </StaticShell>
  );
}

export function PrivacyPage() {
  return (
    <StaticShell title="Privacy Policy" updated="July 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          When you create an account we collect your email address and password (stored
          hashed, never in plain text). If you build a profile, we store the information
          you choose to add — such as your name, university, major, GPA, skills, research
          interests, bio, and CV — so it can be shared with the labs you apply to.
        </p>
      </section>
      <section>
        <h2>How your information is used</h2>
        <ul>
          <li>Student profile details and CVs are shown to professors only when you apply to their opening.</li>
          <li>Professor and lab profiles are visible to users browsing the platform.</li>
          <li>Your email is used for account access and notifications about your applications or postings.</li>
        </ul>
      </section>
      <section>
        <h2>What we don't do</h2>
        <ul>
          <li>We don't sell your personal information.</li>
          <li>We don't share your profile with anyone outside the application process you initiate.</li>
          <li>We don't use your data for advertising.</li>
        </ul>
      </section>
      <section>
        <h2>Your control</h2>
        <p>
          You can edit your profile at any time. To delete your account and its data,
          email us at{' '}
          <a href="mailto:peocz55@gmail.com" className="text-primary-600 font-medium hover:underline">peocz55@gmail.com</a>{' '}
          and we'll remove it.
        </p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>
          This policy will evolve as the platform grows. Questions or concerns:{' '}
          <a href="mailto:peocz55@gmail.com" className="text-primary-600 font-medium hover:underline">peocz55@gmail.com</a>.
        </p>
      </section>
    </StaticShell>
  );
}

export function TermsPage() {
  return (
    <StaticShell title="Terms of Service" updated="July 2026">
      <section>
        <h2>The service</h2>
        <p>
          Labyro connects students with research opportunities posted by professors,
          labs, and academic organizations. Accounts are free. By using the platform you
          agree to these terms.
        </p>
      </section>
      <section>
        <h2>Your account</h2>
        <ul>
          <li>Provide accurate information in your profile and postings.</li>
          <li>You're responsible for activity under your account — keep your password safe.</li>
          <li>One person, one account.</li>
        </ul>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Post only genuine research opportunities and genuine applications.</li>
          <li>No harassment, spam, scraping, or misrepresenting your identity or affiliation.</li>
          <li>We may remove content or suspend accounts that violate these rules.</li>
        </ul>
      </section>
      <section>
        <h2>Content</h2>
        <p>
          You keep ownership of what you post. By posting, you give us permission to display
          it on the platform as part of providing the service.
        </p>
      </section>
      <section>
        <h2>Disclaimer</h2>
        <p>
          Labyro facilitates introductions between students and labs; the research
          relationships themselves — including any compensation, credit, or supervision —
          are between you and the other party. The service is provided "as is" while we
          grow and improve it.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms:{' '}
          <a href="mailto:peocz55@gmail.com" className="text-primary-600 font-medium hover:underline">peocz55@gmail.com</a>.
        </p>
      </section>
    </StaticShell>
  );
}
