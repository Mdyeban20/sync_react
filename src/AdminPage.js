import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, collection, getDoc, getDocs, updateDoc } from 'firebase/firestore';

const AdminPage = ({ user, onLogout }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log("No user is logged in.");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'Users', user.uid);
        console.log("User UID:", user.uid);
        const userDoc = await getDoc(userDocRef);
        console.log("User Document Reference:", userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User document fetched successfully:", userData);
          console.log("User role:", userData.role);
          setIsAdmin(userData.role === 'admin');
        } else {
          console.log("User document does not exist for user ID:", user.uid);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      const usersCollection = collection(db, 'Users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const schedulesCollection = collection(db, 'events');
      const schedulesSnapshot = await getDocs(schedulesCollection);
      const schedulesList = schedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedules(schedulesList);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const approveSchedule = async (scheduleId) => {
    try {
      const scheduleDocRef = doc(db, 'events', scheduleId);
      await updateDoc(scheduleDocRef, { status: 'approved' });
      alert('Schedule approved.');
      fetchSchedules(); // Refresh schedules list
    } catch (error) {
      console.error("Error approving schedule:", error);
      alert('Could not approve schedule.');
    }
  };

  const rejectSchedule = async (scheduleId) => {
    try {
      const scheduleDocRef = doc(db, 'events', scheduleId);
      await updateDoc(scheduleDocRef, { status: 'rejected' });
      alert('Schedule rejected.');
      fetchSchedules(); // Refresh schedules list
    } catch (error) {
      console.error("Error rejecting schedule:", error);
      alert('Could not reject schedule.');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSchedules();
    }
  }, [isAdmin]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-actions">
        <button onClick={fetchAllUsers}>Refresh Users</button>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="users-list">
        <h2>Registered Users</h2>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button>Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="schedules-list">
        <h2>Pending Schedules</h2>
        <button onClick={fetchSchedules}>Refresh Schedules</button>
        {schedules.length === 0 ? (
          <p>No schedules found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                schedule.status === 'pending' && (
                  <tr key={schedule.id}>
                    <td>{schedule.Subject}</td>
                    <td>
  {schedule.StartTime ? 
    (schedule.StartTime.toDate ? schedule.StartTime.toDate().toLocaleString() : new Date(schedule.startTime).toLocaleString()) 
    : 'N/A'}
</td>
<td>
  {schedule.EndTime ? 
    (schedule.EndTime.toDate ? schedule.EndTime.toDate().toLocaleString() : new Date(schedule.endTime).toLocaleString()) 
    : 'N/A'}
</td>
<td>{schedule.status}</td>
                    <td>
                      <button onClick={() => approveSchedule(schedule.id)}>Approve</button>
                      <button onClick={() => rejectSchedule(schedule.id)}>Reject</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
