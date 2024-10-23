import React, { useState, useEffect } from 'react';

const CreateClassPage = ({ createClass, fetchStudents }) => {
  // State for class name and selected students
  const [className, setClassName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch the list of students from the database when the component loads
  useEffect(() => {
    const loadStudents = async () => {
      const studentsData = await fetchStudents(); // Assume fetchStudents is a function passed down that fetches students from the database
      setStudents(studentsData);
    };
    loadStudents();
  }, [fetchStudents]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (className === '' || selectedStudents.length === 0) {
      alert('Please enter a class name and select at least one student.');
      return;
    }
    // Call the createClass function, passing the class name and selected students
    createClass({ className, students: selectedStudents });
  };

  // Handle student selection
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId); // Deselect if already selected
      } else {
        return [...prev, studentId]; // Add to selected if not already
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Class</h1>
      <form onSubmit={handleSubmit}>
        {/* Class Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="className">
            Class Name
          </label>
          <input
            type="text"
            id="className"
            className="border border-gray-300 p-2 w-full"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter class name"
            required
          />
        </div>

        {/* Student Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="students">
            Select Students
          </label>
          <div className="border border-gray-300 p-2 max-h-60 overflow-y-auto">
            {students.map((student) => (
              <div key={student._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={student._id}
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => handleStudentSelect(student._id)}
                  className="mr-2"
                />
                <label htmlFor={student._id}>
                  {student.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Create Class
        </button>
      </form>
    </div>
  );
};

export default CreateClassPage;
