import { useState, useEffect } from 'react';

const API_BASE = '/api';

const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconJobs = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconApps = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconPipeline = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconInterviews = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconFeedback = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>;
const IconAlerts = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  const [jobs, setJobs] = useState<any[]>([]);
  const [showArchivedJobs, setShowArchivedJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stalled, setStalled] = useState<any[]>([]);

  // Job Modals State
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', department: '', description: '' });
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [createJobError, setCreateJobError] = useState('');

  // App Details State
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [appError, setAppError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Feedback Modal State
  const [feedbackModalInterview, setFeedbackModalInterview] = useState<any>(null);
  const [feedbackMode, setFeedbackMode] = useState<'view' | 'create' | 'edit'>('create');
  const [feedbackTechnical, setFeedbackTechnical] = useState(5);
  const [feedbackCommunication, setFeedbackCommunication] = useState(5);
  const [feedbackProblemSolving, setFeedbackProblemSolving] = useState(5);
  const [feedbackRoleSpecific, setFeedbackRoleSpecific] = useState(5);
  const [feedbackRecommendation, setFeedbackRecommendation] = useState('HIRE');
  const [feedbackStrengths, setFeedbackStrengths] = useState('');
  const [feedbackConcerns, setFeedbackConcerns] = useState('');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Interviewers List
  const [interviewers, setInterviewers] = useState<any[]>([]);

  // Advance to INTERVIEW State
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [advanceInterviewerId, setAdvanceInterviewerId] = useState('');
  const [advanceScheduledAt, setAdvanceScheduledAt] = useState('');
  const [advanceRoundTitle, setAdvanceRoundTitle] = useState('');
  const [advanceError, setAdvanceError] = useState('');

  // Additional Interview State
  const [showAdditionalInterviewModal, setShowAdditionalInterviewModal] = useState(false);
  const [additionalInterviewerId, setAdditionalInterviewerId] = useState('');
  const [additionalScheduledAt, setAdditionalScheduledAt] = useState('');
  const [additionalRoundTitle, setAdditionalRoundTitle] = useState('');
  const [additionalInterviewError, setAdditionalInterviewError] = useState('');
  const [isAdditionalInterviewLoading, setIsAdditionalInterviewLoading] = useState(false);

  // Global Interviews State
  const [globalInterviews, setGlobalInterviews] = useState<any[]>([]);
  const [globalInterviewsError, setGlobalInterviewsError] = useState('');
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);

  // App filters
  const [appSearch, setAppSearch] = useState('');
  const [appStage, setAppStage] = useState('');
  const [appJobId, setAppJobId] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [showArchivedApps, setShowArchivedApps] = useState(false);

  // Archive State
  const [archiveConfirmApp, setArchiveConfirmApp] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  // Job Archive State
  const [archiveConfirmJob, setArchiveConfirmJob] = useState<any>(null);
  const [isArchivingJob, setIsArchivingJob] = useState(false);
  const [archiveJobError, setArchiveJobError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`)
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.id) {
          setUser(data);
          setView('dashboard');
        }
      })
      .catch(() => { });
  }, []);

  const login = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value })
    });
    const data = await res.json();
    setIsLoading(false);
    if (res.ok && data.id) {
      setUser(data);
      setView('dashboard');
    } else {
      alert(data.error || 'Login failed');
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    setUser(null);
    setView('login');
  };

  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    setDashboardError('');
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (res.ok) {
        setDashboard(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        setDashboardError(err.error || `Failed to load dashboard metrics (${res.status})`);
      }
    } catch (e: any) {
      setDashboardError(e.message || 'Network error while loading dashboard');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadJobs = async () => {
    const res = await fetch(`${API_BASE}/jobs?showArchived=${showArchivedJobs}`);
    if (res.ok) setJobs(await res.json());
  };

  useEffect(() => {
    if (view === 'jobs') {
      loadJobs();
    }
  }, [view, showArchivedJobs]);

  const loadJobApplications = async (jobId: string) => {
    const res = await fetch(`${API_BASE}/applications?jobId=${encodeURIComponent(jobId)}`);
    if (res.ok) {
      const data = await res.json();
      setJobApplications(data.data || []);
    }
  };

  useEffect(() => {
    if (selectedJob) {
      loadJobApplications(selectedJob.id);
    } else {
      setJobApplications([]);
    }
  }, [selectedJob]);

  const loadApplications = async () => {
    let url = `${API_BASE}/applications?`;
    if (appSearch) url += `search=${encodeURIComponent(appSearch)}&`;
    if (appStage) url += `stage=${encodeURIComponent(appStage)}&`;
    if (appJobId) url += `jobId=${encodeURIComponent(appJobId)}&`;
    if (showArchivedApps) url += `showArchived=true&`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setApplications(data.data || []);
      setSelectedAppIds([]);
    }
  };

  const loadGlobalInterviews = async () => {
    setIsLoadingInterviews(true);
    setGlobalInterviewsError('');
    try {
      const res = await fetch(`${API_BASE}/interviews`);
      if (res.ok) {
        const data = await res.json();
        setGlobalInterviews(data.interviews || []);
      } else {
        setGlobalInterviewsError(`Failed to load interviews (${res.status})`);
      }
    } catch (err: any) {
      setGlobalInterviewsError(err.message || 'Network error');
    } finally {
      setIsLoadingInterviews(false);
    }
  };

  const loadApplicationDetails = async (id: string) => {
    setIsAppLoading(true);
    setAppError('');
    setSelectedApplication({});
    try {
      const res = await fetch(`${API_BASE}/applications/${id}`);
      if (res.ok) {
        setSelectedApplication(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setAppError('Access denied: You are not assigned to this application.');
        } else if (res.status === 404) {
          setAppError('Candidate application not found.');
        } else {
          setAppError(err.error || 'Unable to load candidate details. Please try again.');
        }
      }
    } catch (e: any) {
      setAppError(e.message || 'Unable to load candidate details. Please try again.');
    } finally {
      setIsAppLoading(false);
    }
  };

  const openFeedbackModal = (interview: any, mode: 'view' | 'create' | 'edit') => {
    setFeedbackModalInterview(interview);
    setFeedbackMode(mode);
    setFeedbackError('');
    setFeedbackSuccess('');

    if (interview.feedback) {
      setFeedbackTechnical(interview.feedback.technicalSkillsRating ?? 5);
      setFeedbackCommunication(interview.feedback.communicationSkillsRating ?? 5);
      setFeedbackProblemSolving(interview.feedback.problemSolvingRating ?? 5);
      setFeedbackRoleSpecific(interview.feedback.roleSpecificSkillsRating ?? 5);
      setFeedbackRecommendation(interview.feedback.recommendation ?? 'HIRE');
      setFeedbackStrengths(interview.feedback.strengths ?? '');
      setFeedbackConcerns(interview.feedback.concerns ?? '');
      setFeedbackComments(interview.feedback.comments ?? '');
    } else {
      setFeedbackTechnical(5);
      setFeedbackCommunication(5);
      setFeedbackProblemSolving(5);
      setFeedbackRoleSpecific(5);
      setFeedbackRecommendation('HIRE');
      setFeedbackStrengths('');
      setFeedbackConcerns('');
      setFeedbackComments('');
    }
  };


  const handleSubmitFeedback = async () => {
    if (!feedbackStrengths.trim()) {
      setFeedbackError('Strengths are required.');
      return;
    }
    if (!feedbackConcerns.trim()) {
      setFeedbackError('Concerns / areas for improvement are required.');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const method = feedbackMode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(`${API_BASE}/interviews/${feedbackModalInterview.id}/feedback`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicalSkillsRating: feedbackTechnical,
          communicationSkillsRating: feedbackCommunication,
          problemSolvingRating: feedbackProblemSolving,
          roleSpecificSkillsRating: feedbackRoleSpecific,
          recommendation: feedbackRecommendation,
          strengths: feedbackStrengths,
          concerns: feedbackConcerns,
          comments: feedbackComments
        })
      });

      if (res.ok) {
        setFeedbackSuccess('Feedback saved successfully!');
        await loadGlobalInterviews();
        loadDashboard();
        if (selectedApplication) {
          loadApplicationDetails(selectedApplication.id);
        }
        setTimeout(() => {
          setFeedbackModalInterview(null);
        }, 600);
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedbackError(err.error || 'Failed to submit feedback');
      }
    } catch (e: any) {
      setFeedbackError(e.message || 'Network error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleBulkAction = async (action: 'advance' | 'reject') => {
    if (selectedAppIds.length === 0) return;
    
    let nextStage;
    let notes = '';

    if (action === 'reject') {
      const input = window.prompt("Reason for rejection (optional):");
      if (input === null) return;
      notes = input;
    } else {
      const stageStr = window.prompt("Enter next stage (SCREENING, INTERVIEW, OFFER, HIRED):");
      if (!stageStr) return;
      nextStage = stageStr.toUpperCase();
      if (!['SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].includes(nextStage)) {
        alert("Invalid stage");
        return;
      }
      if (nextStage === 'INTERVIEW') {
        alert("Bulk advancing to INTERVIEW requires interviewer assignment and schedule, which is not supported in bulk mode. Please advance individually.");
        return;
      }
      const input = window.prompt("Notes (optional):");
      if (input !== null) notes = input;
    }

    const payloadApps = selectedAppIds.map(id => {
      const app = applications.find(a => a.id === id);
      return { id, expectedVersion: app.version };
    });

    const payload: any = { applications: payloadApps, notes };
    if (action === 'advance') {
      payload.nextStage = nextStage;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/applications/bulk/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        let successCount = 0;
        let failCount = 0;
        data.results.forEach((r: any) => r.success ? successCount++ : failCount++);
        alert(`Bulk ${action} complete.\nSuccess: ${successCount}\nFailed: ${failCount}`);
        loadApplications();
        loadDashboard();
      } else {
        alert(data.error || `Bulk ${action} failed`);
      }
    } catch (err) {
      alert("Network error");
    }
    setIsLoading(false);
  };

  const handleAppAction = async (action: string, payload: any) => {
    if (!selectedApplication) return;
    setIsActionLoading(true);
    setActionError('');
    const res = await fetch(`${API_BASE}/applications/${selectedApplication.id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      await loadApplicationDetails(selectedApplication.id);
      loadApplications();
      loadDashboard();
    } else {
      setActionError((await res.json()).error || `Failed to ${action} application`);
    }
    setIsActionLoading(false);
  };

  const loadInterviewers = async () => {
    const res = await fetch(`${API_BASE}/auth/interviewers`);
    if (res.ok) setInterviewers(await res.json());
  };

  const loadStalled = async () => {
    const res = await fetch(`${API_BASE}/applications/stalled`);
    if (res.ok) {
      const data = await res.json();
      setStalled(data.applications || []);
    }
  };

  const exportCsv = async () => {
    setIsExporting(true);
    window.open(`${API_BASE}/csv`, '_blank');
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateJobError('');
    setIsCreatingJob(true);

    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });

    setIsCreatingJob(false);
    if (res.ok) {
      loadJobs();
      setShowCreateJob(false);
      setNewJob({ title: '', department: '', description: '' });
    } else {
      const err = await res.json();
      setCreateJobError(err.error || 'Failed to create job');
    }
  };

  const handleArchiveJob = async (job: any) => {
    setIsArchivingJob(true);
    setArchiveJobError('');
    try {
      const res = await fetch(`${API_BASE}/jobs/${job.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setArchiveConfirmJob(null);
        if (selectedJob && selectedJob.id === job.id) {
          setSelectedJob(null);
        }
        loadJobs();
        loadDashboard();
      } else {
        const data = await res.json();
        setArchiveJobError(data.error || 'Failed to archive job');
      }
    } catch (err: any) {
      setArchiveJobError(err.message || 'Network error');
    } finally {
      setIsArchivingJob(false);
    }
  };

  const handleRestoreJob = async (job: any) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${job.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        if (selectedJob && selectedJob.id === job.id) {
          setSelectedJob({ ...selectedJob, status: 'OPEN' });
        }
        loadJobs();
        loadDashboard();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to restore job');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const handleRestoreApp = async (app: any) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${app.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Restored via recruiter dashboard' })
      });
      if (res.ok) {
        if (selectedApplication && selectedApplication.id === app.id) {
          await loadApplicationDetails(app.id);
        }
        loadApplications();
        loadDashboard();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to restore application');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  useEffect(() => {
    if (user && user.role === 'INTERVIEWER' && view !== 'dashboard' && view !== 'interviews') {
      setView('dashboard');
    }
  }, [user, view]);

  useEffect(() => {
    if (!user) return;
    if (view === 'dashboard') loadDashboard();
    if (view === 'jobs' && user.role === 'RECRUITER') loadJobs();
    if ((view === 'applications' || view === 'pipeline') && user.role === 'RECRUITER') {
      loadApplications();
      if (jobs.length === 0) loadJobs();
    }
    if (view === 'alerts' && user.role === 'RECRUITER') loadStalled();
    if (view === 'interviews') loadGlobalInterviews();
    if (user.role === 'RECRUITER' && interviewers.length === 0) loadInterviewers();
  }, [view, user, appSearch, appStage, appJobId, showArchivedApps]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
              <IconDashboard />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
            <p className="text-sm text-gray-500 mt-2">Manage candidates, interviews, and hiring stages.</p>
          </div>
          <form onSubmit={login} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" placeholder="you@company.com" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" placeholder="••••••••" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderApplicationModals = () => {
    return (
      <>
        {selectedApplication && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isAppLoading ? 'Loading Candidate...' : selectedApplication.candidateName || 'Candidate Details'}
                  </h3>
                  {selectedApplication.candidateEmail && (
                    <p className="text-sm text-gray-500 mt-1">{selectedApplication.candidateEmail}</p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedApplication(null); setAppError(''); setActionError(''); }}
                  className="text-gray-400 hover:text-gray-500 bg-gray-100 p-2 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {isAppLoading && <div className="py-12 text-center text-gray-500">Loading candidate details...</div>}
              {appError && (
                <div className="py-6 px-4 text-center">
                  <div className="mx-auto w-10 h-10 text-red-500 mb-2 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                    {appError}
                  </p>
                </div>
              )}
              {actionError && <div className="py-3 px-4 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{actionError}</div>}

              {!isAppLoading && !appError && selectedApplication.id && (
                <div className="space-y-6 flex-1">
                  {/* Recruiter Actions Only */}
                  {user.role === 'RECRUITER' && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Recruiter Actions
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedApplication.status === 'ACTIVE' && (
                          <>
                            {['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].indexOf(selectedApplication.currentStage) < 4 && (
                              selectedApplication.currentStage === 'SCREENING' ? (
                                <button
                                  onClick={() => {
                                    setAdvanceNotes('');
                                    setAdvanceInterviewerId('');
                                    setAdvanceScheduledAt('');
                                    setAdvanceRoundTitle('');
                                    setAdvanceError('');
                                    setShowAdvanceModal(true);
                                  }}
                                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Advance to INTERVIEW
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAppAction('advance', {
                                    expectedVersion: selectedApplication.version,
                                    nextStage: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'][['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].indexOf(selectedApplication.currentStage) + 1]
                                  })}
                                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Advance to {['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'][['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].indexOf(selectedApplication.currentStage) + 1]}
                                </button>
                              )
                            )}
                            <button
                              disabled={isActionLoading}
                              onClick={() => {
                                const notes = window.prompt("Reason for rejection (optional):");
                                if (notes !== null) handleAppAction('reject', { expectedVersion: selectedApplication.version, notes });
                              }}
                              className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors shadow-sm"
                            >
                              Reject Candidate
                            </button>
                            <button
                              disabled={isActionLoading}
                              onClick={() => {
                                setArchiveConfirmApp(selectedApplication);
                                setArchiveError('');
                              }}
                              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                            >
                              Archive Application
                            </button>
                          </>
                        )}
                        {selectedApplication.status === 'REJECTED' && (
                          <button
                            disabled={isActionLoading}
                            onClick={() => {
                              const notes = window.prompt("Reason for reinstating (optional):");
                              if (notes !== null) handleAppAction('reinstate', { expectedVersion: selectedApplication.version, notes });
                            }}
                            className="px-4 py-2 bg-white border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            Reinstate Candidate
                          </button>
                        )}
                        {selectedApplication.status === 'ARCHIVED' && (
                          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                              <span>This application is <strong>ARCHIVED</strong>. Historical data is preserved, but active recruitment workflow actions are disabled.</span>
                            </div>
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleRestoreApp(selectedApplication)}
                              className="px-3 py-1.5 bg-white border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 disabled:opacity-50 whitespace-nowrap shadow-sm"
                            >
                              Restore Application
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Application Info</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date Applied</span>
                          <span className="text-sm font-medium text-gray-900">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Stage</span>
                          <span className="text-sm font-medium text-gray-900">{selectedApplication.currentStage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedApplication.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            selectedApplication.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedApplication.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Source</span>
                          <span className="text-sm font-medium text-gray-900">{selectedApplication.source}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Opening</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Title</span>
                          <span className="text-sm font-medium text-gray-900">{selectedApplication.job?.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Department</span>
                          <span className="text-sm font-medium text-gray-900">{selectedApplication.job?.department}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Description</span>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-3">{selectedApplication.job?.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Interviews {selectedApplication.interviews?.length ? `(${selectedApplication.interviews.length})` : ''}
                      </h4>
                      {user.role === 'RECRUITER' && selectedApplication.currentStage === 'INTERVIEW' && selectedApplication.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setAdditionalInterviewerId('');
                            setAdditionalScheduledAt('');
                            setAdditionalRoundTitle('');
                            setAdditionalInterviewError('');
                            setShowAdditionalInterviewModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Schedule Another Interview
                        </button>
                      )}
                    </div>

                    {['APPLIED', 'SCREENING'].includes(selectedApplication.currentStage) || (!selectedApplication.interviews || selectedApplication.interviews.length === 0) ? (
                      <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center border border-gray-100">No interview scheduled or assigned.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedApplication.interviews.map((interview: any) => {
                          const isFuture = new Date(interview.scheduledAt) > new Date();
                          const hasFeedback = !!interview.feedback || interview.status === 'COMPLETED';

                          let displayStatus = 'Scheduled';
                          if (hasFeedback) displayStatus = 'Completed';
                          else if (!isFuture) displayStatus = 'Awaiting Feedback';

                          const canGiveFeedback = !hasFeedback && !isFuture && user.id === interview.interviewerId;

                          return (
                            <div key={interview.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-3.5 border border-gray-200 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                  <IconInterviews />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900">{interview.roundTitle || 'Interview'}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${hasFeedback ? 'bg-indigo-100 text-indigo-800' : isFuture ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                                      {displayStatus}
                                    </span>
                                    {hasFeedback && interview.feedback && (
                                      <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Feedback: {interview.feedback.recommendation?.replace('_', ' ')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    Interviewer: <span className="font-medium text-gray-800">{interview.interviewer?.name || interview.interviewer?.email || 'Unassigned'}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(interview.scheduledAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {canGiveFeedback && (
                                  <button
                                    onClick={() => openFeedbackModal({ ...interview, application: selectedApplication }, 'create')}
                                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
                                  >
                                    Give Feedback
                                  </button>
                                )}
                                {interview.feedback && (
                                  <button
                                    onClick={() => openFeedbackModal({ ...interview, application: selectedApplication }, 'view')}
                                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                  >
                                    View Feedback
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Feedback</h4>
                    {(() => {
                      const structuredFeedbacks = (selectedApplication.interviews || []).filter((i: any) => i.feedback);
                      const historyFeedbacks = (selectedApplication.history || []).filter((h: any) => h.actionType === 'FEEDBACK_ADDED');

                      if (structuredFeedbacks.length === 0 && historyFeedbacks.length === 0) {
                        return <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center border border-gray-100">No feedback submitted yet.</p>;
                      }

                      return (
                        <div className="space-y-4">
                          {structuredFeedbacks.map((interview: any) => {
                            const fb = interview.feedback;
                            return (
                              <div key={fb.id} className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-3">
                                  <div>
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{interview.roundTitle || 'Interview Round'}</span>
                                    <p className="text-xs text-gray-500 mt-0.5">By {fb.interviewer?.email || 'Interviewer'} on {new Date(fb.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                      fb.recommendation === 'STRONG_HIRE' ? 'bg-green-100 text-green-800 border border-green-200' :
                                      fb.recommendation === 'HIRE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      fb.recommendation === 'NEUTRAL' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                      fb.recommendation === 'REJECT' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                      'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {fb.recommendation?.replace('_', ' ')}
                                    </span>
                                    {user.id === interview.interviewerId && (
                                      <button
                                        onClick={() => openFeedbackModal({ ...interview, application: selectedApplication }, 'edit')}
                                        className="text-xs text-indigo-600 hover:text-indigo-900 font-medium underline"
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
                                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="text-[11px] text-gray-500 block">Technical</span>
                                    <span className="text-xs font-bold text-indigo-700">{fb.technicalSkillsRating}/5</span>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="text-[11px] text-gray-500 block">Communication</span>
                                    <span className="text-xs font-bold text-indigo-700">{fb.communicationSkillsRating}/5</span>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="text-[11px] text-gray-500 block">Problem Solving</span>
                                    <span className="text-xs font-bold text-indigo-700">{fb.problemSolvingRating}/5</span>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="text-[11px] text-gray-500 block">Role-Specific</span>
                                    <span className="text-xs font-bold text-indigo-700">{fb.roleSpecificSkillsRating}/5</span>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                  <div>
                                    <strong className="text-gray-700 block">Strengths:</strong>
                                    <p className="text-gray-800 bg-gray-50 p-2 rounded mt-0.5 whitespace-pre-wrap">{fb.strengths}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700 block">Concerns:</strong>
                                    <p className="text-gray-800 bg-gray-50 p-2 rounded mt-0.5 whitespace-pre-wrap">{fb.concerns}</p>
                                  </div>
                                  {fb.comments && (
                                    <div>
                                      <strong className="text-gray-700 block">Comments:</strong>
                                      <p className="text-gray-800 bg-gray-50 p-2 rounded mt-0.5 whitespace-pre-wrap">{fb.comments}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Application History</h4>
                    <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                      {(selectedApplication.history || []).map((h: any) => (
                        <div key={h.id} className="relative">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full"></div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                            <p className="text-sm font-medium text-gray-900">
                              {h.actionType === 'CREATED' && 'Application Submitted'}
                              {h.actionType === 'STAGE_ADVANCED' && `Advanced to ${h.newStage}`}
                              {h.actionType === 'REJECTED' && 'Rejected'}
                              {h.actionType === 'REINSTATED' && 'Reinstated'}
                              {h.actionType === 'FEEDBACK_ADDED' && 'Feedback Added'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 sm:mt-0">{new Date(h.createdAt).toLocaleString()}</p>
                          </div>
                          {h.notes && h.actionType !== 'FEEDBACK_ADDED' && (
                            <p className="mt-1 text-sm text-gray-600">{h.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* Advance to INTERVIEW Modal */}
        {showAdvanceModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Advance Candidate to Interview</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Advancement <span className="text-red-500">*</span></label>
                  <textarea
                    value={advanceNotes}
                    onChange={e => setAdvanceNotes(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                    rows={3}
                    placeholder="E.g., Strong technical background, performed well in screening..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Interviewer <span className="text-red-500">*</span></label>
                  <select
                    value={advanceInterviewerId}
                    onChange={e => setAdvanceInterviewerId(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  >
                    <option value="">Select an interviewer...</option>
                    {interviewers.map(i => (
                      <option key={i.id} value={i.id}>{i.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Round / Title</label>
                  <input
                    type="text"
                    value={advanceRoundTitle}
                    onChange={e => setAdvanceRoundTitle(e.target.value)}
                    placeholder="E.g., Technical Interview, Initial Screening"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Interview <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={advanceScheduledAt}
                    onChange={e => setAdvanceScheduledAt(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  />
                </div>
              </div>

              {advanceError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                  {advanceError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!advanceNotes || !advanceInterviewerId || !advanceScheduledAt) {
                      setAdvanceError('All fields are required.');
                      return;
                    }

                    setIsActionLoading(true);
                    setAdvanceError('');
                    try {
                      const res = await fetch(`${API_BASE}/applications/${selectedApplication.id}/advance`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          expectedVersion: selectedApplication.version,
                          nextStage: 'INTERVIEW',
                          notes: advanceNotes,
                          interviewerId: advanceInterviewerId,
                          scheduledAt: advanceScheduledAt,
                          roundTitle: advanceRoundTitle || undefined
                        })
                      });

                      if (res.ok) {
                        setShowAdvanceModal(false);
                        await loadApplicationDetails(selectedApplication.id);
                        loadApplications();
                      } else {
                        const err = await res.json();
                        setAdvanceError(err.error || 'Failed to advance candidate');
                      }
                    } catch (err: any) {
                      setAdvanceError(err.message || 'Network error');
                    } finally {
                      setIsActionLoading(false);
                    }
                  }}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Advancing...' : 'Advance & Schedule Interview'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Interview Modal */}
        {showAdditionalInterviewModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Another Interview</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Interviewer <span className="text-red-500">*</span></label>
                  <select
                    value={additionalInterviewerId}
                    onChange={e => setAdditionalInterviewerId(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  >
                    <option value="">Select an interviewer...</option>
                    {interviewers.map(i => (
                      <option key={i.id} value={i.id}>{i.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Round Title</label>
                  <input
                    type="text"
                    value={additionalRoundTitle}
                    onChange={e => setAdditionalRoundTitle(e.target.value)}
                    placeholder="E.g., Round 2 Technical, System Design, HR"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date & Time <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={additionalScheduledAt}
                    onChange={e => setAdditionalScheduledAt(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  />
                </div>
              </div>

              {additionalInterviewError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                  {additionalInterviewError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAdditionalInterviewModal(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isAdditionalInterviewLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!additionalInterviewerId || !additionalScheduledAt) {
                      setAdditionalInterviewError('Interviewer and date/time are required.');
                      return;
                    }

                    setIsAdditionalInterviewLoading(true);
                    setAdditionalInterviewError('');
                    try {
                      const res = await fetch(`${API_BASE}/applications/${selectedApplication.id}/interviews`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          interviewerId: additionalInterviewerId,
                          scheduledAt: additionalScheduledAt,
                          roundTitle: additionalRoundTitle || undefined
                        })
                      });

                      if (res.ok) {
                        setShowAdditionalInterviewModal(false);
                        await loadApplicationDetails(selectedApplication.id);
                        loadApplications();
                      } else {
                        const err = await res.json();
                        setAdditionalInterviewError(err.error || 'Failed to schedule additional interview');
                      }
                    } catch (err: any) {
                      setAdditionalInterviewError(err.message || 'Network error');
                    } finally {
                      setIsAdditionalInterviewLoading(false);
                    }
                  }}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  disabled={isAdditionalInterviewLoading}
                >
                  {isAdditionalInterviewLoading ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {archiveConfirmApp && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="text-lg font-bold text-gray-900">Archive Application</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to archive the application for <strong>{archiveConfirmApp.candidateName}</strong>?
              </p>
              <p className="text-xs text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                The application will be removed from the active workflow but its history will be preserved.
              </p>

              {archiveError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                  {archiveError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setArchiveConfirmApp(null)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isArchiving}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsArchiving(true);
                    setArchiveError('');
                    try {
                      const res = await fetch(`${API_BASE}/applications/${archiveConfirmApp.id}/archive`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ notes: 'Archived via recruiter dashboard' })
                      });
                      if (res.ok) {
                        setArchiveConfirmApp(null);
                        if (selectedApplication && selectedApplication.id === archiveConfirmApp.id) {
                          await loadApplicationDetails(archiveConfirmApp.id);
                        }
                        loadApplications();
                        loadDashboard();
                      } else {
                        const err = await res.json();
                        setArchiveError(err.error || 'Failed to archive application');
                      }
                    } catch (err: any) {
                      setArchiveError(err.message || 'Network error');
                    } finally {
                      setIsArchiving(false);
                    }
                  }}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                >
                  {isArchiving ? 'Archiving...' : 'Confirm Archive'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Feedback Modal */}
        {feedbackModalInterview && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feedbackMode === 'view' ? 'Interview Feedback' : feedbackMode === 'edit' ? 'Edit Interview Feedback' : 'Submit Interview Feedback'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Candidate: <strong className="text-gray-800">{feedbackModalInterview.application?.candidateName || 'Unknown'}</strong> ({feedbackModalInterview.application?.candidateEmail || ''}) • Role: <strong className="text-gray-800">{feedbackModalInterview.application?.job?.title || 'Unknown Position'}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Round: <strong className="text-gray-700">{feedbackModalInterview.roundTitle || 'General Interview'}</strong> • Scheduled: {new Date(feedbackModalInterview.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setFeedbackModalInterview(null)}
                  className="text-gray-400 hover:text-gray-500 bg-gray-100 p-2 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {feedbackMode === 'view' && feedbackModalInterview.feedback ? (
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">Submitted by:</span>
                      <p className="text-sm font-semibold text-gray-800">{feedbackModalInterview.feedback.interviewer?.email || 'Interviewer'}</p>
                      <span className="text-xs text-gray-400">{new Date(feedbackModalInterview.feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block mb-1">Recommendation</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                        feedbackModalInterview.feedback.recommendation === 'STRONG_HIRE' ? 'bg-green-100 text-green-800 border border-green-200' :
                        feedbackModalInterview.feedback.recommendation === 'HIRE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        feedbackModalInterview.feedback.recommendation === 'NEUTRAL' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        feedbackModalInterview.feedback.recommendation === 'REJECT' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {feedbackModalInterview.feedback.recommendation.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skill Ratings (1 - 5)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="text-xs text-gray-600 block">Technical</span>
                        <span className="text-xl font-bold text-indigo-700">{feedbackModalInterview.feedback.technicalSkillsRating} / 5</span>
                      </div>
                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="text-xs text-gray-600 block">Communication</span>
                        <span className="text-xl font-bold text-indigo-700">{feedbackModalInterview.feedback.communicationSkillsRating} / 5</span>
                      </div>
                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="text-xs text-gray-600 block">Problem Solving</span>
                        <span className="text-xl font-bold text-indigo-700">{feedbackModalInterview.feedback.problemSolvingRating} / 5</span>
                      </div>
                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="text-xs text-gray-600 block">Role-Specific</span>
                        <span className="text-xl font-bold text-indigo-700">{feedbackModalInterview.feedback.roleSpecificSkillsRating} / 5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Key Strengths</h4>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                        {feedbackModalInterview.feedback.strengths}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Concerns / Areas for Improvement</h4>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                        {feedbackModalInterview.feedback.concerns}
                      </p>
                    </div>

                    {feedbackModalInterview.feedback.comments && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Additional Comments</h4>
                        <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                          {feedbackModalInterview.feedback.comments}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setFeedbackModalInterview(null)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {user.id === feedbackModalInterview.interviewerId && (
                      <button
                        type="button"
                        onClick={() => { setFeedbackMode('edit'); setFeedbackError(''); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm"
                      >
                        Edit Feedback
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {/* Overall Recommendation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overall Recommendation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={feedbackRecommendation}
                      onChange={e => setFeedbackRecommendation(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
                    >
                      <option value="STRONG_HIRE">Strong Hire</option>
                      <option value="HIRE">Hire</option>
                      <option value="NEUTRAL">Neutral</option>
                      <option value="REJECT">Reject</option>
                      <option value="STRONG_REJECT">Strong Reject</option>
                    </select>
                  </div>

                  {/* Rating Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Candidate Skill Ratings (1 = Poor, 5 = Excellent) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {[
                        { label: 'Technical Skills', val: feedbackTechnical, set: setFeedbackTechnical },
                        { label: 'Communication Skills', val: feedbackCommunication, set: setFeedbackCommunication },
                        { label: 'Problem Solving Ability', val: feedbackProblemSolving, set: setFeedbackProblemSolving },
                        { label: 'Role-Specific Skills', val: feedbackRoleSpecific, set: setFeedbackRoleSpecific }
                      ].map((skill, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-gray-700">
                            <span>{skill.label}</span>
                            <span className="text-indigo-600 font-bold">{skill.val} / 5</span>
                          </div>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => skill.set(n)}
                                className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${
                                  skill.val === n
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Strengths <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackStrengths}
                      onChange={e => setFeedbackStrengths(e.target.value)}
                      placeholder="Highlight what the candidate did well, technical depth, relevant accomplishments..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
                    />
                  </div>

                  {/* Concerns */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Concerns / Areas for Improvement <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackConcerns}
                      onChange={e => setFeedbackConcerns(e.target.value)}
                      placeholder="Note knowledge gaps, areas where they struggled, red flags..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
                    />
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComments}
                      onChange={e => setFeedbackComments(e.target.value)}
                      placeholder="Any additional context or notes for the hiring team..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
                    />
                  </div>

                  {feedbackError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                      {feedbackError}
                    </div>
                  )}

                  {feedbackSuccess && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
                      {feedbackSuccess}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setFeedbackModalInterview(null)}
                      disabled={feedbackLoading}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitFeedback}
                      disabled={feedbackLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50"
                    >
                      {feedbackLoading ? 'Saving...' : feedbackMode === 'edit' ? 'Save Changes' : 'Submit Feedback'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.role === 'RECRUITER' ? 'Dashboard Overview' : 'Interviewer Dashboard'}
              </h2>
              {user.role === 'RECRUITER' && (
                <button onClick={exportCsv} disabled={isExporting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-colors">
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
              )}
            </div>
            {isLoadingDashboard && !dashboard ? (
              <div className="h-48 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span className="text-gray-500 text-sm">Loading metrics...</span>
                </div>
              </div>
            ) : dashboardError ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
                <div className="mx-auto w-12 h-12 text-red-400 mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-red-900">Failed to load dashboard metrics</h3>
                <p className="mt-1 text-sm text-red-600">{dashboardError}</p>
                <button onClick={loadDashboard} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Retry
                </button>
              </div>
            ) : !dashboard ? (
              <div className="h-48 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                <span className="text-gray-500">No dashboard data available.</span>
              </div>
            ) : user.role === 'RECRUITER' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Applications</span>
                  <span className="text-4xl font-bold text-gray-900 mt-2">{dashboard.totalApplications}</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><IconAlerts /></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Stalled Applications</span>
                  <span className="text-4xl font-bold text-red-600 mt-2">{dashboard.stalledCount}</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Open Jobs</span>
                  <span className="text-4xl font-bold text-gray-900 mt-2">{dashboard.openJobs}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Interviewer Summary Cards: 1. Upcoming, 2. Today, 3. Completed */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Upcoming Interviews */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming Interviews</span>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <IconInterviews />
                      </div>
                    </div>
                    <span className="text-4xl font-bold text-blue-600 mt-3">{dashboard.upcomingInterviewsCount ?? 0}</span>
                    <span className="text-xs text-gray-500 mt-1">Future scheduled sessions</span>
                  </div>

                  {/* 2. Today's Interviews */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Interviews</span>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <IconInterviews />
                      </div>
                    </div>
                    <span className="text-4xl font-bold text-indigo-600 mt-3">{dashboard.todayInterviewsCount ?? 0}</span>
                    <span className="text-xs text-gray-500 mt-1">Scheduled for today</span>
                  </div>

                  {/* 3. Completed Interviews */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed Interviews</span>
                      <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <span className="text-4xl font-bold text-gray-700 mt-3">{dashboard.completedInterviewsCount ?? 0}</span>
                    <span className="text-xs text-gray-500 mt-1">Past scheduled time</span>
                  </div>
                </div>

                {/* Today's Interviews Dedicated Section */}
                {dashboard.todayInterviews && dashboard.todayInterviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">Today's Interviews</h3>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {dashboard.todayInterviews.length} Scheduled Today
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboard.todayInterviews.map((item: any) => {
                        const isFuture = new Date(item.scheduledAt) > new Date();
                        const hasFeedback = !!item.feedback || item.status === 'COMPLETED';

                        let displayStatus = 'Scheduled';
                        if (hasFeedback) displayStatus = 'Completed';
                        else if (!isFuture) displayStatus = 'Awaiting Feedback';
                        
                        return (
                        <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border-2 border-indigo-200 hover:border-indigo-400 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-base font-bold text-gray-900">{item.application?.candidateName || 'Unknown'}</h4>
                                <p className="text-xs text-gray-500">{item.application?.candidateEmail || ''}</p>
                              </div>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${hasFeedback ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : isFuture ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                {displayStatus}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                              <span>Role: <strong className="text-gray-800">{item.application?.job?.title || 'Unknown Position'}</strong></span>
                              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                            <button
                              onClick={() => loadApplicationDetails(item.applicationId)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                            >
                              View Candidate &rarr;
                            </button>
                          </div>
                        </div>
                      ); })}
                    </div>
                  </div>
                )}

                {/* Upcoming Interviews Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Upcoming Interviews</h3>
                  {(!dashboard.upcomingInterviews || dashboard.upcomingInterviews.length === 0) ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                      No upcoming interviews assigned to you.
                    </div>
                  ) : (
                    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Round</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboard.upcomingInterviews.map((item: any) => {
                            const isCompleted = new Date(item.scheduledAt) < new Date();
                            return (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.application?.candidateName || 'Unknown'}
                                  <div className="text-xs text-gray-500">{item.application?.candidateEmail || ''}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {item.application?.job?.title || 'Unknown Position'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {item.roundTitle || 'General Interview'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {new Date(item.scheduledAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${isCompleted ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                    {isCompleted ? 'Completed' : 'Scheduled'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => loadApplicationDetails(item.applicationId)}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                  >
                                    View Candidate
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
              <div className="flex items-center gap-4">
                {user.role === 'RECRUITER' && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={showArchivedJobs} onChange={(e) => setShowArchivedJobs(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    Show Archived
                  </label>
                )}
                {user.role === 'RECRUITER' && (
                  <button onClick={() => setShowCreateJob(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Job
                  </button>
                )}
              </div>
            </div>

            {showCreateJob && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Job</h3>
                  {createJobError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{createJobError}</div>}
                  <form onSubmit={handleCreateJob} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input required type="text" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input required type="text" value={newJob.department} onChange={e => setNewJob({ ...newJob, department: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea required rows={4} value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border"></textarea>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                      <button type="submit" disabled={isCreatingJob} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-70">
                        {isCreatingJob ? 'Creating...' : 'Create Job'}
                      </button>
                      <button type="button" onClick={() => setShowCreateJob(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {selectedJob && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedJob.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedJob.department}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {user.role === 'RECRUITER' && (
                        selectedJob.status === 'ARCHIVED' ? (
                          <button
                            onClick={() => handleRestoreJob(selectedJob)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium border border-green-200"
                          >
                            Restore Job
                          </button>
                        ) : (
                          <button
                            onClick={() => { setArchiveConfirmJob(selectedJob); setArchiveJobError(''); }}
                            className="px-3 py-1.5 bg-white text-amber-700 hover:bg-amber-50 rounded-lg text-sm font-medium border border-amber-200"
                          >
                            Archive Job
                          </button>
                        )
                      )}
                      <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                        <p className="mt-1"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedJob.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedJob.status}</span></p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Created</span>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Updated</span>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedJob.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Job Description</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{selectedJob.description}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Applications ({jobApplications.length})</h4>
                      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                        {jobApplications.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500 text-center">No applications yet.</div>
                        ) : (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {jobApplications.map(app => (
                                <tr key={app.id}>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {app.candidateName}
                                    <div className="text-xs text-gray-500">{app.candidateEmail}</div>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{app.currentStage}</td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      app.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                      app.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {app.status || 'ACTIVE'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500 text-right">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Archive Job Confirmation Modal */}
            {archiveConfirmJob && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[70]">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center gap-3 text-amber-600 mb-3">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="text-lg font-bold text-gray-900">Archive Job Opening</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Are you sure you want to archive the job opening <strong>{archiveConfirmJob.title}</strong>?
                  </p>
                  <p className="text-xs text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                    The job will be removed from the active jobs list. Existing applications and history will be preserved.
                  </p>

                  {archiveJobError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                      {archiveJobError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setArchiveConfirmJob(null)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isArchivingJob}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleArchiveJob(archiveConfirmJob)}
                      disabled={isArchivingJob}
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                    >
                      {isArchivingJob ? 'Archiving...' : 'Confirm Archive'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{job.status}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => setSelectedJob(job)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                        {user.role === 'RECRUITER' && (
                          job.status === 'ARCHIVED' ? (
                            <button onClick={() => handleRestoreJob(job)} className="text-green-600 hover:text-green-900">Restore</button>
                          ) : (
                            <button onClick={() => { setArchiveConfirmJob(job); setArchiveJobError(''); }} className="text-amber-600 hover:text-amber-900">Archive</button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No jobs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
              {user.role === 'RECRUITER' && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchivedApps}
                    onChange={(e) => setShowArchivedApps(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Show Archived
                </label>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input type="text" placeholder="Search candidate name or email..." value={appSearch} onChange={(e) => setAppSearch(e.target.value)} className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border" />
              <select value={appStage} onChange={(e) => setAppStage(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border">
                <option value="">All Stages</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="HIRED">Hired</option>
              </select>
              <select value={appJobId} onChange={(e) => setAppJobId(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border">
                <option value="">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            
            {user.role === 'RECRUITER' && selectedAppIds.length > 0 && (
              <div className="flex gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700 flex items-center">{selectedAppIds.length} selected</span>
                <button onClick={() => handleBulkAction('advance')} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">Bulk Advance</button>
                <button onClick={() => handleBulkAction('reject')} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700">Bulk Reject</button>
              </div>
            )}

            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {user.role === 'RECRUITER' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                        <input type="checkbox" className="rounded text-indigo-600" 
                          checked={applications.filter(a => a.status !== 'ARCHIVED').length > 0 && selectedAppIds.length === applications.filter(a => a.status !== 'ARCHIVED').length}
                          onChange={(e) => {
                            const activeApps = applications.filter(a => a.status !== 'ARCHIVED');
                            setSelectedAppIds(e.target.checked ? activeApps.map(a => a.id) : []);
                          }}
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      {user.role === 'RECRUITER' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded text-indigo-600 disabled:opacity-30" 
                            disabled={app.status === 'ARCHIVED'}
                            title={app.status === 'ARCHIVED' ? 'Archived applications cannot participate in bulk actions' : ''}
                            checked={selectedAppIds.includes(app.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAppIds([...selectedAppIds, app.id]);
                              else setSelectedAppIds(selectedAppIds.filter(id => id !== app.id));
                            }}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.candidateName}<div className="text-gray-500 font-normal text-xs">{app.candidateEmail}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{app.currentStage}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          app.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => loadApplicationDetails(app.id)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                        {user.role === 'RECRUITER' && (
                          app.status === 'ARCHIVED' ? (
                            <button onClick={() => handleRestoreApp(app)} className="text-green-600 hover:text-green-900">Restore</button>
                          ) : (
                            <button onClick={() => { setArchiveConfirmApp(app); setArchiveError(''); }} className="text-amber-600 hover:text-amber-900">Archive</button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && <tr><td colSpan={user.role === 'RECRUITER' ? 6 : 5} className="px-6 py-4 text-center text-gray-500">No applications found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pipeline':
        return (
          <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h2>
              <select value={appJobId} onChange={(e) => setAppJobId(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border w-full sm:w-64">
                <option value="">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            {applications.length === 0 && appJobId !== '' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex-1">
                <h3 className="text-lg font-medium text-gray-900">No candidates found for this job.</h3>
              </div>
            ) : (
              <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].map(stage => (
                  <div key={stage} className="w-80 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col">
                    <h3 className="font-semibold text-gray-700 mb-3">{stage}</h3>
                    <div className="flex-1 space-y-3">
                      {applications.filter(a => a.currentStage === stage).map(app => (
                        <div key={app.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => loadApplicationDetails(app.id)}>
                          <div className="font-medium text-gray-900 text-sm">{app.candidateName}</div>
                          <div className="text-xs text-gray-500 mt-1">{app.candidateEmail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Stalled Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stalled.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-200 border-l-4 border-l-red-500">
                  <h3 className="font-medium text-gray-900">{app.candidateName}</h3>
                  <p className="text-sm text-gray-500 mt-1">Stalled in {app.currentStage}</p>
                </div>
              ))}
              {stalled.length === 0 && (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="mx-auto w-12 h-12 text-gray-300 mb-4 flex items-center justify-center">
                    <IconAlerts />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Stalled Applications</h3>
                </div>
              )}
            </div>
          </div>
        );

      case 'interviews':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.role === 'INTERVIEWER' ? 'My Interviews' : 'Interviews'}
            </h2>
            {isLoadingInterviews ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
              </div>
            ) : globalInterviewsError ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-100 p-12 text-center">
                <h3 className="text-lg font-medium text-red-900">Error loading interviews</h3>
                <p className="mt-1 text-sm text-red-500">{globalInterviewsError}</p>
                <button onClick={loadGlobalInterviews} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
              </div>
            ) : globalInterviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="mx-auto w-12 h-12 text-gray-300 mb-4 flex items-center justify-center">
                  <IconInterviews />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.role === 'INTERVIEWER' ? 'No interviews assigned to you yet.' : 'No interviews scheduled yet.'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user.role === 'INTERVIEWER'
                    ? 'Interviews assigned to you will appear here once scheduled.'
                    : 'Interviews are automatically added here when candidates are advanced from SCREENING to INTERVIEW.'}
                </p>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {globalInterviews.map((interview: any) => {
                      const app = interview.application;
                      const jobTitle = app?.job?.title || 'Unknown Job';
                      const interviewerDisplay = interview.interviewer?.name || interview.interviewer?.email || 'Unassigned';
                      
                      const isFuture = new Date(interview.scheduledAt) > new Date();
                      const hasFeedback = !!interview.feedback || interview.status === 'COMPLETED';
                      const isMyInterview = user.id === interview.interviewerId;

                      let displayStatus = 'Scheduled';
                      if (hasFeedback) displayStatus = 'Completed';
                      else if (!isFuture) displayStatus = 'Awaiting Feedback';

                      const canGiveFeedback = !hasFeedback && !isFuture && isMyInterview;
                      
                      return (
                        <tr key={interview.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {app?.candidateName || 'Unknown'}
                            <div className="text-gray-500 font-normal text-xs">{app?.candidateEmail || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jobTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interviewerDisplay}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(interview.scheduledAt).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${hasFeedback ? 'bg-indigo-100 text-indigo-800' : isFuture ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {displayStatus}
                              </span>
                              {hasFeedback && interview.feedback && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                  Feedback: {interview.feedback.recommendation?.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {/* View Candidate - always visible */}
                              <button
                                onClick={() => { if (app?.id) loadApplicationDetails(app.id); }}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-900 underline"
                              >
                                View Candidate
                              </button>
                              {/* Give Feedback — only after completed, no existing feedback, only assigned interviewer */}
                              {canGiveFeedback && (
                                <button
                                  onClick={() => openFeedbackModal(interview, 'create')}
                                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded shadow-sm transition-colors"
                                >
                                  Give Feedback
                                </button>
                              )}
                              {/* View Feedback — after feedback submitted */}
                              {hasFeedback && (
                                <button
                                  onClick={() => openFeedbackModal(interview, 'view')}
                                  className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded border border-indigo-200 transition-colors"
                                >
                                  View Feedback
                                </button>
                              )}
                              {/* Edit Feedback — only for the interviewer who submitted it */}
                              {hasFeedback && isMyInterview && (
                                <button
                                  onClick={() => openFeedbackModal(interview, 'edit')}
                                  className="text-xs font-medium text-gray-600 hover:text-gray-900 underline"
                                >
                                  Edit Feedback
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'feedback':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{view}</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="mx-auto w-12 h-12 text-gray-300 mb-4 flex items-center justify-center">
                <IconFeedback />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Not globally available</h3>
              <p className="mt-1 text-sm text-gray-500">{view} can only be viewed inside individual application details.</p>
            </div>
          </div>
        );

      default:
        return <div>View not found</div>;
    }
  };

  const navItems = user.role === 'RECRUITER' ? [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'jobs', label: 'Jobs', icon: IconJobs },
    { id: 'applications', label: 'Applications', icon: IconApps },
    { id: 'pipeline', label: 'Pipeline', icon: IconPipeline },
    { id: 'interviews', label: 'Interviews', icon: IconInterviews },
    { id: 'alerts', label: 'Stalled Alerts', icon: IconAlerts }
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'interviews', label: 'My Interviews', icon: IconInterviews }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <IconDashboard />
            </div>
            <span className="font-bold text-lg tracking-tight">Hiring Pipeline</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === item.id
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                }`}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800 hidden md:block">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{user.email}</div>
              <div className="text-xs text-indigo-300">{user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
          <h1 className="text-lg font-medium text-gray-900 capitalize hidden sm:block">{view.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4 ml-auto md:hidden">
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Sign out</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
            {renderApplicationModals()}
          </div>
        </div>
      </main>
    </div>
  );
}
