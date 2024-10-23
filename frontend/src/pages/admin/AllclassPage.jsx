import React, { useEffect, useState } from 'react'; 
import Classcard from '../../components/common/Classcard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AllclassPage = () => {
  const queryClient = useQueryClient();
  const [classes, setClasses] = useState([]);
  const [authUser, setAuthUser] = useState(null); 

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

  const activeClasses = classes.filter(classItem => classItem.isActive[0]);
  const inactiveClasses = classes.filter(classItem => !classItem.isActive[0]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>班级加载错误</div>;

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold">所有班级</h1>

      <div className="p-4">
        <div className="flex flex-wrap">
          {activeClasses.map((classItem) => (
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
            <div className="collapse-title text-xl font-medium">隐藏班级</div>
            <div className="collapse-content">
              <div className="px-4 py-2">
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
        </div>
      )}
    </div>
  );
};

export default AllclassPage;
