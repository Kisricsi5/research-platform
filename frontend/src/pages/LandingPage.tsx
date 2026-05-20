import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Search, FileText, Bell, CheckCircle, ArrowRight, FlaskConical, Microscope, Brain, Dna } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
            <FlaskConical className="h-4 w-4" />
            <span>The research discovery platform for universities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Find your place in
            <br />
            <span className="text-teal-300">cutting-edge research</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-200 max-w-2xl mx-auto mb-10">
            ResearchBridge connects ambitious students with professors who need talented research assistants. Discover opportunities, apply directly, and launch your research career.
          </p>

          {user ? (
            <Link
              to={user.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard'}
              className="btn-primary btn-lg bg-white text-primary-700 hover:bg-primary-50 focus:ring-white"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?role=student" className="btn-lg bg-white text-primary-700 hover:bg-primary-50 rounded-lg inline-flex items-center justify-center gap-2 font-semibold transition-all">
                <GraduationCap className="h-5 w-5" />
                I'm a Student
              </Link>
              <Link to="/signup?role=professor" className="btn-lg bg-primary-600 border-2 border-white/30 text-white hover:bg-primary-500 rounded-lg inline-flex items-center justify-center gap-2 font-semibold transition-all">
                <BookOpen className="h-5 w-5" />
                I'm a Professor
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { label: 'Research Fields', value: '50+' },
            { label: 'Universities', value: '200+' },
            { label: 'Students Placed', value: '1,000+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-primary-600">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-2">Get connected in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Search, title: 'Discover', desc: 'Browse professor profiles and research projects. Filter by department, research area, or skills.' },
              { step: '02', icon: FileText, title: 'Apply', desc: 'Submit a tailored cover letter and your CV directly through the platform.' },
              { step: '03', icon: Bell, title: 'Connect', desc: "Receive updates on your application status and get contacted by professors." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <div className="text-xs font-bold text-primary-400 tracking-widest mb-1">STEP {step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for both sides */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Students */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-600 rounded-xl p-2.5">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Students</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Browse and filter 1,000+ professor profiles',
                  'View detailed research project descriptions',
                  'Submit applications with cover letters',
                  'Track all your applications in one place',
                  'Get notified when your status changes',
                  "Save professors you're interested in",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="btn-primary mt-6 inline-flex">
                Sign up as Student <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Professors */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-600 rounded-xl p-2.5">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Professors</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Create a detailed research lab profile',
                  'Post specific research opportunities',
                  'Receive structured applications with CVs',
                  'Filter applicants by major, GPA, and skills',
                  'Manage all applications in one dashboard',
                  'Accept, reject, or request interviews',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="btn-lg bg-teal-600 text-white hover:bg-teal-700 rounded-lg inline-flex items-center gap-2 font-medium transition-all mt-6 px-5 py-2.5 text-sm">
                Sign up as Professor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Research areas on the platform</h2>
          <p className="text-gray-500 mb-8">From computer science to life sciences and everything in between</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Machine Learning', 'Cell Biology', 'Neuroscience', 'Quantum Computing', 'Climate Science', 'CRISPR / Gene Editing', 'NLP', 'Robotics', 'Public Health', 'Data Science', 'Materials Science', 'Cognitive Psychology', 'Astrophysics', 'Drug Discovery', 'Computer Vision'].map((area) => (
              <span key={area} className="badge-blue text-sm px-3 py-1">{area}</span>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-10">
            <Link to="/professors" className="btn-primary btn-lg">Browse Professors</Link>
            <Link to="/projects" className="btn-secondary btn-lg">Browse Projects</Link>
          </div>
        </div>
      </section>

      {/* Icons decoration */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-8 opacity-20">
            <Microscope className="h-12 w-12 text-primary-600" />
            <Brain className="h-12 w-12 text-primary-600" />
            <Dna className="h-12 w-12 text-primary-600" />
            <FlaskConical className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to advance your research journey?
          </h2>
          <p className="text-gray-500 mb-8">Join thousands of students and professors already on the platform.</p>
          <Link to="/signup" className="btn-primary btn-lg">
            Get Started — It's Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
