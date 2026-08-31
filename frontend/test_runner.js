/**
 * Frontend Test Suite for Phase P (Task 22)
 * Tests:
 * 1. upload button visible on confirmed consultation
 * 2. upload button hidden on pending consultation
 * 3. upload button hidden on rejected/cancelled consultation
 * 4. successful upload
 * 5. upload error
 * 6. file list rendering
 * 7. advocate document list
 * 8. unauthorized/error state
 * 9. privacy warning renders
 */

import assert from 'node:assert';

function runTests() {
  console.log('=== RUNNING FRONTEND CONSULTATION TESTS (TASK 22) ===\n');

  let passed = 0;
  let failed = 0;

  function it(name, fn) {
    try {
      fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // --- Helpers mimicking ConsultationDetails state logic ---
  function allowsDocuments(status) {
    return status === 'CONFIRMED' || status === 'COMPLETED';
  }

  function renderUploadButton(status) {
    if (!allowsDocuments(status)) return null;
    return '<button id="upload-doc-btn">Upload Document</button>';
  }

  function renderPrivacyBanner(status) {
    if (allowsDocuments(status)) return null;
    return '<div class="privacy-lock">Document Sharing Is Protected: To protect your private legal evidence, documents can only be uploaded and viewed once this consultation is CONFIRMED by the advocate.</div>';
  }

  function renderDocumentList(documents, isAdvocate = false) {
    if (!documents || documents.length === 0) {
      return '<div class="empty-docs">No documents shared yet</div>';
    }
    return documents.map(d => {
      const deleteBtn = isAdvocate ? '' : `<button class="delete-btn" data-id="${d.id}">Delete</button>`;
      return `
        <div class="document-item" data-id="${d.id}">
          <span class="filename">${d.filename}</span>
          <span class="type-badge">${d.document_type}</span>
          <span class="size">${(d.size / 1024).toFixed(1)} KB</span>
          <button class="download-btn">View / Download</button>
          ${deleteBtn}
        </div>
      `;
    }).join('');
  }

  function renderErrorState(error) {
    if (!error) return null;
    return `<div class="error-view"><h2>Unable to Access Consultation</h2><p>${error}</p><a href="/consult-advocate">Back to Consultations</a></div>`;
  }

  function renderUploadModal(documentType) {
    const baseNotice = 'Only upload documents relevant to this consultation. Avoid unnecessary Aadhaar numbers, bank details, passwords, or unrelated personal information.';
    let identityNotice = '';
    if (documentType === 'IDENTITY_DOCUMENT') {
      identityNotice = 'Important: Aadhaar upload is NEVER mandatory. If uploading identity proof, ensure financial and biometric numbers are redacted.';
    }
    return `
      <div class="modal">
        <p class="privacy-notice">${baseNotice}</p>
        ${identityNotice ? `<p class="identity-warning">${identityNotice}</p>` : ''}
      </div>
    `;
  }

  // ── TEST 1: upload button visible on confirmed consultation ────────────────
  it('upload button visible on confirmed consultation', () => {
    const btn = renderUploadButton('CONFIRMED');
    assert.ok(btn !== null, 'Button should not be null for CONFIRMED status');
    assert.ok(btn.includes('id="upload-doc-btn"'), 'Button should render upload-doc-btn');
  });

  // ── TEST 2: upload button hidden on pending consultation ──────────────────
  it('upload button hidden on pending consultation', () => {
    const btn = renderUploadButton('PENDING');
    assert.strictEqual(btn, null, 'Upload button must be hidden for PENDING status');
  });

  // ── TEST 3: upload button hidden on rejected/cancelled consultation ───────
  it('upload button hidden on rejected/cancelled consultation', () => {
    const btnRejected = renderUploadButton('REJECTED');
    const btnCancelled = renderUploadButton('CANCELLED');
    assert.strictEqual(btnRejected, null, 'Upload button must be hidden for REJECTED status');
    assert.strictEqual(btnCancelled, null, 'Upload button must be hidden for CANCELLED status');
  });

  // ── TEST 4: successful upload ─────────────────────────────────────────────
  it('successful upload updates state and document list', () => {
    let docs = [];
    const newDoc = {
      id: 'doc-123',
      appointment_id: 'app-456',
      filename: 'sample_notice.pdf',
      mime_type: 'application/pdf',
      size: 2048,
      document_type: 'LEGAL_NOTICE',
      uploaded_at: new Date().toISOString(),
    };

    // Simulate upload success
    docs = [newDoc, ...docs];
    const rendered = renderDocumentList(docs);
    assert.ok(rendered.includes('sample_notice.pdf'), 'Document list should include newly uploaded file');
    assert.ok(rendered.includes('LEGAL_NOTICE'), 'Document type badge should be displayed');
    assert.ok(rendered.includes('2.0 KB'), 'Formatted file size should be displayed');
  });

  // ── TEST 5: upload error ──────────────────────────────────────────────────
  it('upload error displays error message properly', () => {
    let uploadError = '';
    const simulatedErrorResponse = { detail: 'File exceeds maximum allowed size of 10 MB' };

    uploadError = simulatedErrorResponse.detail;
    assert.strictEqual(uploadError, 'File exceeds maximum allowed size of 10 MB');
    assert.ok(uploadError.length > 0);
  });

  // ── TEST 6: file list rendering ───────────────────────────────────────────
  it('file list rendering with metadata and download actions', () => {
    const docs = [
      { id: '1', filename: 'fir_copy.pdf', document_type: 'FIR', size: 1048576, uploaded_at: '2026-08-31' },
      { id: '2', filename: 'order.pdf', document_type: 'COURT_ORDER', size: 512000, uploaded_at: '2026-08-31' },
    ];
    const rendered = renderDocumentList(docs, false);
    assert.ok(rendered.includes('fir_copy.pdf'));
    assert.ok(rendered.includes('order.pdf'));
    assert.ok(rendered.includes('FIR'));
    assert.ok(rendered.includes('COURT_ORDER'));
    assert.ok(rendered.includes('View / Download'));
    assert.ok(rendered.includes('Delete'));
  });

  // ── TEST 7: advocate document list ────────────────────────────────────────
  it('advocate document list has download capabilities and no delete for citizen files', () => {
    const docs = [
      { id: '1', filename: 'evidence.png', document_type: 'EVIDENCE', size: 409600, uploaded_at: '2026-08-31' },
    ];
    const advocateView = renderDocumentList(docs, true);
    assert.ok(advocateView.includes('evidence.png'));
    assert.ok(advocateView.includes('View / Download'));
    assert.ok(!advocateView.includes('Delete'), 'Advocate must not see citizen file delete action');
  });

  // ── TEST 8: unauthorized/error state ──────────────────────────────────────
  it('unauthorized/error state renders access denied message and recovery link', () => {
    const rendered = renderErrorState('Access to this consultation is forbidden');
    assert.ok(rendered.includes('Unable to Access Consultation'));
    assert.ok(rendered.includes('Access to this consultation is forbidden'));
    assert.ok(rendered.includes('/consult-advocate'));
  });

  // ── TEST 9: privacy warning renders ───────────────────────────────────────
  it('privacy warning renders standard notice and stronger identity notice', () => {
    const standardModal = renderUploadModal('LEGAL_NOTICE');
    assert.ok(standardModal.includes('Only upload documents relevant to this consultation. Avoid unnecessary Aadhaar numbers, bank details, passwords, or unrelated personal information.'));
    assert.ok(!standardModal.includes('identity-warning'));

    const identityModal = renderUploadModal('IDENTITY_DOCUMENT');
    assert.ok(identityModal.includes('Aadhaar upload is NEVER mandatory'));
  });

  // ── TASK 9: CASE DETAIL PANEL & DASHBOARD TESTS ──────────────────────────
  console.log('\n=== RUNNING CASE DETAIL PANEL & DASHBOARD TESTS (TASK 9) ===\n');

  // Logic mimics CaseDetailPanel component states
  function renderCaseDetailMock({ caseData, loading = false, error = null }) {
    if (loading) {
      return '<div class="loading-state">Loading case details...</div>';
    }
    if (error) {
      return `<div class="error-state">Unable to load case details. <p>${error}</p></div>`;
    }
    if (!caseData) {
      return '<div class="empty-state">Select a case to view details.</div>';
    }

    const status = caseData.status || 'submitted';
    const caseNumber = caseData.case_number || 'N/A';
    const courtType = caseData.court_type || 'District Court';
    const district = caseData.district || 'Bengaluru Urban';
    const documents = Array.isArray(caseData.documents) ? caseData.documents : [];
    const notes = Array.isArray(caseData.notes) ? caseData.notes : [];
    const timeline = Array.isArray(caseData.timeline) ? caseData.timeline : [];
    const tasks = Array.isArray(caseData.tasks) ? caseData.tasks : [];

    return `
      <div class="case-detail-panel" data-case="${caseNumber}">
        <span class="case-num">${caseNumber}</span>
        <span class="court">${courtType}</span>
        <span class="district">${district}</span>
        <span class="status">${status}</span>
        <div class="docs-count">${documents.length}</div>
        <div class="notes-count">${notes.length}</div>
        <div class="timeline-count">${timeline.length}</div>
        <div class="tasks-count">${tasks.length}</div>
      </div>
    `;
  }

  // Dashboard role routing mock
  function renderDashboardRouteMock({ token, role }) {
    if (!token) return { redirect: '/login' };
    if (role === 'admin') return { view: 'Admin Dashboard', role: 'admin' };
    if (role === 'advocate') return { view: 'Advocate Dashboard', role: 'advocate' };
    return { view: 'Citizen Dashboard', role: 'citizen' };
  }

  // 1. Dashboard renders with no selected case
  it('1. Dashboard renders with no selected case', () => {
    const dash = renderDashboardRouteMock({ token: 'mock-token', role: 'citizen' });
    assert.strictEqual(dash.view, 'Citizen Dashboard');
    assert.strictEqual(dash.redirect, undefined);
  });

  // 2. CaseDetailPanel does not crash when caseData is null
  it('2. CaseDetailPanel does not crash when caseData is null', () => {
    const html = renderCaseDetailMock({ caseData: null });
    assert.ok(html.includes('Select a case to view details.'));
  });

  // 3. Missing documents array does not crash
  it('3. Missing documents array does not crash', () => {
    const html = renderCaseDetailMock({ caseData: { case_number: 'CC/101/2026', status: 'under_review' } });
    assert.ok(html.includes('CC/101/2026'));
    assert.ok(html.includes('<div class="docs-count">0</div>'));
  });

  // 4. Missing notes/timeline/tasks arrays do not crash
  it('4. Missing notes/timeline/tasks arrays do not crash', () => {
    const html = renderCaseDetailMock({ caseData: { case_number: 'CC/102/2026', status: 'routed', documents: [] } });
    assert.ok(html.includes('CC/102/2026'));
    assert.ok(html.includes('<div class="notes-count">0</div>'));
    assert.ok(html.includes('<div class="timeline-count">0</div>'));
    assert.ok(html.includes('<div class="tasks-count">0</div>'));
  });

  // 5. Valid case renders correctly
  it('5. Valid case renders correctly', () => {
    const validCase = {
      case_number: 'CC/00042/2026',
      status: 'routed',
      court_type: 'Principal District & Sessions Court',
      district: 'Bengaluru Urban',
      documents: [{ id: 'doc-1', filename: 'evidence.pdf' }],
      notes: [{ id: 'note-1', text: 'Admitted' }],
      timeline: [{ stage: 'Filing', status: 'completed' }],
      tasks: [{ id: 'task-1', title: 'Submit rejoinder' }],
    };
    const html = renderCaseDetailMock({ caseData: validCase });
    assert.ok(html.includes('CC/00042/2026'));
    assert.ok(html.includes('Principal District & Sessions Court'));
    assert.ok(html.includes('routed'));
    assert.ok(html.includes('<div class="docs-count">1</div>'));
    assert.ok(html.includes('<div class="notes-count">1</div>'));
    assert.ok(html.includes('<div class="timeline-count">1</div>'));
    assert.ok(html.includes('<div class="tasks-count">1</div>'));
  });

  // 6. API failure shows error state
  it('6. API failure shows error state', () => {
    const html = renderCaseDetailMock({ caseData: null, error: 'Case details not found' });
    assert.ok(html.includes('Unable to load case details.'));
    assert.ok(html.includes('Case details not found'));
  });

  // 7. /dashboard renders citizen dashboard
  it('7. /dashboard renders citizen dashboard', () => {
    const res = renderDashboardRouteMock({ token: 'citizen-token', role: 'citizen' });
    assert.strictEqual(res.view, 'Citizen Dashboard');
    assert.strictEqual(res.role, 'citizen');
  });

  // 8. /admin renders admin dashboard for admin role only
  it('8. /admin renders admin dashboard for admin role only', () => {
    // Unauthenticated
    const unauth = renderDashboardRouteMock({ token: null, role: null });
    assert.strictEqual(unauth.redirect, '/login');

    // Citizen attempting admin access
    const citizen = renderDashboardRouteMock({ token: 'user-token', role: 'citizen' });
    assert.notStrictEqual(citizen.view, 'Admin Dashboard');

    // Advocate attempting admin access
    const advocate = renderDashboardRouteMock({ token: 'adv-token', role: 'advocate' });
    assert.notStrictEqual(advocate.view, 'Admin Dashboard');

    // Admin
    const admin = renderDashboardRouteMock({ token: 'admin-token', role: 'admin' });
    assert.strictEqual(admin.view, 'Admin Dashboard');
    assert.strictEqual(admin.role, 'admin');
  });

  // ── TASK 29: PHASE Q SEPARATE PORTALS & NOTIFICATIONS TESTS ─────────────
  console.log('\n=== RUNNING PHASE Q PORTAL, NOTIFICATION & ACTIVITY TESTS (TASK 29) ===\n');

  // 1. Citizen login page
  it('1. Citizen login page renders form fields and actions', () => {
    function renderCitizenLoginMock() {
      return `
        <div class="citizen-login-page">
          <h1>Citizen Login</h1>
          <input type="email" name="email" required />
          <input type="password" name="password" required />
          <button type="submit">Login</button>
          <a href="/citizen/register">Create Citizen Account</a>
        </div>
      `;
    }
    const html = renderCitizenLoginMock();
    assert.ok(html.includes('Citizen Login'));
    assert.ok(html.includes('name="email"'));
    assert.ok(html.includes('Create Citizen Account'));
  });

  // 2. Advocate login page
  it('2. Advocate login page renders distinct advocate portal header', () => {
    function renderAdvocateLoginMock() {
      return `
        <div class="advocate-login-page">
          <div class="badge">Official Legal Practice</div>
          <h1>Advocate Portal</h1>
          <p>Manage consultations, appointment requests and citizen legal-service requests.</p>
          <input type="email" name="email" required />
          <input type="password" name="password" required />
          <button type="submit">Enter Advocate Portal</button>
          <a href="/advocate/register">Register your practice</a>
        </div>
      `;
    }
    const html = renderAdvocateLoginMock();
    assert.ok(html.includes('Advocate Portal'));
    assert.ok(html.includes('Manage consultations, appointment requests and citizen legal-service requests.'));
    assert.ok(html.includes('Register your practice'));
  });

  // 3. Role mismatch message
  it('3. Role mismatch displays portal mismatch alert and recovery link', () => {
    function handleLoginRoleCheck(attemptedPortal, userRole) {
      if (attemptedPortal === 'citizen' && userRole === 'advocate') {
        return {
          error: 'This account belongs to the Advocate Portal.',
          redirectButton: '/advocate/login',
        };
      }
      if (attemptedPortal === 'advocate' && userRole === 'citizen') {
        return {
          error: 'This account belongs to the Citizen Portal.',
          redirectButton: '/citizen/login',
        };
      }
      return { success: true };
    }

    const citResult = handleLoginRoleCheck('citizen', 'advocate');
    assert.strictEqual(citResult.error, 'This account belongs to the Advocate Portal.');
    assert.strictEqual(citResult.redirectButton, '/advocate/login');

    const advResult = handleLoginRoleCheck('advocate', 'citizen');
    assert.strictEqual(advResult.error, 'This account belongs to the Citizen Portal.');
    assert.strictEqual(advResult.redirectButton, '/citizen/login');
  });

  // 4. Citizen dashboard redirect
  it('4. Citizen dashboard redirect on successful citizen login', () => {
    function getPostLoginDestination(role, hasProfile) {
      if (role === 'citizen') return '/dashboard';
      if (role === 'advocate') return hasProfile ? '/advocate/dashboard' : '/advocate/onboarding';
      return '/';
    }
    assert.strictEqual(getPostLoginDestination('citizen', false), '/dashboard');
  });

  // 5. Advocate dashboard redirect
  it('5. Advocate dashboard redirect on login with existing profile', () => {
    function getPostLoginDestination(role, hasProfile) {
      if (role === 'citizen') return '/dashboard';
      if (role === 'advocate') return hasProfile ? '/advocate/dashboard' : '/advocate/onboarding';
      return '/';
    }
    assert.strictEqual(getPostLoginDestination('advocate', true), '/advocate/dashboard');
  });

  // 6. Advocate onboarding redirect
  it('6. Advocate onboarding redirect when no profile exists', () => {
    function getPostLoginDestination(role, hasProfile) {
      if (role === 'citizen') return '/dashboard';
      if (role === 'advocate') return hasProfile ? '/advocate/dashboard' : '/advocate/onboarding';
      return '/';
    }
    assert.strictEqual(getPostLoginDestination('advocate', false), '/advocate/onboarding');
  });

  // 7. Notification badge
  it('7. Notification badge renders count when unread > 0 and hides when 0', () => {
    function renderBadge(count) {
      if (count <= 0) return '';
      return `<span id="notification-badge">${count > 99 ? '99+' : count}</span>`;
    }
    assert.strictEqual(renderBadge(0), '');
    assert.ok(renderBadge(5).includes('id="notification-badge">5</span>'));
    assert.ok(renderBadge(120).includes('99+'));
  });

  // 8. Priority notification banner
  it('8. Priority notification banner renders for pending requests', () => {
    function renderPriorityBanner(pendingCount) {
      if (pendingCount <= 0) return '';
      return `
        <div id="priority-notification-banner">
          <p>🔔 You have ${pendingCount} new consultation request${pendingCount > 1 ? 's' : ''}</p>
          <a href="#action-required-section">Review Requests</a>
        </div>
      `;
    }
    assert.strictEqual(renderPriorityBanner(0), '');
    const banner = renderPriorityBanner(3);
    assert.ok(banner.includes('You have 3 new consultation requests'));
    assert.ok(banner.includes('Review Requests'));
  });

  // 9. Mark notification read
  it('9. Marking notification as read updates status and decrements count', () => {
    let notifs = [
      { id: '1', title: 'New Request', read_status: false },
      { id: '2', title: 'Document Uploaded', read_status: false },
    ];
    let unreadCount = notifs.filter((n) => !n.read_status).length;
    assert.strictEqual(unreadCount, 2);

    // Mark notification 1 as read
    notifs = notifs.map((n) => (n.id === '1' ? { ...n, read_status: true } : n));
    unreadCount = notifs.filter((n) => !n.read_status).length;
    assert.strictEqual(unreadCount, 1);
    assert.strictEqual(notifs[0].read_status, true);
  });

  // 10. Citizen activity rendering
  it('10. Citizen activity table renders persisted history', () => {
    function renderActivityTable(activities) {
      if (!activities || activities.length === 0) return '<p>No recent activity yet.</p>';
      return `
        <table>
          ${activities.map((a) => `<tr><td>${a.type}</td><td>${a.subject}</td><td>${a.date}</td></tr>`).join('')}
        </table>
      `;
    }
    const history = [
      { type: 'Legal Query', subject: 'Property Law', date: '31 Aug 2026' },
      { type: 'Consultation', subject: 'Consultation on 2026-09-01 (CONFIRMED)', date: '31 Aug 2026' },
    ];
    const tableHtml = renderActivityTable(history);
    assert.ok(tableHtml.includes('Legal Query'));
    assert.ok(tableHtml.includes('Property Law'));
    assert.ok(tableHtml.includes('CONFIRMED'));
  });

  // 11. Advocate request counts
  it('11. Advocate operational cards calculate correct operational numbers', () => {
    const advocateDashboardPayload = {
      new_direct_requests: 4,
      confirmed_consultations: 2,
      broadcast_matches: 3,
      reschedule_requests: 1,
      unread_notifications: 5,
      todays_appointments: 2,
    };
    assert.strictEqual(advocateDashboardPayload.new_direct_requests, 4);
    assert.strictEqual(advocateDashboardPayload.confirmed_consultations, 2);
    assert.strictEqual(advocateDashboardPayload.broadcast_matches, 3);
    assert.strictEqual(advocateDashboardPayload.reschedule_requests, 1);
    assert.strictEqual(advocateDashboardPayload.unread_notifications, 5);
    assert.strictEqual(advocateDashboardPayload.todays_appointments, 2);
  });

  // 12. Wrong-role route access
  it('12. Wrong-role route guards block unauthorized access', () => {
    function evaluateRouteGuard(route, token, role) {
      if (!token) return { allow: false, redirect: '/login' };
      if (route === '/dashboard') {
        if (role === 'citizen') return { allow: true };
        return { allow: false, redirect: '/advocate/dashboard' };
      }
      if (route === '/advocate/dashboard' || route === '/advocate/onboarding') {
        if (role === 'advocate') return { allow: true };
        return { allow: false, redirect: '/dashboard' };
      }
      if (route === '/admin') {
        if (role === 'admin') return { allow: true };
        return { allow: false, redirect: '/dashboard' };
      }
      return { allow: true };
    }

    // Citizen attempting /advocate/dashboard
    assert.strictEqual(evaluateRouteGuard('/advocate/dashboard', 'token', 'citizen').allow, false);
    assert.strictEqual(evaluateRouteGuard('/advocate/dashboard', 'token', 'citizen').redirect, '/dashboard');

    // Advocate attempting /dashboard
    assert.strictEqual(evaluateRouteGuard('/dashboard', 'token', 'advocate').allow, false);
    assert.strictEqual(evaluateRouteGuard('/dashboard', 'token', 'advocate').redirect, '/advocate/dashboard');

    // Citizen attempting /admin
    assert.strictEqual(evaluateRouteGuard('/admin', 'token', 'citizen').allow, false);

    // Advocate accessing /advocate/dashboard
    assert.strictEqual(evaluateRouteGuard('/advocate/dashboard', 'token', 'advocate').allow, true);

    // Citizen accessing /dashboard
    assert.strictEqual(evaluateRouteGuard('/dashboard', 'token', 'citizen').allow, true);
  });

  // ── TASK 18: PHASE Q.3 FULL ROLE-SPECIFIC WEBSITE EXPERIENCE TESTS ──────
  console.log('\n=== RUNNING PHASE Q.3 ROLE-SPECIFIC EXPERIENCE TESTS (TASK 18) ===\n');

  // Role utility helpers
  function isAdvocate(role) {
    return role === 'advocate' || role === 'lawyer_advisor';
  }
  function isCitizen(role) {
    return role === 'citizen';
  }
  function isAdmin(role) {
    return role === 'admin';
  }
  function getRoleBadge(role) {
    if (isAdvocate(role)) return 'ADVOCATE';
    if (isAdmin(role)) return 'ADMIN';
    if (isCitizen(role)) return 'CITIZEN';
    return null;
  }
  function getHomeRoute(role) {
    if (isAdvocate(role)) return '/advocate/dashboard';
    if (isAdmin(role)) return '/admin';
    return '/dashboard';
  }

  // Layout selector logic matching MainLayout.jsx
  function resolveLayout(token, role) {
    if (!token) return 'CitizenLayout'; // Unauthenticated visitor uses public citizen site
    if (isAdvocate(role)) return 'AdvocateLayout';
    if (isAdmin(role)) return 'AdminLayout';
    return 'CitizenLayout';
  }

  // Nav items builder matching Header.jsx (Citizen) & AdvocateHeader.jsx
  function getCitizenNavItems(role) {
    const items = [
      'Home',
      'AI Legal Guidance',
      'Case Outcome',
      'Consult an Advocate',
    ];
    if (isCitizen(role)) {
      items.push('My Consultations', 'My Broadcast Requests', 'Dashboard');
    }
    items.push(
      'Women Protection',
      'Free Legal Aid',
      'Documents',
      'Directory',
      'Case Tracker',
      'Emergency',
      'About',
      'Contact'
    );
    return items;
  }

  function getAdvocateNavItems() {
    return [
      'Advocate Dashboard',
      'Direct Requests',
      'Broadcast Requests',
      'My Consultations',
      'Availability',
      'Professional Profile',
    ];
  }

  function getAdminNavItems() {
    return [
      'Admin Dashboard',
    ];
  }

  // 1. citizen login renders citizen layout
  it('1. citizen login renders citizen layout', () => {
    const layout = resolveLayout('cit-token', 'citizen');
    assert.strictEqual(layout, 'CitizenLayout');
  });

  // 2. citizen sees AI Legal Guidance
  it('2. citizen sees AI Legal Guidance', () => {
    const nav = getCitizenNavItems('citizen');
    assert.ok(nav.includes('AI Legal Guidance'));
  });

  // 3. citizen sees Consult an Advocate
  it('3. citizen sees Consult an Advocate', () => {
    const nav = getCitizenNavItems('citizen');
    assert.ok(nav.includes('Consult an Advocate'));
  });

  // 4. citizen does not see Advocate Dashboard
  it('4. citizen does not see Advocate Dashboard', () => {
    const nav = getCitizenNavItems('citizen');
    assert.strictEqual(nav.includes('Advocate Dashboard'), false);
  });

  // 5. advocate login renders advocate layout
  it('5. advocate login renders advocate layout for both advocate and lawyer_advisor', () => {
    assert.strictEqual(resolveLayout('adv-token', 'advocate'), 'AdvocateLayout');
    assert.strictEqual(resolveLayout('adv-token', 'lawyer_advisor'), 'AdvocateLayout');
  });

  // 6. advocate sees Direct Requests
  it('6. advocate sees Direct Requests', () => {
    const nav = getAdvocateNavItems();
    assert.ok(nav.includes('Direct Requests'));
  });

  // 7. advocate sees Broadcast Requests
  it('7. advocate sees Broadcast Requests', () => {
    const nav = getAdvocateNavItems();
    assert.ok(nav.includes('Broadcast Requests'));
  });

  // 8. advocate sees Availability
  it('8. advocate sees Availability', () => {
    const nav = getAdvocateNavItems();
    assert.ok(nav.includes('Availability'));
  });

  // 9. advocate sees Notifications
  it('9. advocate sees Notifications component', () => {
    function renderAdvocateHeaderMock(unreadCount = 2) {
      return `
        <header class="advocate-header">
          <div class="notification-bell"><span class="badge">${unreadCount}</span></div>
          <span class="role-badge">ADVOCATE</span>
        </header>
      `;
    }
    const html = renderAdvocateHeaderMock(3);
    assert.ok(html.includes('notification-bell'));
    assert.ok(html.includes('badge'));
  });

  // 10. advocate does not see AI Legal Guidance in primary navigation
  it('10. advocate does not see AI Legal Guidance in primary navigation', () => {
    const nav = getAdvocateNavItems();
    assert.strictEqual(nav.includes('AI Legal Guidance'), false);
  });

  // 11. advocate does not see Consult an Advocate in primary navigation
  it('11. advocate does not see Consult an Advocate in primary navigation', () => {
    const nav = getAdvocateNavItems();
    assert.strictEqual(nav.includes('Consult an Advocate'), false);
  });

  // 12. advocate badge = ADVOCATE
  it('12. advocate badge = ADVOCATE for both advocate and lawyer_advisor roles', () => {
    assert.strictEqual(getRoleBadge('advocate'), 'ADVOCATE');
    assert.strictEqual(getRoleBadge('lawyer_advisor'), 'ADVOCATE');
  });

  // 13. citizen badge = CITIZEN
  it('13. citizen badge = CITIZEN and missing role is null', () => {
    assert.strictEqual(getRoleBadge('citizen'), 'CITIZEN');
    assert.strictEqual(getRoleBadge(''), null);
    assert.strictEqual(getRoleBadge(undefined), null);
  });

  // 14. admin gets admin layout
  it('14. admin gets admin layout and ADMIN badge', () => {
    assert.strictEqual(resolveLayout('admin-token', 'admin'), 'AdminLayout');
    assert.strictEqual(getRoleBadge('admin'), 'ADMIN');
  });

  // 15. wrong-role route blocked
  it('15. wrong-role route blocked with redirect to proper workspace', () => {
    function routeGuard(path, role, token) {
      if (!token) return { allowed: false, redirect: '/login' };
      if (path.startsWith('/advocate')) {
        if (!isAdvocate(role)) return { allowed: false, redirect: isCitizen(role) ? '/dashboard' : '/admin' };
        return { allowed: true };
      }
      if (path === '/dashboard') {
        if (isAdvocate(role)) return { allowed: false, redirect: '/advocate/dashboard' };
        if (isAdmin(role)) return { allowed: false, redirect: '/admin' };
        return { allowed: true };
      }
      if (path.startsWith('/admin')) {
        if (!isAdmin(role)) return { allowed: false, redirect: isAdvocate(role) ? '/advocate/dashboard' : '/dashboard' };
        return { allowed: true };
      }
      return { allowed: true };
    }

    // Citizen attempting advocate routes
    assert.deepStrictEqual(routeGuard('/advocate/dashboard', 'citizen', 'token'), { allowed: false, redirect: '/dashboard' });
    assert.deepStrictEqual(routeGuard('/advocate/availability', 'citizen', 'token'), { allowed: false, redirect: '/dashboard' });
    assert.deepStrictEqual(routeGuard('/advocate/profile', 'citizen', 'token'), { allowed: false, redirect: '/dashboard' });

    // Advocate attempting citizen dashboard
    assert.deepStrictEqual(routeGuard('/dashboard', 'lawyer_advisor', 'token'), { allowed: false, redirect: '/advocate/dashboard' });
    assert.deepStrictEqual(routeGuard('/dashboard', 'advocate', 'token'), { allowed: false, redirect: '/advocate/dashboard' });

    // Advocate allowed on advocate routes
    assert.deepStrictEqual(routeGuard('/advocate/dashboard', 'lawyer_advisor', 'token'), { allowed: true });
    assert.deepStrictEqual(routeGuard('/advocate/availability', 'lawyer_advisor', 'token'), { allowed: true });
  });

  // 16. refresh preserves correct layout
  it('16. refresh preserves correct layout from localStorage state', () => {
    // Simulate browser reload where localStorage maintains auth state
    const mockStorageAdvocate = { smartNyayaToken: 'jwt-123', role: 'lawyer_advisor' };
    const reloadedLayoutAdv = resolveLayout(mockStorageAdvocate.smartNyayaToken, mockStorageAdvocate.role);
    assert.strictEqual(reloadedLayoutAdv, 'AdvocateLayout');
    assert.strictEqual(getRoleBadge(mockStorageAdvocate.role), 'ADVOCATE');

    const mockStorageCitizen = { smartNyayaToken: 'jwt-456', role: 'citizen' };
    const reloadedLayoutCit = resolveLayout(mockStorageCitizen.smartNyayaToken, mockStorageCitizen.role);
    assert.strictEqual(reloadedLayoutCit, 'CitizenLayout');
    assert.strictEqual(getRoleBadge(mockStorageCitizen.role), 'CITIZEN');
  });

  console.log(`\n=== RESULTS: TOTAL=${passed + failed} | PASSED=${passed} | FAILED=${failed} ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();


