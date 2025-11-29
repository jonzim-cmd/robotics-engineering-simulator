'use client';

import React, { useState, useEffect } from 'react';
import { getAdminData, createStudent, deleteUser, type User, type ProgressEvent } from '../actions';
import { Lock, Users, FileText, RefreshCw, Plus, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState<(ProgressEvent & { user_name: string })[]>([]);

  // Create Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Student Filter State
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent | null, pinOverride?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const pinToUse = pinOverride || pin;
    const result = await getAdminData(pinToUse);
    
    if (result.success) {
      setUsers(result.users || []);
      setProgress(result.progress || []);
      setIsAuthenticated(true);
    } else {
      setError(result.error || 'Zugriff verweigert');
      // If auto-submit failed, maybe clear pin to allow retry
      if (pinOverride) setPin('');
    }
    setLoading(false);
  };

  // Auto-submit when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handleLogin(null, pin);
    }
  }, [pin]);

  const refreshData = async () => {
    setLoading(true);
    const result = await getAdminData('1111'); // We know the PIN is correct if we are here
    if (result.success) {
      setUsers(result.users || []);
      setProgress(result.progress || []);
    }
    setLoading(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    setIsCreating(true);
    const result = await createStudent(newStudentName);

    if (result.success) {
      setNewStudentName('');
      await refreshData(); // Reload list
    } else {
      alert(result.error);
    }
    setIsCreating(false);
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Möchten Sie ${userName} und alle zugehörigen Daten wirklich löschen?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteUser(userId);

    if (result.success) {
      // If the deleted user was selected, reset selection
      if (selectedStudentId === userId) {
        setSelectedStudentId(null);
      }
      await refreshData();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  // Filter reflection-like events (all reflection UI variants)
  const reflectionTypes = new Set(['REFLECTION', 'REFLECTION_CALL', 'REFLECTION_DIALOG', 'INSURANCE_FORM_SUBMITTED']);

  // Filter reflections only
  const getReflectionsForUser = (userId: number) => {
    return progress
      .filter((p) => p.user_id === userId && reflectionTypes.has(p.event_type))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Helper function to render event payload cleanly
  const renderEventPayload = (payload: any) => {
    if (typeof payload === 'string') {
      return payload.length > 200 ? payload.substring(0, 200) + '...' : payload;
    }

    if (typeof payload === 'object' && payload !== null) {
      // Prioritize showing the student's answer or explanation
      const textContent = payload.answer || payload.explanation;
      if (textContent) {
        const answer = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;
        return (
          <div>
            <div className="font-semibold text-cyan-400 text-xs mb-1">Answer:</div>
            <div>{answer}</div>
            {payload.partner && (
              <div className="text-slate-500 text-xs mt-2 italic">Partner: {payload.partner}</div>
            )}
          </div>
        );
      }

      // Fallback to JSON if no answer field
      const jsonStr = JSON.stringify(payload);
      return jsonStr.length > 200 ? jsonStr.substring(0, 200) + '...' : jsonStr;
    }

    return String(payload);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-mono p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-lg shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-800 rounded-full">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-center text-xl font-bold mb-6 text-cyan-500">ADMINISTRATOR ACCESS</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">ACCESS PIN</label>
              <input 
                type="password" 
                value={pin}
                maxLength={4}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-center tracking-[0.5em] focus:border-cyan-500 outline-none transition-colors font-mono text-xl"
                placeholder="••••"
                autoFocus
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm justify-center bg-red-400/10 p-2 rounded">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {!loading && pin.length < 4 && (
              <button 
                type="submit" // Keep as submit for Enter key support on partial PINs
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded font-bold transition-colors disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                Eingabe bestätigen
              </button>
            )}
            
            {loading && (
              <div className="text-center text-cyan-500 text-xs animate-pulse uppercase tracking-widest">
                Verifying Access Credentials...
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors p-2 hover:bg-slate-800/50 rounded"
            title="Zurück zur Login-Seite"
          >
            <ArrowLeft size={20} />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-cyan-500 flex items-center gap-2">
              <Users className="w-6 h-6" />
              CLASSROOM MANAGEMENT
            </h1>
            <p className="text-slate-500 text-sm mt-1">Active Students: {users.length}</p>
          </div>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student List & Creation */}
        <div className="space-y-6">
          {/* Create Student */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase">Register Student</h2>
            <form onSubmit={handleCreateStudent} className="flex gap-2">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Name / ID"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none uppercase"
              />
              <button
                disabled={isCreating || !newStudentName.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Student List */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
             <h2 className="text-sm font-bold text-slate-400 p-4 border-b border-slate-800 uppercase">Roster</h2>
             <div className="max-h-[600px] overflow-y-auto">
               {/* "All Students" Option */}
               <div
                 onClick={() => setSelectedStudentId(null)}
                 className={`p-3 border-b border-slate-800 cursor-pointer transition-colors font-semibold ${
                   selectedStudentId === null
                     ? 'bg-cyan-600 text-white'
                     : 'hover:bg-slate-800/50 text-slate-400'
                 }`}
               >
                 All Students
               </div>

               {users.length === 0 ? (
                 <div className="p-8 text-center text-slate-600 text-sm">No students registered yet.</div>
               ) : (
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-950 text-slate-500">
                     <tr>
                       <th className="p-3 font-normal">Name</th>
                       <th className="p-3 font-normal text-right">Last Active</th>
                       <th className="p-3 font-normal w-12"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.map(user => (
                       <tr
                         key={user.id}
                         className={`border-b border-slate-800 transition-colors ${
                           selectedStudentId === user.id
                             ? 'bg-cyan-600/20 border-cyan-500'
                             : 'hover:bg-slate-800/50'
                         }`}
                       >
                         <td
                           onClick={() => setSelectedStudentId(user.id)}
                           className="p-3 font-medium text-slate-300 cursor-pointer"
                         >
                           {user.name}
                         </td>
                         <td
                           onClick={() => setSelectedStudentId(user.id)}
                           className="p-3 text-right text-slate-500 text-xs cursor-pointer"
                         >
                           {new Date(user.last_active).toLocaleDateString()} <br/>
                           {new Date(user.last_active).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </td>
                         <td className="p-3 text-center">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteUser(user.id, user.name);
                             }}
                             className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded transition-colors"
                             title="Benutzer löschen"
                           >
                             <Trash2 size={16} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Reflections / Details */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">
            Recent Activity & Reflections
            {selectedStudentId !== null && (
              <span className="text-cyan-400 ml-2">
                - {users.find(u => u.id === selectedStudentId)?.name}
              </span>
            )}
          </h2>

          <div className="space-y-4">
            {users
              .filter(user => selectedStudentId === null || user.id === selectedStudentId)
              .map(user => {
                const userReflections = getReflectionsForUser(user.id);
                if (userReflections.length === 0) return null;

                return (
                  <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className="font-bold text-slate-200">{user.name}</h3>
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                      {userReflections.map((ref) => (
                        <div key={ref.id} className="relative">
                          <div className="text-xs text-cyan-500 mb-1 flex justify-between">
                            <span className="font-bold uppercase flex items-center gap-2">
                              <FileText size={12} /> Level {ref.level_id}
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] tracking-wide text-slate-200 border border-slate-700">
                                {ref.event_type}
                              </span>
                            </span>
                            <span className="opacity-50">{new Date(ref.created_at).toLocaleString()}</span>
                          </div>
                          <div className="text-slate-300 bg-slate-950 p-3 rounded text-sm italic">
                            "{typeof ref.payload === 'string' ? ref.payload : (ref.payload as any).answer || (ref.payload as any).explanation || JSON.stringify(ref.payload)}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            {users
              .filter(user => selectedStudentId === null || user.id === selectedStudentId)
              .every(u => getReflectionsForUser(u.id).length === 0) && (
               <div className="p-12 border border-dashed border-slate-800 rounded-lg text-center text-slate-600">
                 Waiting for incoming transmissions from student terminals...
               </div>
            )}

            {/* Global Event Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <h3 className="font-bold text-slate-200 uppercase text-sm">Event Log (letzte 50)</h3>
              </div>
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {progress
                  .filter(evt => selectedStudentId === null || evt.user_id === selectedStudentId)
                  .length === 0 && (
                  <div className="text-slate-500 text-sm">Keine Events erfasst.</div>
                )}
                {progress
                  .filter(evt => selectedStudentId === null || evt.user_id === selectedStudentId)
                  .slice(0, 50)
                  .map((evt) => {
                    return (
                      <div key={evt.id} className="bg-slate-950 p-3 rounded border border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{evt.user_name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] tracking-wide text-slate-200">
                              {evt.event_type}
                            </span>
                            <span className="text-slate-500">Level {evt.level_id}</span>
                          </span>
                          <span className="opacity-60">{new Date(evt.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-300 text-sm break-words">
                          {renderEventPayload(evt.payload)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
