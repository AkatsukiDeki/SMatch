import React from 'react';
import './Filters.css';

const Filters = ({ filters, onFilterChange, subjects }) => {
  const faculties = [
    'Факультет информатики',
    'Экономический факультет',
    'Юридический факультет',
    'Филологический факультет',
    'Математический факультет',
    'Физический факультет',
    'Химический факультет',
    'Биологический факультет'
  ];

  const years = [1, 2, 3, 4, 5, 6];

  return (
    <div className="filters-panel">
      <h3>Фильтры поиска</h3>

      <div className="filter-group">
        <label>Факультет:</label>
        <select
          name="faculty"
          value={filters.faculty}
          onChange={onFilterChange}
        >
          <option value="">Все факультеты</option>
          {faculties.map(faculty => (
            <option key={faculty} value={faculty}>{faculty}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Курс:</label>
        <select
          name="year"
          value={filters.year}
          onChange={onFilterChange}
        >
          <option value="">Все курсы</option>
          {years.map(year => (
            <option key={year} value={year}>{year} курс</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Предмет:</label>
        <select
          name="subject_id"
          value={filters.subject_id}
          onChange={onFilterChange}
        >
          <option value="">Все предметы</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>

      <button
        className="btn-reset"
        onClick={() => onFilterChange({ target: { name: 'reset', value: '' } })}
      >
        Сбросить фильтры
      </button>
    </div>
  );
};

export default Filters;