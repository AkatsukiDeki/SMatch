import React, { useState, useEffect } from 'react';
import { authAPI, matchingAPI } from '../../services/api';

const APITest = () => {
  const [results, setResults] = useState({});

  const testEndpoints = async () => {
    const testResults = {};

    try {
      // Тест профиля
      testResults.profile = await authAPI.getProfile();
      console.log('Profile response:', testResults.profile.data);
    } catch (error) {
      testResults.profile = { error: error.message, status: error.response?.status };
    }

    try {
      // Тест университетов
      testResults.universities = await authAPI.getUniversities();
      console.log('Universities response:', testResults.universities.data);
    } catch (error) {
      testResults.universities = { error: error.message, status: error.response?.status };
    }

    try {
      // Тест предметов
      testResults.subjects = await matchingAPI.getSubjects();
      console.log('Subjects response:', testResults.subjects.data);
    } catch (error) {
      testResults.subjects = { error: error.message, status: error.response?.status };
    }

    try {
      // Тест предметов пользователя
      testResults.userSubjects = await matchingAPI.getUserSubjects();
      console.log('User subjects response:', testResults.userSubjects.data);
    } catch (error) {
      testResults.userSubjects = { error: error.message, status: error.response?.status };
    }

    setResults(testResults);
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>API Debug Test</h2>
      <button onClick={testEndpoints}>Retest APIs</button>

      <div style={{ marginTop: '20px' }}>
        <h3>Results:</h3>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  );
};

export default APITest;