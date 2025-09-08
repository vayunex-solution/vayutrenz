// sidebar.jsx
import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, ListFilter, ChevronUp, ChevronDown, CheckCircle, Circle, LucideSortDesc } from "lucide-react";

const FilterSectionContent = ({ title, options, selectedOptions, setSelectedOptions }) => {
  const [smallWindow, setSmallWindow] = useState(window.innerWidth < 1000);
  useEffect(() => {
    setSmallWindow(window.innerWidth < 1000);
  }, []);

  const [showAll, setShowAll] = useState(smallWindow);
  const visibleOptions = showAll ? options : options.slice(0, 5);
  const shouldShowToggle = smallWindow ? false : options.length > 5;

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) => {
      const isSortBy = title === 'SortBy';

      if (isSortBy) {
        // Replace with only the selected option
        return { ...prev, [title]: [option] };
      }

      const current = prev[title] || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];

      return { ...prev, [title]: updated };
    });
  };


  return (
    <div className="filter-options">
      <ul>
        {visibleOptions.map((option, index) => (
          <li key={index} onClick={() => handleCheckboxChange(option)}>
            {selectedOptions[title]?.includes(option) ?
              <CheckCircle size={18} strokeWidth={3} className='check-circle-icon' />
              :
              <Circle size={18} strokeWidth={3} className='check-icon' />
            }
            {' '}
            <p>{option}</p>
          </li>
        ))}
      </ul>
      {shouldShowToggle && (
        <span className="show-toggle" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Hide' : 'Show'}
        </span>
      )}
    </div>
  );
};



const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeFilter, setActiveFilter] = useState('Sizes');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const updatedOptions = {};

    for (const [key, value] of params.entries()) {
      updatedOptions[key] = value.split('_');
    }

    setSelectedOptions(updatedOptions);
  }, [location.search]);

  // Converts selectedOptions to query string
  const createQueryString = () => {
    const params = Object.entries(selectedOptions)
      // eslint-disable-next-line no-unused-vars
      .filter(([_, options]) => options.length > 0)
      .map(([title, options]) => {
        const joinedOptions = options.join('_');
        return `${encodeURIComponent(title)}=${encodeURIComponent(joinedOptions)}`;
      })
      .join('&');
    return params;
  };

  const handleApply = () => {
    const queryString = createQueryString();
    if (queryString) {
      navigate(`?${queryString}`);
    }
    setOpen(false);
  };

  const sortBy = [
    { title: 'SortBy', options: ['Popularity', 'New Arrival', 'Price : Low to High', 'Price : High to Low'] }
  ];

  const filtersItems = [
    { title: 'Gender', options: ['MEN', 'WOMEN', 'UNISEX'] },
    { title: 'Sizes', options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', "XXL", "3XL", "4XL"] },
    { title: 'Color', options: ['black', 'green', 'blue', 'white', 'brown', 'red', 'orange', 'yellow'] },
    { title: 'Sleeve', options: ['half-sleeve', 'full-sleeve', 'raglan-sleeve'] },
    { title: 'Neck', options: ['round neck', 'polo', 'v-neck', 'hooded'] },
    { title: 'Ratings', options: ['4.5 and above', '4 and above', '3.5 and above', '3 and above', '2.5 and above'] },
    { title: 'Discount', options: ['10% or more', '20% or more', '30% or more', '40% or more', '50% or more', '60% or more', '70% or more', '80% or more'] }
  ];

  const [filters, setFilters] = useState(filtersItems);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClear = () => {
    setSelectedOptions({});
    if (location.search) {
      navigate(window.location.pathname); // Remove query string
    }
  };
  //   const handleApply = () => setOpen(false);
  const isAnySelected = Object.values(selectedOptions).some(arr => arr.length > 0);

  const BottomBarHeading = () => {
    return (
      <div className="bottom-bar-headings">
        <div className="bar-item" onClick={() => { setActiveFilter('SortBy'); setOpen(true); setFilters(sortBy) }}>
          <LucideSortDesc className="icon" />
          <div className="bar-text">
            <strong>Sort</strong>
          </div>
        </div>
        <div className="bar-item" onClick={() => { setActiveFilter('Gender'); setOpen(true); setFilters(filtersItems) }}>
          <ListFilter className="icon" />
          <div className="bar-text">
            <strong>Filter</strong>
          </div>
        </div>
        <div className="close-icon" onClick={() => setOpen(prev => !prev)} >
          {open ? (
            <ChevronDown className="icon" />
          ) : (
            <ChevronUp className="icon" />
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='top-heading-filter-sort'>
        <BottomBarHeading />
      </div>
      {isMobile ? (
        <div className={`bottom-bar ${open ? "open" : ""}`}>
          <BottomBarHeading />
          <div className={`bottom-bar-container ${open ? "open" : ""}`}>
            <div className="filter-titles">
              <ul>
                {filters.map((filter, index) => (
                  <li
                    key={index}
                    className={activeFilter === filter.title ? 'active' : ''}
                    onClick={() => setActiveFilter(filter.title)}
                  >
                    {filter.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="filter-contents">
              {filters
                .filter((filter) => filter.title === activeFilter)
                .map((filter, index) => (
                  <FilterSectionContent
                    key={index}
                    title={filter.title}
                    options={filter.options}
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
                  />
                ))}
            </div>
            <div className="bottom-bar-footer">
              <button className="clear-btn" onClick={handleClear} disabled={!isAnySelected}>Clear All</button>
              <button className="apply-btn" disabled={!isAnySelected} onClick={handleApply}>Apply</button>
            </div>
          </div>
          {open && (
            <div
              className={`bottom-bar-background-hider ${open ? "active" : ""}`}
              onClick={() => setOpen(false)}></div>
          )}
        </div>
      ) : (
        <div className="sidebar-container desktop">
          <div className="bottom-bar-footer">
            <button className="clear-btn" onClick={handleClear} disabled={!isAnySelected}>Clear All</button>
            <button className="apply-btn" disabled={!isAnySelected} onClick={handleApply}>Apply</button>
          </div>
          <h3 className="filter-heading">Filters</h3>
          {[...sortBy,...filtersItems].map((filter, index) => (
            <div className="desktop-filter-section" key={index}>
              <h4>{filter.title}</h4>
              <FilterSectionContent
                title={filter.title}
                options={filter.options}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Sidebar;
