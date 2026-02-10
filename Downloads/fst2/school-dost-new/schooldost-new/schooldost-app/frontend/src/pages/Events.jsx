import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { eventAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { FiPlus, FiCalendar, FiMapPin, FiClock, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Events() {
   const navigate = useNavigate();
   const [events, setEvents] = useState([]);
   const [myEvents, setMyEvents] = useState({ organized: [], attending: [], interested: [] });
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('browse'); // browse, my
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('');

   // Create Modal
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [newEvent, setNewEvent] = useState({
      title: '', description: '', location: '',
      dateTime: '', endTime: '', category: '',
      imageUrl: '', isPublic: true
   });

   const CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Tech', 'Social', 'Workshop', 'Competition'];

   useEffect(() => {
      loadData();
   }, [activeTab]);

   const loadData = async () => {
      setLoading(true);
      try {
         if (activeTab === 'browse') {
            const { data } = await eventAPI.getAll(searchQuery, selectedCategory);
            setEvents(data.events || []);
         } else {
            const { data } = await eventAPI.getMy();
            setMyEvents(data);
         }
      } catch (error) {
         console.error('Load events error:', error);
         toast.error('Failed to load events');
      } finally {
         setLoading(false);
      }
   };

   const handleCreateEvent = async (e) => {
      e.preventDefault();
      try {
         const { data } = await eventAPI.create(newEvent);
         toast.success('Event created!');
         setShowCreateModal(false);
         setNewEvent({ title: '', description: '', location: '', dateTime: '', endTime: '', category: '', imageUrl: '', isPublic: true });
         navigate(`/events/${data.event.id}`);
      } catch (error) {
         console.error('Create event error:', error);
         toast.error('Failed to create event');
      }
   };

   const handleSearch = (e) => {
      e.preventDefault();
      loadData();
   };

   return (
      <div className="app-layout">
         <Sidebar />
         <main className="main-content">
            <div className="page-header">
               <div>
                  <h1>Campus Events</h1>
                  <p className="subtitle">Discover what's happening around you</p>
               </div>
               <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  <FiPlus /> Host Event
               </button>
            </div>

            <div className="tabs">
               <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>Browse Events</button>
               <button className={`tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My Events</button>
            </div>

            {activeTab === 'browse' && (
               <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div className="search-input-wrapper" style={{ flex: 1 }}>
                     <FiSearch className="search-icon" />
                     <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && loadData()}
                     />
                  </div>
                  <select
                     className="form-input"
                     style={{ width: 'auto' }}
                     value={selectedCategory}
                     onChange={e => { setSelectedCategory(e.target.value); setTimeout(loadData, 0); }}
                  >
                     <option value="">All Categories</option>
                     {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            )}

            {loading ? (
               <div className="loading-spinner-container"><div className="spinner"></div></div>
            ) : (
               <div className="grid-layout">
                  {activeTab === 'browse' ? (
                     events.length === 0 ? <p className="text-muted text-center col-span-3">No upcoming events found.</p> :
                        events.map(event => <EventCard key={event.id} event={event} onClick={() => navigate(`/events/${event.id}`)} />)
                  ) : (
                     <>
                        {myEvents.organized.length > 0 && (
                           <div className="section-block col-span-3">
                              <h3>Hosting ({myEvents.organized.length})</h3>
                              <div className="grid-layout">
                                 {myEvents.organized.map(event => <EventCard key={event.id} event={event} onClick={() => navigate(`/events/${event.id}`)} />)}
                              </div>
                           </div>
                        )}
                        {myEvents.attending.length > 0 && (
                           <div className="section-block col-span-3 mt-4">
                              <h3>Going ({myEvents.attending.length})</h3>
                              <div className="grid-layout">
                                 {myEvents.attending.map(event => <EventCard key={event.id} event={event} onClick={() => navigate(`/events/${event.id}`)} />)}
                              </div>
                           </div>
                        )}
                     </>
                  )}
               </div>
            )}

            {showCreateModal && (
               <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                     <h2>Host an Event</h2>
                     <form onSubmit={handleCreateEvent}>
                        <div className="form-group">
                           <label>Event Title</label>
                           <input type="text" className="form-input" required
                              value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                        </div>

                        <div className="row" style={{ display: 'flex', gap: '15px' }}>
                           <div className="form-group" style={{ flex: 1 }}>
                              <label>Date & Time</label>
                              <input type="datetime-local" className="form-input" required
                                 value={newEvent.dateTime} onChange={e => setNewEvent({ ...newEvent, dateTime: e.target.value })} />
                           </div>
                           <div className="form-group" style={{ flex: 1 }}>
                              <label>Category</label>
                              <select className="form-input" required
                                 value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}>
                                 <option value="">Select...</option>
                                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="form-group">
                           <label>Location</label>
                           <div style={{ position: 'relative' }}>
                              <FiMapPin style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                              <input type="text" className="form-input" style={{ paddingLeft: '35px' }} placeholder="Building, Room, or Online Link"
                                 value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
                           </div>
                        </div>

                        <div className="form-group">
                           <label>Description</label>
                           <textarea className="form-input" rows={3}
                              value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                        </div>

                        <div className="form-group">
                           <ImageUpload
                              label="Cover Image (Optional)"
                              onUpload={(url) => setNewEvent(prev => ({ ...prev, imageUrl: url }))}
                           />
                        </div>

                        <div className="modal-actions">
                           <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                           <button type="submit" className="btn btn-primary">Create Event</button>
                        </div>
                     </form>
                  </div>
               </div>
            )}
         </main>

         <style>{`
         .grid-layout {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
         }
         .section-block {
            grid-column: 1 / -1;
         }
         .event-card {
            background: var(--bg-card);
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
            border: 1px solid var(--border-color);
         }
         .event-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
         }
         .event-image {
            height: 140px;
            background: var(--bg-secondary);
            position: relative;
            background-size: cover;
            background-position: center;
         }
         .date-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255,255,255,0.95);
            color: #000;
            padding: 5px 10px;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            line-height: 1.1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
         }
         .date-badge span {
            display: block;
            font-size: 0.8rem;
            text-transform: uppercase;
            color: var(--primary-color);
         }
         .date-badge strong {
            font-size: 1.2rem;
         }
         .event-info {
            padding: 15px;
         }
         .event-info h3 {
            margin: 0 0 8px 0;
            font-size: 1.1rem;
         }
         .event-meta {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-muted);
            font-size: 0.85rem;
            margin-bottom: 5px;
         }
         .category-tag {
            display: inline-block;
            background: var(--bg-secondary);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 10px;
         }
      `}</style>
      </div>
   );
}

function EventCard({ event, onClick }) {
   const date = new Date(event.dateTime);
   return (
      <div className="event-card" onClick={onClick}>
         <div className="event-image" style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'none', backgroundColor: event.imageUrl ? 'transparent' : 'var(--primary-color)' }}>
            <div className="date-badge">
               <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
               <strong>{date.getDate()}</strong>
            </div>
         </div>
         <div className="event-info">
            <h3>{event.title}</h3>
            <div className="event-meta">
               <FiClock size={14} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {event.location && (
               <div className="event-meta">
                  <FiMapPin size={14} /> {event.location}
               </div>
            )}
            <span className="category-tag">{event.category || 'General'}</span>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
               {event._count?.rsvps || 0} Going
            </div>
         </div>
      </div>
   );
}
