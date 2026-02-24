'use client';

/**
 * app/volunteer/page.tsx
 *
 * Volunteer & Organizer page for DavaoClean AI.
 *
 * FEATURES:
 * - Header section with join CTA
 * - "Why Join" awareness section
 * - Events table showing all clean-up drives
 * - Volunteers: browse events, join/leave, upload photos per event
 * - Organizers: create, edit, delete events; manage participants (accept/decline)
 * - Role switching: any user can become an organizer
 *
 * HOOKS USED:
 * - useState: local UI state (modals, form fields, loading flags, active tab)
 * - useEffect: fetch data on mount and when dependencies change
 * - useRef: file input reference for image upload
 * - useCallback: memoized fetch functions to avoid infinite re-renders
 *
 * SUPABASE TABLES USED:
 * - profiles      → user role (volunteer / organizer)
 * - events        → clean-up drives created by organizers
 * - participants  → join/leave records per event per user
 * - uploads       → images linked to event_id AND user_id
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';
import type { Profile, Event, Participant, Upload } from '@/lib/supabase';

// ─── Local UI Types ────────────────────────────────────────────────────────────

/** Extended event with participant count and organizer email */
type EventWithMeta = Event & {
  organizer_email?: string;
  participant_count?: number;
  user_participation?: Participant | null;
};

/** Modal mode for event form */
type EventModalMode = 'create' | 'edit' | null;

/** Form state for creating/editing an event */
type EventFormState = {
  title: string;
  description: string;
  location: string;
  event_date: string;
};

const EMPTY_FORM: EventFormState = {
  title: '',
  description: '',
  location: '',
  event_date: '',
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function VolunteerPage() {
  // ── Auth & Profile State ──
  /** Currently authenticated Supabase user */
  const [currentUser, setCurrentUser] = useState<any>(null);
  /** Profile row from `profiles` table */
  const [profile, setProfile] = useState<Profile | null>(null);
  /** Whether auth/profile is still loading */
  const [authLoading, setAuthLoading] = useState(true);

  // ── Data State ──
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // ── Selected Event (for detail/photo modal) ──
  const [selectedEvent, setSelectedEvent] = useState<EventWithMeta | null>(null);
  const [eventParticipants, setEventParticipants] = useState<(Participant & { email?: string })[]>([]);
  const [eventUploads, setEventUploads] = useState<(Upload & { email?: string })[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Event CRUD Modal ──
  const [eventModalMode, setEventModalMode] = useState<EventModalMode>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Image Upload ──
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Role Upgrade ──
  const [roleLoading, setRoleLoading] = useState(false);

  // ── Auth: sign in / sign up form ──
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authFormLoading, setAuthFormLoading] = useState(false);

  // ─── Fetch current user & profile ─────────────────────────────────────────

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    // Get the session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setAuthLoading(false);
    });

    // Listen for auth changes (sign in / sign out)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  // ─── Fetch Events ──────────────────────────────────────────────────────────

  /**
   * Loads all events from the `events` table.
   * Also fetches participant counts and checks if current user has joined each.
   */
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);

    // Fetch all events
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error || !eventsData) {
      setEventsLoading(false);
      return;
    }

    // For each event, get organizer email and participant count
    const enriched: EventWithMeta[] = await Promise.all(
      eventsData.map(async (ev: Event) => {
        // Organizer email
        const { data: org } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', ev.organizer_id)
          .single();

        // Participant count
        const { count } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', ev.id);

        // Current user's participation row
        let userPart: Participant | null = null;
        if (currentUser) {
          const { data: p } = await supabase
            .from('participants')
            .select('*')
            .eq('event_id', ev.id)
            .eq('volunteer_id', currentUser.id)
            .single();
          userPart = p ?? null;
        }

        return {
          ...ev,
          organizer_email: org?.email ?? 'Unknown',
          participant_count: count ?? 0,
          user_participation: userPart,
        };
      })
    );

    setEvents(enriched);
    setEventsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ─── Fetch Event Detail (participants + uploads) ───────────────────────────

  const fetchEventDetail = useCallback(async (event: EventWithMeta) => {
    setDetailLoading(true);
    setSelectedEvent(event);

    // Fetch accepted participants
    const { data: parts } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', event.id);

    // Enrich with emails from profiles
    const enrichedParts = await Promise.all(
      (parts ?? []).map(async (p: Participant) => {
        const { data: prof } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', p.volunteer_id)
          .single();
        return { ...p, email: prof?.email ?? 'Unknown' };
      })
    );
    setEventParticipants(enrichedParts);

    // Fetch uploads linked to this event
    const { data: ups } = await supabase
      .from('uploads')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    const enrichedUps = await Promise.all(
      (ups ?? []).map(async (u: Upload) => {
        const { data: prof } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', u.user_id)
          .single();
        return { ...u, email: prof?.email ?? 'Unknown' };
      })
    );
    setEventUploads(enrichedUps);
    setDetailLoading(false);
  }, []);

  // ─── Auth Handlers ─────────────────────────────────────────────────────────

  /** Sign up: creates auth user + inserts profile row with role = 'volunteer' */
  const handleSignUp = async () => {
    setAuthFormLoading(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });
    if (error) { setAuthError(error.message); setAuthFormLoading(false); return; }

    if (data.user) {
      // Insert into profiles table
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: authEmail,
        role: 'volunteer',
      });
    }
    setAuthFormLoading(false);
  };

  /** Sign in existing user */
  const handleSignIn = async () => {
    setAuthFormLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) setAuthError(error.message);
    setAuthFormLoading(false);
  };

  /** Sign out current user */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // ─── Role Upgrade ──────────────────────────────────────────────────────────

  /** Upgrades the current user's role from 'volunteer' to 'organizer' */
  const handleBecomeOrganizer = async () => {
    if (!currentUser) return;
    setRoleLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'organizer' })
      .eq('id', currentUser.id);
    if (!error) await fetchProfile(currentUser.id);
    setRoleLoading(false);
  };

  // ─── Participant CRUD ──────────────────────────────────────────────────────

  /** Volunteer joins an event — auto-accepted as per requirements */
  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('participants').insert({
      event_id: eventId,
      volunteer_id: currentUser.id,
      status: 'accepted', // organizers auto-accept participants
    });
    if (!error) await fetchEvents();
  };

  /** Volunteer leaves an event */
  const handleLeaveEvent = async (eventId: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('event_id', eventId)
      .eq('volunteer_id', currentUser.id);
    if (!error) await fetchEvents();
  };

  /** Organizer updates a participant's status (accept / decline) */
  const handleUpdateParticipantStatus = async (participantId: string, status: 'accepted' | 'declined') => {
    await supabase
      .from('participants')
      .update({ status })
      .eq('id', participantId);

    if (selectedEvent) await fetchEventDetail(selectedEvent);
  };

  /** Organizer removes a participant from their event */
  const handleRemoveParticipant = async (participantId: string) => {
    await supabase.from('participants').delete().eq('id', participantId);
    if (selectedEvent) await fetchEventDetail(selectedEvent);
  };

  // ─── Event CRUD ────────────────────────────────────────────────────────────

  /** Opens the create event modal */
  const openCreateModal = () => {
    setEventForm(EMPTY_FORM);
    setFormError('');
    setEditingEvent(null);
    setEventModalMode('create');
  };

  /** Opens the edit event modal pre-filled with existing data */
  const openEditModal = (ev: Event) => {
    setEventForm({
      title: ev.title,
      description: ev.description,
      location: ev.location,
      event_date: ev.event_date.slice(0, 16), // format for datetime-local input
    });
    setFormError('');
    setEditingEvent(ev);
    setEventModalMode('edit');
  };

  /** Submits create or edit event form */
  const handleEventFormSubmit = async () => {
    if (!currentUser) return;
    setFormLoading(true);
    setFormError('');

    if (!eventForm.title || !eventForm.location || !eventForm.event_date) {
      setFormError('Title, location, and date are required.');
      setFormLoading(false);
      return;
    }

    if (eventModalMode === 'create') {
      const { error } = await supabase.from('events').insert({
        organizer_id: currentUser.id,
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        event_date: new Date(eventForm.event_date).toISOString(),
      });
      if (error) { setFormError(error.message); setFormLoading(false); return; }

    } else if (eventModalMode === 'edit' && editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          title: eventForm.title,
          description: eventForm.description,
          location: eventForm.location,
          event_date: new Date(eventForm.event_date).toISOString(),
        })
        .eq('id', editingEvent.id);
      if (error) { setFormError(error.message); setFormLoading(false); return; }
    }

    setEventModalMode(null);
    setFormLoading(false);
    await fetchEvents();
  };

  /** Deletes an event (organizer only) */
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await supabase.from('events').delete().eq('id', eventId);
    await fetchEvents();
  };

  // ─── Image Upload ──────────────────────────────────────────────────────────

  /**
   * Uploads an image to Supabase Storage (bucket: event-images)
   * then inserts a row in `uploads` linked to event_id and user_id.
   */
  const handleImageUpload = async (file: File) => {
    if (!currentUser || !selectedEvent) return;
    setUploadLoading(true);
    setUploadError('');

    // Unique file path: event_id/user_id/timestamp_filename
    const filePath = `${selectedEvent.id}/${currentUser.id}/${Date.now()}_${file.name}`;

    // Upload to Supabase Storage bucket "event-images"
    const { error: storageError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file, { upsert: false });

    if (storageError) {
      setUploadError(storageError.message);
      setUploadLoading(false);
      return;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    // Insert into uploads table — linked to event AND user
    const { error: dbError } = await supabase.from('uploads').insert({
      user_id: currentUser.id,
      image_url: urlData.publicUrl,
      category: 'event',        // marks this as an event photo (vs waste classification)
      event_id: selectedEvent.id, // links to the specific event
    });

    if (dbError) {
      setUploadError(dbError.message);
      setUploadLoading(false);
      return;
    }

    setUploadLoading(false);
    // Refresh uploads in the detail view
    await fetchEventDetail(selectedEvent);
  };

  /** Deletes an upload (only the uploader can delete their own) */
  const handleDeleteUpload = async (upload: Upload) => {
    if (!currentUser || upload.user_id !== currentUser.id) return;
    await supabase.from('uploads').delete().eq('id', upload.id);
    if (selectedEvent) await fetchEventDetail(selectedEvent);
  };

  // ─── Derived helpers ───────────────────────────────────────────────────────

  const isOrganizer = profile?.role === 'organizer';
  const isMyEvent = (ev: Event) => currentUser && ev.organizer_id === currentUser.id;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="h-16" />

      {/* ─── HEADER SECTION ─────────────────────────────────────────────── */}
      <section className="relative bg-linear-to-br from-green-800 to-emerald-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400 opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block bg-emerald-600 text-emerald-100 text-sm font-medium px-4 py-1 rounded-full mb-6">
            🤝 Join the Movement
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Volunteer &<br />
            <span className="text-emerald-300">Organizer Hub</span>
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed mb-8">
            Be part of Davao City's clean-up revolution. Join drives as a volunteer,
            upload event photos, or step up as an organizer to lead your community.
          </p>

          {!authLoading && !currentUser && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setAuthMode('signup'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="bg-emerald-400 text-green-950 font-bold px-8 py-3 rounded-full hover:bg-emerald-300 transition-colors"
              >
                Sign Up to Volunteer
              </button>
              <button
                onClick={() => { setAuthMode('signin'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="border-2 border-emerald-400 text-emerald-200 px-8 py-3 rounded-full hover:bg-emerald-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

          {!authLoading && currentUser && (
            <div className="inline-flex items-center gap-3 bg-emerald-700 bg-opacity-60 rounded-2xl px-6 py-3">
              <div className="w-9 h-9 bg-emerald-400 rounded-full flex items-center justify-center text-green-950 font-bold text-sm">
                {currentUser.email?.[0]?.toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">{currentUser.email}</div>
                <div className="text-xs text-emerald-300 capitalize">{profile?.role ?? 'volunteer'}</div>
              </div>
              <button onClick={handleSignOut} className="ml-4 text-xs text-emerald-300 hover:text-white border border-emerald-500 px-3 py-1 rounded-full">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY JOIN SECTION ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Why Volunteer?</span>
            <h2 className="text-5xl font-bold text-gray-900 mt-2 mb-4">Be the Change Davao Needs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every clean-up drive removes waste before it reaches the landfill.
              Your participation directly contributes to Davao City and SDG 11 along with SDG 12 goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '🌱', title: 'Real Environmental Impact', desc: 'Each drive prevents hundreds of kilograms of waste from entering landfills, rivers, and barangay streets.' },
              { emoji: '🤝', title: 'Build Community Bonds', desc: 'Clean-up drives bring Davaoeños together — neighbors, students, and businesses working as one.' },
              { emoji: '📸', title: 'Document & Share', desc: 'Upload photos from each drive to build a public record of community action and inspire others to join.' },
              { emoji: '🏆', title: 'Lead as an Organizer', desc: 'Create and manage your own clean-up events, set locations, and mobilize volunteers in your barangay.' },
              { emoji: '📅', title: 'Flexible Commitment', desc: 'Join single events or commit to recurring drives — participation is entirely on your own schedule.' },
              { emoji: '🌐', title: 'SDG Aligned Action', desc: 'Your involvement directly supports UN Sustainable Development Goals 11 (Cities) and 12 (Consumption).' },
            ].map((item) => (
              <div key={item.title} className="bg-green-50 border border-green-100 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EVENTS TABLE SECTION ──────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50" id="events">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Community Drives</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Upcoming Clean-Up Events</h2>
            </div>
            {isOrganizer && (
              <button
                onClick={openCreateModal}
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span> Create Event
              </button>
            )}
          </div>

          {eventsLoading ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-4">🌿</div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            /* Empty state — prompt users to become organizers */
            <div className="text-center py-24 border-2 border-dashed border-green-200 rounded-2xl bg-white">
              <div className="text-5xl mb-6">🗂️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                There are no clean-up drives scheduled yet. Be the first to organize one for your barangay!
              </p>
              {!currentUser ? (
                <p className="text-sm text-gray-400">Sign in first, then become an organizer to create events.</p>
              ) : !isOrganizer ? (
                <button
                  onClick={handleBecomeOrganizer}
                  disabled={roleLoading}
                  className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {roleLoading ? 'Upgrading...' : '🏆 Become an Organizer'}
                </button>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                >
                  + Create Your First Event
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  currentUser={currentUser}
                  isOrganizer={isOrganizer}
                  isMyEvent={isMyEvent(ev)}
                  onJoin={() => handleJoinEvent(ev.id)}
                  onLeave={() => handleLeaveEvent(ev.id)}
                  onEdit={() => openEditModal(ev)}
                  onDelete={() => handleDeleteEvent(ev.id)}
                  onViewDetail={() => fetchEventDetail(ev)}
                />
              ))}
            </div>
          )}

          {/* Become Organizer CTA (shown when logged in as volunteer, events exist) */}
          {currentUser && !isOrganizer && events.length > 0 && (
            <div className="mt-12 bg-green-700 text-white rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Want to lead your own clean-up drive?</h3>
              <p className="text-green-200 mb-6 text-sm">Upgrade to Organizer to create and manage events for your community.</p>
              <button
                onClick={handleBecomeOrganizer}
                disabled={roleLoading}
                className="bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-green-50 disabled:opacity-60 transition-colors"
              >
                {roleLoading ? 'Upgrading...' : '🏆 Become an Organizer'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── AUTH SECTION ──────────────────────────────────────────────────── */}
      {!currentUser && !authLoading && (
        <section id="auth-section" className="py-24 px-4 bg-white">
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                {authMode === 'signin'
                  ? 'Sign in to join events and upload photos.'
                  : 'Create a free account to start volunteering.'}
              </p>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                  {authError}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
                <button
                  onClick={authMode === 'signin' ? handleSignIn : handleSignUp}
                  disabled={authFormLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {authFormLoading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}
                  className="text-green-600 font-medium hover:underline"
                >
                  {authMode === 'signin' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── EVENT DETAIL MODAL ─────────────────────────────────────────────── */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          participants={eventParticipants}
          uploads={eventUploads}
          currentUser={currentUser}
          profile={profile}
          detailLoading={detailLoading}
          uploadLoading={uploadLoading}
          uploadError={uploadError}
          fileInputRef={fileInputRef}
          onClose={() => { setSelectedEvent(null); setUploadError(''); }}
          onUpdateParticipantStatus={handleUpdateParticipantStatus}
          onRemoveParticipant={handleRemoveParticipant}
          onDeleteUpload={handleDeleteUpload}
          onFileChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
          onUploadClick={() => fileInputRef.current?.click()}
        />
      )}

      {/* ─── EVENT FORM MODAL ───────────────────────────────────────────────── */}
      {eventModalMode && (
        <EventFormModal
          mode={eventModalMode}
          form={eventForm}
          formError={formError}
          formLoading={formLoading}
          onChange={(field, val) => setEventForm((prev) => ({ ...prev, [field]: val }))}
          onSubmit={handleEventFormSubmit}
          onClose={() => setEventModalMode(null)}
        />
      )}

      <Footer />
    </main>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Single event row card in the events list */
function EventCard({
  event, currentUser, isOrganizer, isMyEvent,
  onJoin, onLeave, onEdit, onDelete, onViewDetail
}: {
  event: EventWithMeta;
  currentUser: any;
  isOrganizer: boolean;
  isMyEvent: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetail: () => void;
}) {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const hasJoined = !!event.user_participation;

  return (
    <div className={`bg-white border rounded-2xl p-6 hover:shadow-md transition-all ${isPast ? 'border-gray-200 opacity-75' : 'border-green-100 hover:border-green-300'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">{event.title}</h3>
            {isPast && <span className="shrink-0 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Past</span>}
            {isMyEvent && <span className="shrink-0 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Your Event</span>}
          </div>
          <p className="text-gray-500 text-sm mb-2 line-clamp-1">{event.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>📍 {event.location}</span>
            <span>📅 {eventDate.toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            <span>👥 {event.participant_count} joined</span>
            <span>🧑‍💼 {event.organizer_email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onViewDetail}
            className="text-sm text-green-600 border border-green-200 px-4 py-2 rounded-full hover:bg-green-50 transition-colors"
          >
            View Details
          </button>

          {/* Volunteer join/leave */}
          {currentUser && !isMyEvent && !isPast && (
            hasJoined ? (
              <button
                onClick={onLeave}
                className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={onJoin}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
              >
                Join
              </button>
            )
          )}

          {/* Organizer controls */}
          {isMyEvent && (
            <>
              <button
                onClick={onEdit}
                className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Event detail modal — shows participants, photos, upload option */
function EventDetailModal({
  event, participants, uploads, currentUser, profile,
  detailLoading, uploadLoading, uploadError, fileInputRef,
  onClose, onUpdateParticipantStatus, onRemoveParticipant,
  onDeleteUpload, onFileChange, onUploadClick
}: {
  event: EventWithMeta;
  participants: (Participant & { email?: string })[];
  uploads: (Upload & { email?: string })[];
  currentUser: any;
  profile: Profile | null;
  detailLoading: boolean;
  uploadLoading: boolean;
  uploadError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onUpdateParticipantStatus: (id: string, status: 'accepted' | 'declined') => void;
  onRemoveParticipant: (id: string) => void;
  onDeleteUpload: (upload: Upload) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
}) {
  const isMyEvent = currentUser && event.organizer_id === currentUser.id;
  const isParticipant = participants.some((p) => p.volunteer_id === currentUser?.id && p.status === 'accepted');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-500">📍 {event.location} · 📅 {new Date(event.event_date).toLocaleDateString('en-PH', { dateStyle: 'medium' })}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 ml-4 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {detailLoading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <>
              {/* Description */}
              {event.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About this Event</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Participants list */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Participants ({participants.length})
                </h3>
                {participants.length === 0 ? (
                  <p className="text-gray-400 text-sm">No participants yet.</p>
                ) : (
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                            {p.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.email}</div>
                            <div className={`text-xs ${p.status === 'accepted' ? 'text-green-600' : p.status === 'declined' ? 'text-red-500' : 'text-yellow-600'}`}>
                              {p.status}
                            </div>
                          </div>
                        </div>
                        {/* Organizer can update status or remove */}
                        {isMyEvent && (
                          <div className="flex gap-2">
                            {p.status !== 'accepted' && (
                              <button
                                onClick={() => onUpdateParticipantStatus(p.id, 'accepted')}
                                className="text-xs text-green-600 border border-green-200 px-3 py-1 rounded-full hover:bg-green-50"
                              >
                                Accept
                              </button>
                            )}
                            {p.status !== 'declined' && (
                              <button
                                onClick={() => onUpdateParticipantStatus(p.id, 'declined')}
                                className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50"
                              >
                                Decline
                              </button>
                            )}
                            <button
                              onClick={() => onRemoveParticipant(p.id)}
                              className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-100"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo gallery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Event Photos ({uploads.length})</h3>
                  {/* Upload button — visible to accepted participants and organizer */}
                  {currentUser && (isParticipant || isMyEvent) && (
                    <button
                      onClick={onUploadClick}
                      disabled={uploadLoading}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                      {uploadLoading ? 'Uploading...' : '📷 Upload Photo'}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl mb-3">
                    {uploadError}
                  </div>
                )}

                {!currentUser && (
                  <p className="text-gray-400 text-xs mb-3">Sign in and join this event to upload photos.</p>
                )}
                {currentUser && !isParticipant && !isMyEvent && (
                  <p className="text-gray-400 text-xs mb-3">Join this event to upload photos.</p>
                )}

                {uploads.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                    No photos yet. Be the first to upload!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploads.map((u) => (
                      <div key={u.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.image_url} alt="Event photo" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs truncate">{u.email}</p>
                        </div>
                        {/* Delete button — only for the uploader */}
                        {currentUser && u.user_id === currentUser.id && (
                          <button
                            onClick={() => onDeleteUpload(u)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Create / Edit event modal form */
function EventFormModal({
  mode, form, formError, formLoading,
  onChange, onSubmit, onClose
}: {
  mode: EventModalMode;
  form: EventFormState;
  formError: string;
  formLoading: boolean;
  onChange: (field: keyof EventFormState, val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {formError}
            </div>
          )}

          {[
            { field: 'title' as const, label: 'Event Title *', placeholder: 'e.g. Barangay 76-A Coastal Clean-up' },
            { field: 'location' as const, label: 'Location *', placeholder: 'e.g. Bucana Beach, Barangay 76-A' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[field]}
                onChange={(e) => onChange(field, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Describe the event, what to bring, dress code, etc."
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time *</label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => onChange('event_date', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={formLoading}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {formLoading ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}