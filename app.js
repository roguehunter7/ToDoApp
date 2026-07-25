    const supabase = window.supabase.createClient(
      'https://rqhrsildsoxeadchozui.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaHJzaWxkc294ZWFkY2hvenVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzEwODUsImV4cCI6MjEwMDU0NzA4NX0.SyzfABMYO2APB-zpZp3FYHv2kKLOXEiUjIdlP3V3VzU'
    );

    // DOM refs
    const $ = id => document.getElementById(id);
    const authScreen = $('authScreen');
    const appEl = $('app');
    const loadingScreen = $('loadingScreen');
    const authForm = $('authForm');
    const authEmail = $('authEmail');
    const authPassword = $('authPassword');
    const authSubmit = $('authSubmit');
    const authError = $('authError');
    const authToggleBtn = $('authToggleBtn');
    const authToggleText = $('authToggleText');
    const authSub = $('authSub');
    const userBtn = $('userBtn');
    const userAvatar = $('userAvatar');
    const userEmail = $('userEmail');
    const userDropdown = $('userDropdown');
    const dropEmail = $('dropEmail');
    const dropRole = $('dropRole');
    const signOutBtn = $('signOutBtn');
    const deleteAccountBtn = $('deleteAccountBtn');
    const taskInput = $('taskInput');
    const addBtn = $('addBtn');
    const completedList = $('completedList');
    const pendingList = $('pendingList');
    const doneCount = $('doneCount');
    const pendingCount = $('pendingCount');
    const doneBadge = $('doneBadge');
    const pendingBadge = $('pendingBadge');
    const progressArc = $('progressArc');
    const progressPct = $('progressPct');
    const toastContainer = $('toastContainer');
    const inputModes = $('inputModes');
    const chips = $('chips');
    const confirmDialog = $('confirmDialog');
    const confirmMsg = $('confirmMsg');
    const confirmCancel = $('confirmCancel');
    const confirmOk = $('confirmOk');


    let isSignup = false;
    let inputMode = 'todo';
    let currentUser = null;
    let isAdmin = false;
    let confirmResolve = null;
    let realtimeChannel = null;

    // Calendar state
    const today = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };
    let selectedDate = today();
    let weekOffset = 0;

    const taskDate = $('taskDate');
    const weekDays = $('weekDays');
    const weekLabel = $('weekLabel');
    const weekPrev = $('weekPrev');
    const weekNext = $('weekNext');
    const doneColTitle = $('doneColTitle');
    const pendingColTitle = $('pendingColTitle');
    const heroDay = $('heroDay');
    const heroDate = $('heroDate');

    function updateDateHero() {
      const d = new Date(selectedDate + 'T00:00:00');
      const isToday = selectedDate === today();
      heroDay.textContent = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long' });
      heroDate.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function fmtDateLabel(d) {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function fmtDateFull(d) {
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    function weekStart(offset) {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + 1 + offset * 7); // Monday start
      d.setHours(0, 0, 0, 0);
      return d;
    }

    function renderWeekStrip(taskDates) {
      const start = weekStart(weekOffset);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      weekLabel.textContent = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      weekDays.innerHTML = '';
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const ds = d.toISOString().slice(0, 10);
        const hasTasks = taskDates && taskDates.has(ds);
        const isToday = ds === today();
        const isActive = ds === selectedDate;

        const pill = document.createElement('button');
        pill.className = 'day-pill' +
          (isActive ? ' active' : '') +
          (isToday ? ' today' : '');
        pill.innerHTML = `<span class="day-num">${d.getDate()}</span>${d.toLocaleDateString('en-US', { weekday: 'short' })}` +
          (hasTasks ? '<span class="day-dot"></span>' : '<span class="day-dot" style="visibility:hidden"></span>');
        pill.addEventListener('click', () => {
          selectedDate = ds;
          taskDate.value = ds;
          loadItems();
        });
        weekDays.appendChild(pill);
      }
    }

    function navigateWeek(dir) {
      weekOffset += dir;
      loadItems();
    }

    weekPrev.addEventListener('click', () => navigateWeek(-1));
    weekNext.addEventListener('click', () => navigateWeek(1));
    taskDate.addEventListener('change', () => {
      if (taskDate.value) {
        selectedDate = taskDate.value;
        // Align week offset to include selected date
        const sel = new Date(selectedDate + 'T00:00:00');
        const ws = weekStart(weekOffset);
        const we = new Date(ws); we.setDate(we.getDate() + 6);
        if (sel < ws || sel > we) {
          const days = Math.floor((sel - weekStart(0)) / (1000 * 60 * 60 * 24));
          weekOffset = Math.floor(days / 7);
        }
        loadItems();
      }
    });
    taskDate.value = selectedDate;
    updateDateHero();
    renderWeekStrip(new Set());

    // Chips: hide after first use
    if (localStorage.getItem('pulsetask_used')) {
      chips.classList.add('hidden');
    }
    // Activity mode: hide date picker by default
    taskDate.style.display = 'block';

    // === Theme ===
    const themeToggle = $('themeToggle');
    const html = document.documentElement;

    function setTheme(t) {
      html.dataset.theme = t;
      themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
      document.querySelector('meta[name="theme-color"]').content = t === 'dark' ? '#141410' : '#faf9f5';
    }

    const saved = localStorage.getItem('theme');
    if (saved) { setTheme(saved); }
    else {
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(prefers);
    }

    themeToggle.addEventListener('click', () => {
      const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      localStorage.setItem('theme', next);
    });

    // === PWA ===
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ToDoApp/sw.js');
    }

    // === Helpers ===
    function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function fmtRel(ts) {
      if (!ts) return '';
      const diff = Date.now() - new Date(ts).getTime();
      if (diff < 60000) return 'just now';
      if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function toast(msg, type = 'done') {
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.textContent = msg;
      toastContainer.appendChild(el);
      setTimeout(() => el.remove(), 2800);
    }

    authEmail.addEventListener('input', hideAuthError);
    authPassword.addEventListener('input', hideAuthError);

    function showAuthError(msg) {
      authError.textContent = msg;
      authError.style.display = 'block';
    }

    function hideAuthError() { authError.style.display = 'none'; }

    function setLoading(on) {
      loadingScreen.style.display = on ? 'flex' : 'none';
    }

    function showConfirm(msg) {
      confirmMsg.textContent = msg;
      confirmDialog.showModal();
      return new Promise(resolve => { confirmResolve = resolve; });
    }

    confirmCancel.addEventListener('click', () => { confirmDialog.close(); if (confirmResolve) confirmResolve(false); });
    confirmOk.addEventListener('click', () => { confirmDialog.close(); if (confirmResolve) confirmResolve(true); });
    confirmDialog.addEventListener('close', () => { if (confirmResolve) { confirmResolve(false); confirmResolve = null; } });

    // === Auth state ===
    function showAuth() {
      authScreen.style.display = 'flex';
      appEl.style.display = 'none';
      hideAuthError();
      authEmail.focus();
    }

    function showApp() {
      authScreen.style.display = 'none';
      appEl.style.display = 'block';
      taskInput.focus();
    }

    function updateUserUI(user) {
      const email = user.email || 'user';
      userAvatar.textContent = email[0].toUpperCase();
      userEmail.textContent = email;
      dropEmail.textContent = email;
      // Check admin status separately (we'll call checkAdmin after)
    }

    function setAdminUI(admin) {
      isAdmin = admin;
      dropRole.style.display = admin ? 'block' : 'none';
    }

    // Toggle auth mode
    authToggleBtn.addEventListener('click', () => {
      isSignup = !isSignup;
      hideAuthError();
      authPassword.value = '';
      authEmail.value = '';
      if (isSignup) {
        authSub.textContent = 'Create your account';
        authSubmit.textContent = 'Sign Up';
        authToggleText.textContent = 'Already have an account?';
        authToggleBtn.textContent = 'Sign In';
        authPassword.setAttribute('autocomplete', 'new-password');
      } else {
        authSub.textContent = 'Sign in to continue';
        authSubmit.textContent = 'Sign In';
        authToggleText.textContent = 'Don\'t have an account?';
        authToggleBtn.textContent = 'Sign Up';
        authPassword.setAttribute('autocomplete', 'current-password');
      }
    });

    // Auth form submit
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthError();
      const email = authEmail.value.trim();
      const password = authPassword.value;
      if (!email || password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
      }

      authSubmit.disabled = true;
      authSubmit.textContent = isSignup ? 'Creating…' : 'Signing in…';

      try {
        let result;
        if (isSignup) {
          result = await supabase.auth.signUp({ email, password });
          if (result.error) throw result.error;
          if (result.data?.user?.identities?.length === 0) {
            showAuthError('An account with this email already exists. Sign in instead.');
            authSubmit.disabled = false;
            authSubmit.textContent = 'Sign Up';
            return;
          }
          toast('Account created! Check your email to confirm (if required), then sign in.', 'added');
          // Switch to login
          isSignup = false;
          authToggleBtn.click();
        } else {
          result = await supabase.auth.signInWithPassword({ email, password });
          if (result.error) throw result.error;
        }
      } catch (err) {
        showAuthError(err.message);
        authSubmit.disabled = false;
        authSubmit.textContent = isSignup ? 'Sign Up' : 'Sign In';
        return;
      }

      authSubmit.disabled = false;
      authSubmit.textContent = isSignup ? 'Sign Up' : 'Sign In';
    });

    // === User dropdown ===
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => userDropdown.classList.remove('open'));

    // Sign out
    signOutBtn.addEventListener('click', async () => {
      userDropdown.classList.remove('open');
      await supabase.auth.signOut();
    });

    // Delete account
    deleteAccountBtn.addEventListener('click', async () => {
      userDropdown.classList.remove('open');
      const ok = await showConfirm(
        'Are you sure? This permanently deletes your account and all your data. This cannot be undone.'
      );
      if (!ok) return;

      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const res = await fetch(
          'https://rqhrsildsoxeadchozui.supabase.co/functions/v1/delete-account',
          { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } }
        );

        if (!res.ok) {
          // Fallback: try RPC
          const { error: rpcErr } = await supabase.rpc('delete_my_account');
          if (rpcErr) throw new Error(rpcErr.message);
        }
      } catch (err) {
        setLoading(false);
        toast(`Failed to delete account: ${err.message}`, 'deleted');
        return;
      }
      await supabase.auth.signOut();
      handleAuthChange(null);
    });

    // === Supabase auth listener ===
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUser = session?.user ?? null;
      handleAuthChange(currentUser);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user ?? null;
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        handleAuthChange(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleAuthChange(currentUser);
      }
    });

    function subscribeRealtime(user, admin) {
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
      const cfg = { event: '*', schema: 'public', table: 'items' };
      if (!admin && user) cfg.filter = `user_id=eq.${user.id}`;
      realtimeChannel = supabase
        .channel('items-changes')
        .on('postgres_changes', cfg, () => loadItems())
        .subscribe();
    }

    async function handleAuthChange(user) {
      setLoading(false);
      if (user) {
        showApp();
        updateUserUI(user);
        await checkAdmin(user);
        subscribeRealtime(user, isAdmin);
        loadItems();
      } else {
        if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null; }
        showAuth();
      }
    }

    async function checkAdmin(user) {
      if (!user) { setAdminUI(false); return; }
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();
      setAdminUI(!!data);
    }

    // === Dashboard logic ===
    function classify(text, scheduledAt) {
      const t = text.trim();
      if (inputMode === 'done') {
        return { text: t, entry_type: 'ACTIVITY_LOG', status: 'COMPLETED', completed_at: new Date().toISOString() };
      }
      return { text: t, entry_type: 'TODO', status: 'PENDING', scheduled_at: scheduledAt || null, completed_at: null };
    }

    async function deleteItem(id) {
      const ok = await showConfirm('Delete this item?');
      if (!ok) return;
      await supabase.from('items').delete().eq('id', id).eq('user_id', currentUser.id);
      toast('Deleted', 'deleted');
      loadItems();
    }

    async function completeItem(id) {
      await supabase
        .from('items')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('id', id).eq('user_id', currentUser.id);
      toast('Task completed');
      loadItems();
    }

    function createEmpty(svg, text, sub) {
      const d = document.createElement('div');
      d.className = 'empty';
      d.innerHTML = svg +
        `<div class="empty-text">${esc(text)}</div>` +
        `<div class="empty-sub">${esc(sub)}</div>`;
      return d;
    }

    const DONE_EMPTY = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    const TODO_EMPTY = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';

    function createItem(item) {
      const div = document.createElement('div');
      div.className = item.status === 'PENDING' ? 'item pending' : 'item done';
      div.dataset.id = item.id;

      if (item.status === 'PENDING') {
        div.innerHTML = `
          <input type="checkbox" class="item-check">
          <span class="item-text">${esc(item.text)}</span>
          <span class="item-meta">${item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString() : ''}</span>
          <button class="btn-icon danger" data-action="delete" title="Delete">✕</button>
        `;
        div.querySelector('.item-check').addEventListener('change', () => completeItem(item.id));
        div.querySelector('[data-action="delete"]').addEventListener('click', e => {
          e.stopPropagation();
          deleteItem(item.id);
        });
      } else {
        div.innerHTML = `
          <span class="item-marker">✓</span>
          <span class="item-text">${esc(item.text)}</span>
          <span class="item-meta">${fmtRel(item.completed_at)}</span>
          <button class="btn-icon danger" data-action="delete" title="Delete">✕</button>
        `;
        div.querySelector('[data-action="delete"]').addEventListener('click', e => {
          e.stopPropagation();
          deleteItem(item.id);
        });
      }
      return div;
    }

    async function loadItems() {
      if (!currentUser) return;

      const selStart = new Date(selectedDate + 'T00:00:00');
      const selEnd = new Date(selectedDate + 'T23:59:59.999');
      const selStartIso = selStart.toISOString();
      const selEndIso = selEnd.toISOString();

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) { console.error(error); return; }

      const items = data || [];

      // Build set of dates that have tasks (for week strip dots)
      const taskDates = new Set();
      items.forEach(i => {
        if (i.completed_at) taskDates.add(i.completed_at.slice(0, 10));
        if (i.scheduled_at) taskDates.add(i.scheduled_at.slice(0, 10));
        if (i.created_at) taskDates.add(i.created_at.slice(0, 10));
      });

      const done = items.filter(i =>
        i.status === 'COMPLETED' && i.completed_at && i.completed_at >= selStartIso && i.completed_at <= selEndIso
      );
      const pending = items.filter(i =>
        i.entry_type === 'TODO' && i.status === 'PENDING' &&
        (i.scheduled_at == null || (i.scheduled_at >= selStartIso && i.scheduled_at <= selEndIso))
      );

      done.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
      pending.sort((a, b) => (a.scheduled_at || '') > (b.scheduled_at || '') ? 1 : -1);

      // Update column titles
      const isToday = selectedDate === today();
      doneColTitle.textContent = isToday ? 'What I Did Today' : `Done on ${fmtDateFull(selStart)}`;
      pendingColTitle.textContent = isToday ? 'Scheduled' : `Scheduled for ${fmtDateFull(selStart)}`;

      completedList.innerHTML = '';
      if (done.length === 0) {
        completedList.appendChild(createEmpty(DONE_EMPTY, isToday ? 'Nothing logged yet today' : `Nothing logged on ${fmtDateLabel(selStart)}`, 'Activities appear here after you log them'));
      } else {
        done.forEach(item => completedList.appendChild(createItem(item)));
      }

      pendingList.innerHTML = '';
      if (pending.length === 0) {
        pendingList.appendChild(createEmpty(TODO_EMPTY, isToday ? 'No tasks scheduled' : `No tasks for ${fmtDateLabel(selStart)}`, 'Add one above and it\'ll show up here'));
      } else {
        pending.forEach(item => pendingList.appendChild(createItem(item)));
      }

      doneCount.textContent = done.length;
      pendingCount.textContent = pending.length;
      doneBadge.textContent = done.length;
      pendingBadge.textContent = pending.length;
      $('statDone').dataset.count = done.length;
      $('statPending').dataset.count = pending.length;

      const total = done.length + pending.length;
      if (total > 0) {
        const pct = Math.round((done.length / total) * 100);
        progressArc.style.strokeDashoffset = 69.1 - (69.1 * pct) / 100;
        progressPct.textContent = `${pct}%`;
      } else {
        progressArc.style.strokeDashoffset = 69.1;
        progressPct.textContent = '0%';
      }

      updateDateHero();
      renderWeekStrip(taskDates);
    }

    async function addItem() {
      const raw = taskInput.value.trim();
      if (!raw) return;

      const scheduledAt = taskDate.value
        ? new Date(taskDate.value + 'T00:00:00').toISOString()
        : null;
      const item = classify(raw, scheduledAt);
      const { error } = await supabase.from('items').insert({ ...item, user_id: currentUser.id });
      if (error) {
        console.error(error);
        toast('Error saving task', 'deleted');
        return;
      }
      taskInput.value = '';
      taskInput.focus();
      // Hide chips after first real use
      localStorage.setItem('pulsetask_used', '1');
      chips.classList.add('hidden');
      toast(item.entry_type === 'TODO' ? 'Task added' : 'Activity logged', 'added');
      loadItems();
    }

    addBtn.addEventListener('click', addItem);
    taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });

    // === Input mode switching ===
    inputModes.addEventListener('click', e => {
      const btn = e.target.closest('.input-mode');
      if (!btn || btn.classList.contains('active')) return;
      inputModes.querySelectorAll('.input-mode').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      inputMode = btn.dataset.mode;
      // Hide date picker in activity mode, show in task mode
      taskDate.style.display = inputMode === 'done' ? 'none' : 'block';
      // Update placeholder
      taskInput.placeholder = inputMode === 'todo'
        ? 'What do you need to do?'
        : 'What did you do?';
      taskInput.focus();
    });

    // === Suggestion chips ===
    chips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      taskInput.value = chip.dataset.text;
      taskInput.focus();
      // First usage: hide chips permanently
      localStorage.setItem('pulsetask_used', '1');
      chips.classList.add('hidden');
    });

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        taskInput.focus();
      }
      if (e.key === 'Escape' && currentUser) {
        selectedDate = today();
        taskDate.value = selectedDate;
        weekOffset = 0;
        loadItems();
      }
    });

    // === Reports / Summaries ===
    const reportBtn = $('reportBtn');
    const reportDialog = $('reportDialog');
    const reportClose = $('reportClose');
    const reportLoading = $('reportLoading');
    const reportResult = $('reportResult');
    const reportSummary = $('reportSummary');
    const reportBullets = $('reportBullets');
    const reportStats = $('reportStats');
    const reportHistory = $('reportHistory');

    reportBtn.addEventListener('click', () => {
      reportDialog.showModal();
      loadReportHistory();
    });
    reportClose.addEventListener('click', () => reportDialog.close());

    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => generateReport(btn.dataset.period));
    });

    async function generateReport(periodType) {
      reportResult.style.display = 'none';
      reportLoading.style.display = 'block';

      const now = new Date();
      let start, end;
      if (periodType === 'daily') {
        start = today();
        end = today();
      } else if (periodType === 'weekly') {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay() + 1);
        start = d.toISOString().slice(0,10);
        end = today();
      } else {
        start = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
        end = today();
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const res = await fetch(
          `https://rqhrsildsoxeadchozui.supabase.co/functions/v1/generate-summary`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ period_type: periodType, period_start: start, period_end: end }),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to generate summary');
        }

        const data = await res.json();
        displayReport(data);
        loadReportHistory();
      } catch (err) {
        reportSummary.textContent = `Error: ${err.message}`;
        reportResult.style.display = 'block';
      }
      reportLoading.style.display = 'none';
    }

    function displayReport(data) {
      reportSummary.innerHTML = esc(data.summary || 'No summary generated.');

      reportBullets.innerHTML = '';
      if (data.bullet_points?.length) {
        data.bullet_points.forEach(b => {
          const el = document.createElement('div');
          el.style.cssText = 'display:flex;gap:8px;font-size:13px;color:var(--text-muted);line-height:1.4';
          el.innerHTML = `<span style="color:var(--accent)">▸</span> ${esc(b)}`;
          reportBullets.appendChild(el);
        });
      }

      const s = data.stats || {};
      reportStats.textContent =
        `✅ ${s.total_completed || 0} done · ` +
        `${s.todos_done || 0} tasks · ` +
        `${s.activities_logged || 0} activities`;
      reportResult.style.display = 'block';
    }

    async function loadReportHistory() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Remove old entries, keep header
      reportHistory.querySelectorAll('.report-card').forEach(e => e.remove());

      if (error || !data?.length) {
        const empty = document.createElement('div');
        empty.style.cssText = 'font-size:12px;color:var(--text-dim);padding:8px 0';
        empty.textContent = 'No summaries generated yet. Tap a button above to create one.';
        reportHistory.appendChild(empty);
        return;
      }

      data.forEach(r => {
        const card = document.createElement('div');
        card.className = 'report-card';
        card.style.cssText = 'padding:10px 12px;background:var(--surface-1);border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition);font-size:13px';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">${esc(capitalize(r.period_type))}</span>
            <span style="font-size:11px;color:var(--text-dim)">${esc(r.period_start)} – ${esc(r.period_end)}</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(r.summary)}</div>
        `;
        card.addEventListener('click', () => {
          displayReport({
            summary: r.summary,
            bullet_points: r.bullet_points,
            stats: r.stats,
          });
        });
        reportHistory.appendChild(card);
      });
    }

    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
