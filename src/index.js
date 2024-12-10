import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
import { db, auth, signOut } from './firebase';
import { getDocs, addDoc, collection, query, where, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import Login from './Login';
import AdminPage from './AdminPage'; // Import the new AdminPage

// Import Syncfusion licensing
import { registerLicense } from '@syncfusion/ej2-base';

// Register your Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF1cWGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEFiW35ecXFXR2BdWEF3Ww==');

const App = () => {
  const [user, setUser] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState('schedule');

  // Fetch events for the current logged-in user
  const fetchEvents = async (userId) => {
    try {
      console.log('Fetching events for userId:', userId);
      const eventsCollection = collection(db, 'events');
      const q = query(eventsCollection, where('userId', '==', userId));
      const eventSnapshot = await getDocs(q);
      
      console.log('Event Snapshot Size:', eventSnapshot.size);
      const eventList = eventSnapshot.docs.map(doc => {
        const eventData = doc.data();
        
        // Convert Firestore timestamps to JavaScript Date objects
        const processedEventData = {
          ...eventData,
          StartTime: eventData.StartTime?.toDate(), // Convert StartTime if it exists
          EndTime: eventData.EndTime?.toDate(),     // Convert EndTime if it exists
        };
  
        console.log('Individual Event:', { 
          Id: doc.id, 
          ...processedEventData 
        });
  
        return { 
          Id: doc.id, 
          Subject: processedEventData.Subject || '',
          StartTime: processedEventData.StartTime,
          EndTime: processedEventData.EndTime,
          // Add other necessary fields for Syncfusion Schedule
          ...processedEventData 
        };
      });
      
      console.log('Event List:', eventList);
      setEvents(eventList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Handle event creation, update, and deletion
  const handleActionComplete = async (args) => {
    if (!user) return; // Don't allow action if not logged in

    const userId = user.uid;

    if (args.requestType === 'eventCreated') {
      const createdEvent = {
        ...args.data[0],
        userId: userId, // Associate event with user
        StartTime: Timestamp.fromDate(new Date(args.data[0].StartTime)),
        EndTime: Timestamp.fromDate(new Date(args.data[0].EndTime)),
        status: 'pending',
      };
      const docRef = await addDoc(collection(db, 'events'), createdEvent);
      setEvents(prev => [...prev, { Id: docRef.id, ...createdEvent }]);
    } else if (args.requestType === 'eventChanged') {
      await updateEvent(args.data);
    } else if (args.requestType === 'eventRemoved') {
      await deleteEvent(args.data[0]);
    }
  };

  const updateEvent = async (data) => {
    const eventDoc = doc(db, 'events', data.Id);
    const updatedData = {
      ...data,
      StartTime: Timestamp.fromDate(new Date(data.StartTime)),
      EndTime: Timestamp.fromDate(new Date(data.EndTime)),
    };
    await updateDoc(eventDoc, updatedData);
    fetchEvents(user.uid);
  };

  const deleteEvent = async (data) => {
    const eventDoc = doc(db, 'events', data.Id);
    await deleteDoc(eventDoc);
    fetchEvents(user.uid);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEvents([]);
      setCurrentPage('login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  // Render different pages based on authentication and current page
  const renderPage = () => {
    if (!user) {
      return <Login setUser={setUser} />;
    }

    switch (currentPage) {
      case 'schedule':
        return (
          <div>
            <div className="page-nav">
              <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
              <button onClick={() => setCurrentPage('admin')}>Admin</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
            <ScheduleComponent
              height="650px"
              eventSettings={{ dataSource: events }}
              actionComplete={handleActionComplete}
            >
              <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
            </ScheduleComponent>
          </div>
        );
      
      case 'admin':
        return <AdminPage user={user} onLogout={handleLogout} />;
      
      default:
        return <Login setUser={setUser} />;
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchEvents(user.uid);
    }
  }, [user]);

  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default App;
createRoot(document.getElementById('schedule')).render(<App />);