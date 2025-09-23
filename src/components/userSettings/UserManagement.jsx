// import React, { useEffect, useState } from "react";
// import { Trash2, Crown, User, X, AlertTriangle } from "lucide-react";
// import api from "@/utils/api";

// const UserManagement = () => {
//   const [users, setUsers] = useState([
//     {
//       id: 17,
//       email: "vishwajeetrout8@gmail.com",
//       role: "Member",
//       created_at: "2025-06-29T13:02:32.315Z",
//     },
//     {
//       id: 16,
//       email: "vishwajeet@infrahive.ai",
//       role: "Member",
//       created_at: "2025-06-29T11:57:04.422Z",
//     },
//     {
//       id: 14,
//       email: "admin@infrahive.ai",
//       role: "Owner",
//       created_at: "2025-06-29T10:19:30.237Z",
//     },
//   ]);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);

//   // Sort users: Owner first, then Members
//   const sortedUsers = [...users].sort((a, b) => {
//     if (a.role === "Owner" && b.role !== "Owner") return -1;
//     if (b.role === "Owner" && a.role !== "Owner") return 1;
//     return 0;
//   });

//   const handleDeleteClick = (user) => {
//     setUserToDelete(user);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async (userId) => {
//     if (userToDelete) {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await api.delete(`/users/${userId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         console.log(res.data);
//         setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
//         console.log(res);
//       } catch (error) {
//         console.log(error);
//       }
//       setShowDeleteModal(false);
//       setUserToDelete(null);
//     }
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setUserToDelete(null);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   useEffect(() => {
//     const fetchAllUsers = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await api.get("/users", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         console.log(res.data);
//         setUsers(res.data);
//         console.log(res);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     fetchAllUsers();
//   }, []);

//   return (
//     <div className="mx-auto p-6 bg-white mt-2">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           User Management
//         </h1>
//         <p className="text-gray-600">Manage your team members</p>
//       </div>

//       <div className="space-y-4">
//         {sortedUsers.map((user) => (
//           <div
//             key={user.id}
//             className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${
//               user.role === "Owner"
//                 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm"
//                 : "bg-gray-50 border-gray-200 hover:bg-gray-100"
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div
//                   className={`p-3 rounded-full ${
//                     user.role === "Owner"
//                       ? "bg-amber-100 text-amber-700"
//                       : "bg-blue-100 text-blue-700"
//                   }`}
//                 >
//                   {user.role === "Owner" ? (
//                     <Crown className="w-6 h-6" />
//                   ) : (
//                     <User className="w-6 h-6" />
//                   )}
//                 </div>

//                 <div>
//                   <div className="flex items-center space-x-3">
//                     <h3
//                       className={`text-lg ${
//                         user.role === "Owner"
//                           ? "font-extrabold text-gray-900"
//                           : "font-semibold text-gray-800"
//                       }`}
//                     >
//                       {user.email}
//                     </h3>
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         user.role === "Owner"
//                           ? "bg-amber-200 text-amber-800 font-bold"
//                           : "bg-blue-200 text-blue-800"
//                       }`}
//                     >
//                       {user.role}
//                     </span>
//                   </div>
//                   <p
//                     className={`text-sm mt-1 ${
//                       user.role === "Owner"
//                         ? "text-gray-700 font-medium"
//                         : "text-gray-500"
//                     }`}
//                   >
//                     Joined on {formatDate(user.created_at)}
//                   </p>
//                   <p
//                     className={`text-xs mt-1 ${
//                       user.role === "Owner"
//                         ? "text-gray-600 font-medium"
//                         : "text-gray-400"
//                     }`}
//                   >
//                     ID: {user.id}
//                   </p>
//                 </div>
//               </div>

//               {user.role === "Member" && (
//                 <button
//                   onClick={() => handleDeleteClick(user)}
//                   className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                   title="Delete user"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {users.length === 0 && (
//         <div className="text-center py-12">
//           <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             No users found
//           </h3>
//           <p className="text-gray-500">All users have been removed.</p>
//         </div>
//       )}

//       <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
//         <div className="flex items-start space-x-3">
//           <div className="flex-shrink-0">
//             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600 text-sm font-semibold">ℹ</span>
//             </div>
//           </div>
//           <div>
//             <h4 className="text-sm font-medium text-blue-900 mb-1">
//               User Management Info
//             </h4>
//             <p className="text-sm text-blue-700">
//               Click the trash icon to remove users from your organization.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-red-100 rounded-full">
//                   <AlertTriangle className="w-6 h-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Remove Member
//                 </h3>
//               </div>
//               <button
//                 onClick={handleCancelDelete}
//                 className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-400" />
//               </button>
//             </div>

//             <div className="mb-6">
//               <p className="text-gray-600 mb-3">
//                 Are you sure you want to remove this member from your workspace?
//               </p>
//               {userToDelete && (
//                 <div className="bg-gray-50 p-3 rounded-lg border">
//                   <p className="font-medium text-gray-900">
//                     {userToDelete.email}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Member since {formatDate(userToDelete.created_at)}
//                   </p>
//                 </div>
//               )}
//               <p className="text-sm text-red-600 mt-3 font-medium">
//                 This action cannot be undone.
//               </p>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={handleCancelDelete}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleConfirmDelete(userToDelete.id)}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//               >
//                 Remove Member
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

// import React, { useEffect, useState } from "react";
// import { Trash2, Crown, User, X, AlertTriangle } from "lucide-react";
// import api from "@/utils/api";

// const UserManagement = () => {
//   const [currentUser, setCurrentUser] = useState(null); // Logged-in admin
//   const [admins, setAdmins] = useState([]); // All admins (Owners)
//   const [invitedMembers, setInvitedMembers] = useState([]); // Members invited by current admin
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);

//   // Fetch current user details
//   const fetchCurrentUser = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await api.get("/user", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setCurrentUser(res.data);
//     } catch (error) {
//       console.error("Error fetching current user:", error);
//     }
//   };

//   // Fetch all users to get admins
//   // const fetchAdmins = async () => {
//   //   const token = localStorage.getItem("token");
//   //   try {
//   //     const res = await api.get("/users", {
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
//   //     const owners = res.data.filter((user) => user.role === "Owner");
//   //     setAdmins(owners);
//   //   } catch (error) {
//   //     console.error("Error fetching admins:", error);
//   //   }
//   // };

//   // Fetch members invited by the current admin
//   const fetchInvitedMembers = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await api.get("/invited-members", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setInvitedMembers(res.data);
//     } catch (error) {
//       console.error("Error fetching invited members:", error);
//     }
//   };

//   // Run all fetches on component mount
//   useEffect(() => {
//     fetchCurrentUser();
//     // fetchAdmins();
//     fetchInvitedMembers();
//   }, []);

//   // Handle delete click
//   const handleDeleteClick = (user) => {
//     setUserToDelete(user);
//     setShowDeleteModal(true);
//   };

//   // Handle confirm delete
//   const handleConfirmDelete = async (userId) => {
//     if (userToDelete) {
//       const token = localStorage.getItem("token");
//       try {
//         await api.delete(`/users/${userId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setInvitedMembers((prevMembers) =>
//           prevMembers.filter((user) => user.id !== userId)
//         );
//       } catch (error) {
//         console.error("Error deleting user:", error);
//       }
//       setShowDeleteModal(false);
//       setUserToDelete(null);
//     }
//   };

//   // Handle cancel delete
//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setUserToDelete(null);
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="mx-auto p-6 bg-white mt-2">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           User Management
//         </h1>
//         <p className="text-gray-600">Manage your team members</p>
//       </div>

//       {/* Logged-in Admin Section */}
//       {currentUser && (
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Currently Logged-in Admin
//           </h2>
//           <div className="p-6 rounded-lg border bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 rounded-full bg-amber-100 text-amber-700">
//                 <Crown className="w-6 h-6" />
//               </div>
//               <div>
//                 <div className="flex items-center space-x-3">
//                   <h3 className="text-lg font-extrabold text-gray-900">
//                     {currentUser.email}
//                   </h3>
//                   <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-200 text-amber-800 font-bold">
//                     Owner
//                   </span>
//                 </div>
//                 <p className="text-sm mt-1 text-gray-700 font-medium">
//                   Joined on {formatDate(currentUser.created_at)}
//                 </p>
//                 <p className="text-xs mt-1 text-gray-600 font-medium">
//                   ID: {currentUser.id}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Admins Section */}
//       {/* {admins.length > 0 && (
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Admins (Owners)
//           </h2>
//           <div className="space-y-4">
//             {admins
//               .filter((admin) => admin.id !== currentUser?.id) // Exclude current user
//               .map((admin) => (
//                 <div
//                   key={admin.id}
//                   className="p-6 rounded-lg border bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm"
//                 >
//                   <div className="flex items-center space-x-4">
//                     <div className="p-3 rounded-full bg-amber-100 text-amber-700">
//                       <Crown className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <div className="flex items-center space-x-3">
//                         <h3 className="text-lg font-extrabold text-gray-900">
//                           {admin.email}
//                         </h3>
//                         <span className="px-3 py-1 rounded-full text-sm bg-amber-200 text-amber-800 font-bold">
//                           Owner
//                         </span>
//                       </div>
//                       <p className="text-sm mt-1 text-gray-700 font-medium">
//                         Joined on {formatDate(admin.created_at)}
//                       </p>
//                       <p className="text-xs mt-1 text-gray-600 font-medium">
//                         ID: {admin.id}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       )} */}

//       {/* Invited Members Section */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">
//           Invited Members
//         </h2>
//         {invitedMembers.length > 0 ? (
//           <div className="space-y-4">
//             {invitedMembers.map((member) => (
//               <div
//                 key={member.id}
//                 className="p-6 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-4">
//                     <div className="p-3 rounded-full bg-blue-100 text-blue-700">
//                       <User className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <div className="flex items-center space-x-3">
//                         <h3 className="text-lg font-semibold text-gray-800">
//                           {member.email}
//                         </h3>
//                         <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-800">
//                           Member
//                         </span>
//                       </div>
//                       <p className="text-sm mt-1 text-gray-500">
//                         Joined on {formatDate(member.created_at)}
//                       </p>
//                       <p className="text-xs mt-1 text-gray-400">
//                         ID: {member.id}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handleDeleteClick(member)}
//                     className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                     title="Delete user"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No members invited
//             </h3>
//             <p className="text-gray-500">
//               You haven't invited any members yet.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Info Section */}
//       <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
//         <div className="flex items-start space-x-3">
//           <div className="flex-shrink-0">
//             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600 text-sm font-semibold">ℹ</span>
//             </div>
//           </div>
//           <div>
//             <h4 className="text-sm font-medium text-blue-900 mb-1">
//               User Management Info
//             </h4>
//             <p className="text-sm text-blue-700">
//               Click the trash icon to remove invited members from your
//               organization.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-red-100 rounded-full">
//                   <AlertTriangle className="w-6 h-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Remove Member
//                 </h3>
//               </div>
//               <button
//                 onClick={handleCancelDelete}
//                 className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-400" />
//               </button>
//             </div>

//             <div className="mb-6">
//               <p className="text-gray-600 mb-3">
//                 Are you sure you want to remove this member from your workspace?
//               </p>
//               {userToDelete && (
//                 <div className="bg-gray-50 p-3 rounded-lg border">
//                   <p className="font-medium text-gray-900">
//                     {userToDelete.email}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Member since {formatDate(userToDelete.created_at)}
//                   </p>
//                 </div>
//               )}
//               <p className="text-sm text-red-600 mt-3 font-medium">
//                 This action cannot be undone.
//               </p>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={handleCancelDelete}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleConfirmDelete(userToDelete.id)}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//               >
//                 Remove Member
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;



// import React, { useEffect, useState } from "react";
// import { Trash2, Crown, User, X, AlertTriangle } from "lucide-react";
// import api from "@/utils/api";

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);

//   // Fetch current user and their invited users
//   useEffect(() => {
//     const fetchCurrentUserAndUsers = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         // Fetch current user details
//         const userRes = await api.get("/user", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const loggedInUser = userRes.data;
//         setCurrentUser(loggedInUser);

//         // Fetch users (owner + invited members)
//         if (loggedInUser.role === "Owner") {
//           const res = await api.get("/users", {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
//           setUsers(res.data);
//         } else {
//           setUsers([loggedInUser]);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchCurrentUserAndUsers();
//   }, []);

//   // Sort users: Owner first, then Members
//   const sortedUsers = [...users].sort((a, b) => {
//     if (a.role === "Owner" && b.role !== "Owner") return -1;
//     if (b.role === "Owner" && a.role !== "Owner") return 1;
//     return 0;
//   });

//   const handleDeleteClick = (user) => {
//     setUserToDelete(user);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async (userId) => {
//     if (userToDelete) {
//       const token = localStorage.getItem("token");
//       try {
//         await api.delete(`/users/${userId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
//       } catch (error) {
//         console.error("Error deleting user:", error);
//       }
//       setShowDeleteModal(false);
//       setUserToDelete(null);
//     }
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setUserToDelete(null);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="mx-auto p-6 bg-white mt-2">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           User Management
//         </h1>
//         <p className="text-gray-600">Manage your team members</p>
//       </div>

//       <div className="space-y-4">
//         {sortedUsers.map((user) => (
//           <div
//             key={user.id}
//             className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${
//               user.role === "Owner"
//                 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm"
//                 : "bg-gray-50 border-gray-200 hover:bg-gray-100"
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div
//                   className={`p-3 rounded-full ${
//                     user.role === "Owner"
//                       ? "bg-amber-100 text-amber-700"
//                       : "bg-blue-100 text-blue-700"
//                   }`}
//                 >
//                   {user.role === "Owner" ? (
//                     <Crown className="w-6 h-6" />
//                   ) : (
//                     <User className="w-6 h-6" />
//                   )}
//                 </div>

//                 <div>
//                   <div className="flex items-center space-x-3">
//                     <h3
//                       className={`text-lg ${
//                         user.role === "Owner"
//                           ? "font-extrabold text-gray-900"
//                           : "font-semibold text-gray-800"
//                       }`}
//                     >
//                       {user.email}
//                     </h3>
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         user.role === "Owner"
//                           ? "bg-amber-200 text-amber-800 font-bold"
//                           : "bg-blue-200 text-blue-800"
//                       }`}
//                     >
//                       {user.role}
//                     </span>
//                   </div>
//                   <p
//                     className={`text-sm mt-1 ${
//                       user.role === "Owner"
//                         ? "text-gray-700 font-medium"
//                         : "text-gray-500"
//                     }`}
//                   >
//                     Joined on {formatDate(user.created_at)}
//                   </p>
//                   <p
//                     className={`text-xs mt-1 ${
//                       user.role === "Owner"
//                         ? "text-gray-600 font-medium"
//                         : "text-gray-400"
//                     }`}
//                   >
//                     ID: {user.id}
//                   </p>
//                 </div>
//               </div>

//               {user.role === "Member" && currentUser?.role === "Owner" && (
//                 <button
//                   onClick={() => handleDeleteClick(user)}
//                   className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                   title="Delete user"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {sortedUsers.length === 0 && (
//         <div className="text-center py-12">
//           <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             No users found
//           </h3>
//           <p className="text-gray-500">
//             {currentUser?.role === "Owner"
//               ? "No members have accepted your invitations yet."
//               : "You have no team members to manage."}
//           </p>
//         </div>
//       )}

//       {currentUser?.role === "Owner" && (
//         <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                 <span className="text-blue-600 text-sm font-semibold">ℹ</span>
//               </div>
//             </div>
//             <div>
//               <h4 className="text-sm font-medium text-blue-900 mb-1">
//                 User Management Info
//               </h4>
//               <p className="text-sm text-blue-700">
//                 Click the trash icon to remove users from your organization.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-red-100 rounded-full">
//                   <AlertTriangle className="w-6 h-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Remove Member
//                 </h3>
//               </div>
//               <button
//                 onClick={handleCancelDelete}
//                 className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-400" />
//               </button>
//             </div>

//             <div className="mb-6">
//               <p className="text-gray-600 mb-3">
//                 Are you sure you want to remove this member from your workspace?
//               </p>
//               {userToDelete && (
//                 <div className="bg-gray-50 p-3 rounded-lg border">
//                   <p className="font-medium text-gray-900">
//                     {userToDelete.email}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Member since {formatDate(userToDelete.created_at)}
//                   </p>
//                 </div>
//               )}
//               <p className="text-sm text-red-600 mt-3 font-medium">
//                 This action cannot be undone.
//               </p>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={handleCancelDelete}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleConfirmDelete(userToDelete.id)}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//               >
//                 Remove Member
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;



import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Crown, User, X, AlertTriangle } from "lucide-react";
import api from "@/utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Extract fetch function for reuse
  const fetchCurrentUserAndUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      // Fetch current user details
      const userRes = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const loggedInUser = userRes.data;
      setCurrentUser(loggedInUser);

      // Fetch users (owner + invited members)
      if (loggedInUser.role === "Owner") {
        const res = await api.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } else {
        setUsers([loggedInUser]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCurrentUserAndUsers();
  }, [fetchCurrentUserAndUsers]);

  // Sort users: Owner first, then Members
  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === "Owner" && b.role !== "Owner") return -1;
    if (b.role === "Owner" && a.role !== "Owner") return 1;
    return 0;
  });

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (userId) => {
    if (userToDelete) {
      const token = localStorage.getItem("token");
      try {
        await api.delete(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto p-6 bg-white mt-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">Manage your team members</p>
      </div>

      <div className="space-y-4">
        {sortedUsers.map((user) => (
          <div
            key={user.id}
            className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${
              user.role === "Owner"
                ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${
                    user.role === "Owner"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role === "Owner" ? (
                    <Crown className="w-6 h-6" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-3">
                    <h3
                      className={`text-lg ${
                        user.role === "Owner"
                          ? "font-extrabold text-gray-900"
                          : "font-semibold text-gray-800"
                      }`}
                    >
                      {user.email}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === "Owner"
                          ? "bg-amber-200 text-amber-800 font-bold"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      user.role === "Owner"
                        ? "text-gray-700 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Joined on {formatDate(user.created_at)}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      user.role === "Owner"
                        ? "text-gray-600 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    ID: {user.id}
                  </p>
                </div>
              </div>

              {user.role === "Member" && currentUser?.role === "Owner" && (
                <button
                  onClick={() => handleDeleteClick(user)}
                  className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  title="Delete user"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            {currentUser?.role === "Owner"
              ? "No members have accepted your invitations yet."
              : "You have no team members to manage."}
          </p>
        </div>
      )}

      {currentUser?.role === "Owner" && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">ℹ</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                User Management Info
              </h4>
              <p className="text-sm text-blue-700">
                Click the trash icon to remove users from your organization.
              </p>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Remove Member
                </h3>
              </div>
              <button
                onClick={handleCancelDelete}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to remove this member from your workspace?
              </p>
              {userToDelete && (
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="font-medium text-gray-900">
                    {userToDelete.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(userToDelete.created_at)}
                  </p>
                </div>
              )}
              <p className="text-sm text-red-600 mt-3 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(userToDelete.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;