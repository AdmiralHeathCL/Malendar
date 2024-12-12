import React, { useState, useEffect } from 'react';
import Classcard from '../../components/common/Classcard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AllclassPage = () => {
  const queryClient = useQueryClient();
  const [classes, setClasses] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Track search input
  const [filteredStudents, setFilteredStudents] = useState([]); // Filtered student list
  const [selectedStudents, setSelectedStudents] = useState([]); // Selected students for the cluster
  const [clusterName, setClusterName] = useState(""); // Track the new cluster name
  const [sortMethod, setSortMethod] = useState('alphabetical'); // Sorting method state

  // Fetch authenticated user
  const { data: authUserData } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
  });

  // Fetch clusters (classes)
  const { data: clusters, isLoading, error } = useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
  });

  // Fetch users for the cluster creation (students and teachers)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch("/api/users/all");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Create new cluster mutation
  const createClusterMutation = useMutation({
    mutationFn: async ({ name, students }) => {
      const res = await fetch(`/api/clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, students, isActive: [true] }), // Set isActive to true by default
      });
      if (!res.ok) {
        throw new Error("Failed to create cluster");
      }
    },
    onSuccess: () => {
      toast.success('班级创建成功');
      queryClient.invalidateQueries(['clusters']); // Refresh clusters
      setClusterName(''); // Reset input fields
      setSelectedStudents([]);
    },
    onError: () => {
      toast.error('班级创建失败');
    },
  });

  // Update cluster isActive status
  const mutation = useMutation({
    mutationFn: async ({ classId, isActive }) => {
      const res = await fetch(`/api/clusters/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        throw new Error("Failed to update class status");
      }
    },
    onSuccess: () => {
      toast.success('更新成功');
      queryClient.invalidateQueries(['clusters']);
    },
    onError: () => {
      toast.error('Failed to update class');
    },
  });

  // Delete cluster (class)
  const deleteMutation = useMutation({
    mutationFn: async (classId) => {
      const res = await fetch(`/api/clusters/${classId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete class');
    },
    onSuccess: () => {
      toast.success('班级删除成功');
      queryClient.invalidateQueries(['clusters']);
    },
    onError: () => {
      toast.error('删除班级失败');
    },
  });

  // Filter students by search term and sort by first character
  useEffect(() => {
    if (usersData && usersData.data) {
      const filtered = usersData.data
        .filter(user => (user.usertype === 'isStudent') &&
          user.username.toLowerCase().startsWith(searchTerm.toLowerCase())) // Match names from the beginning
        .sort((a, b) => a.username.localeCompare(b.username)); // Sort alphabetically
      setFilteredStudents(filtered);
    }
  }, [searchTerm, usersData]);

  useEffect(() => {
    if (authUserData) {
      setAuthUser(authUserData);
    }
    if (clusters && clusters.data) {
      setClasses(clusters.data);
    }
  }, [authUserData, clusters]);

  const handleToggleActive = (classId, isActive) => {
    mutation.mutate({ classId, isActive: !isActive });
  };

  const handleDelete = (classId) => {
    deleteMutation.mutate(classId);
  };

  const handleCreateCluster = () => {
    if (!clusterName || selectedStudents.length === 0) {
      toast.error("请输入班级名称并选择学生或教师");
      return;
    }
    createClusterMutation.mutate({ name: clusterName, students: selectedStudents });
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
    setSearchTerm(""); // Clear search bar after selection
  };

  // Handle sorting of the active classes
  const sortedActiveClasses = () => {
    return [...activeClasses].sort((a, b) => {
      if (sortMethod === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortMethod === 'date') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
  };

  const activeClasses = classes.filter(classItem => classItem.isActive[0]);
  const inactiveClasses = classes.filter(classItem => !classItem.isActive[0]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>班级加载错误</div>;

  return (
    <div className="w-full p-8">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">所有班级</h1>

      {authUser?.usertype === 'isAdmin' && (
        <div>
          <select
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
            className="select select-bordered select-sm text-sm"
          >
            <option value="alphabetical">按名称排序</option>
            <option value="date">按创建日期排序</option>
          </select>
        </div>
      )}
    </div>


      <div className="py-2">
        <div className="flex flex-wrap">
          {sortedActiveClasses().map((classItem) => (
            <Classcard
              key={classItem._id}
              title={classItem.name}
              imageUrl="../assets/Banana.jpg"
              classId={classItem._id}
              isActive={classItem.isActive[0]}
              handleToggleActive={() => handleToggleActive(classItem._id, classItem.isActive[0])}
              handleDelete={handleDelete} // Pass the delete handler
              userType={authUser?.usertype}
            />
          ))}
        </div>
      </div>

      {authUser?.usertype === 'isAdmin' && (
        <div>
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">显示隐藏的班级</div>
            <div className="collapse-content">
              <div className="px-2 py-1">
                <div className="flex flex-wrap">
                  {inactiveClasses.map((classItem) => (
                    <Classcard
                      key={classItem._id}
                      title={classItem.name}
                      imageUrl="../assets/Banana.jpg"
                      classId={classItem._id}
                      isActive={classItem.isActive[0]}
                      handleToggleActive={() => handleToggleActive(classItem._id, classItem.isActive[0])}
                      handleDelete={handleDelete} // Pass the delete handler
                      userType={authUser?.usertype}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='p-1'></div>
          
          {/* Create Cluster Section */}
          <div className="collapse bg-base-200">
            <input type="checkbox" defaultChecked /> {/* This makes 创建班级 open by default */}
            <div className="collapse-title text-xl font-medium">创建班级</div>
            <div className="collapse-content">
              <div className="px-4 py-2">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="输入班级名称"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                  />

                  {/* Daisy UI Search Bar */}
                  <label className="input input-bordered flex items-center gap-2">
                    <input
                      type="text"
                      className="grow"
                      placeholder="搜索学生"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70">
                      <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd" />
                    </svg>
                  </label>

                  {/* Dropdown with Sorted Students and Teachers */}
                  <div className="collapse bg-base-100 mt-2">
                    <input type="checkbox" defaultChecked /> {/* This makes 选择学生 open by default */}
                    <div className="collapse-title text-lg font-medium">选择学生</div>
                    <div className="collapse-content">
                      <ul className="list-disc pl-4">
                        {filteredStudents.map(user => (
                          <li
                            key={user._id}
                            onClick={() => handleSelectStudent(user._id)}
                            className="cursor-pointer hover:bg-gray-200 p-2">
                            {user.username}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Section for selected students */}
                  <div className="mt-4">
                    <h2 className="text-lg font-medium">已选学生</h2>
                    <ul className="list-disc pl-4">
                      {selectedStudents.map(selectedId => {
                        const student = usersData?.data?.find(user => user._id === selectedId);
                        return (
                          <li
                            key={selectedId}
                            onClick={() => handleSelectStudent(selectedId)}
                            className="cursor-pointer text-[#c4aa42]">
                            {student?.username}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <button
                    className="btn btn-primary mt-2"
                    onClick={handleCreateCluster}
                  >
                    创建班级
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllclassPage;
