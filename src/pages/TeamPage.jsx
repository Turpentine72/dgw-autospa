import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useSettings from '../hooks/useSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Icons (kept as you had them)
const UsersIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const WrenchIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const StarIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>);
const BriefcaseIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const AwardIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const CarIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M9 5h6m-3 7v6m-4-4h8M4 17h16a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>);
const UserPlusIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>);
const MailIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const PhoneIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);
const ArrowRightIcon = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>);

const getIcon = (iconName) => {
  const icons = { Users: UsersIcon, Wrench: WrenchIcon, Star: StarIcon, Briefcase: BriefcaseIcon, Award: AwardIcon, Car: CarIcon };
  return icons[iconName] || UsersIcon;
};

function TeamPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState([]);
  const abortRef = useRef(null);
  const { business } = useSettings();

  const fetchTeam = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${API_BASE_URL}/api/team`, { signal: controller.signal });
      const data = await response.json();
      if (data.success && data.data) {
        const formattedTeam = data.data.map(member => ({
          id: member._id,
          name: member.name,
          role: member.role,
          description: member.description || '',
          image: member.image,
          email: member.email,
          phone: member.phone,
          order: member.order
        }));
        formattedTeam.sort((a, b) => (a.order || 999) - (b.order || 999));
        setTeamMembers(formattedTeam);
      }
      if (data.stats && Array.isArray(data.stats)) {
        setStats(data.stats);
      } else {
        setStats([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching team data:', error);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
    return () => abortRef.current?.abort();
  }, [fetchTeam]);

  const handleEmailClick = (e, email) => {
    e.preventDefault();
    const to = email || business.email;
    const subject = email ? 'Inquiry%20about%20DGW%20Autospa%20Services' : 'Job%20Application%20-%20DGW%20Autospa';
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}`, "_blank");
  };

  const handlePhoneClick = (e, phone) => {
    e.preventDefault();
    window.location.href = `tel:${(phone || business.phone).replace(/\s/g, '')}`;
  };

  return (
    <>
      <SEO title="Our Team | DGW Autospa - Meet the Automotive Experts in Lagos" description="Meet our team of certified automotive experts at DGW Autospa. Professional technicians dedicated to providing exceptional auto care in Lagos." />
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        {/* Hero section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              OUR TEAM
            </div>
            <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              MEET THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">EXPERTS</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Our skilled professionals bring years of experience and passion to every vehicle they service.
            </p>
          </div>
        </section>

        {/* Stats section – fully dynamic, no hardcoded values */}
        {stats.length > 0 && (
          <section className="px-4 pb-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => {
                  const IconComponent = getIcon(stat.iconName);
                  return (
                    <div key={stat.id} className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-blue-800/50 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/60 hover:-translate-y-1">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500/20 text-blue-300 mb-4"><IconComponent className="w-8 h-8" /></div>
                      <h3 id='hero-head'  className="text-4xl font-bold text-white mb-2">{stat.number}</h3>
                      <p className="text-blue-200 font-medium mb-1">{stat.label}</p>
                      <p className="text-blue-300 text-sm">{stat.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Team members grid */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 id='hero-head' className="text-3xl md:text-4xl font-bold text-white mb-4">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">Professionals</span></h2>
              <p className="text-blue-200 max-w-2xl mx-auto">Each team member brings unique expertise and dedication to ensure your vehicle receives the best care possible.</p>
            </div>

            {teamMembers.length === 0 ? (
              <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-12 text-center border border-blue-500/30">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 text-blue-300 mb-4"><UserPlusIcon className="w-10 h-10" /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Team Coming Soon</h3>
                <p className="text-blue-200 max-w-md mx-auto">Our team of automotive experts is being assembled. Check back soon to meet the professionals who will take care of your vehicle.</p>
                <Link to="/contact" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all">Contact Us for Inquiries</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member) => (
                  <div key={member.id} className="group relative overflow-hidden rounded-2xl bg-blue-800/30 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-80 overflow-hidden bg-gradient-to-br from-blue-700 to-blue-800">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center"><UsersIcon className="w-16 h-16 text-blue-400 mx-auto mb-2" /><p className="text-blue-300 text-sm">{member.name}</p></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent" />
                    </div>
                    <div className="p-6 relative z-10">
                      <h3 id='hero-head' className="text-xl font-bold text-white mb-1">{member.name}</h3>
                      <p className="text-blue-300 font-medium mb-3">{member.role}</p>
                      <p className="text-blue-200 text-sm leading-relaxed">{member.description}</p>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-xs mt-3 transition-colors"><MailIcon className="w-3 h-3" /> {member.email}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50"><span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>JOIN OUR TEAM</div>
            <h2 id='hero-head' className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">WANT TO JOIN<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">OUR TEAM?</span></h2>
            <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">We're always looking for talented individuals who share our passion for automotive excellence.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button onClick={(e) => handleEmailClick(e, null)} className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1"><MailIcon className="w-5 h-5" /><span>Send Your Resume</span><ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
              <button onClick={(e) => handlePhoneClick(e, null)} className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-800/30 border border-blue-500/30 text-white font-bold rounded-full hover:bg-blue-800/50 transition-all duration-300 hover:-translate-y-1"><PhoneIcon className="w-5 h-5" /><span>Call Us</span></button>
            </div>
            <p className="text-blue-300 text-sm">{business.email} • {business.phone}</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default TeamPage;