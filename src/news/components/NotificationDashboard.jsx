import React, { useState } from 'react';

// Sample notification data
const notificationsData = {
  rbi: [
    {
      id: 1,
      title: 'Review of Risk Weights on Microfinance Loans',
      content: 'The Reserve Bank of India has reviewed the risk weights on microfinance loans for commercial banks, including small finance banks but excluding regional rural banks and local area banks. Claims meeting specific criteria may be considered as retail claims for regulatory capital purposes, attracting a risk weight of 75 per cent, while certain claims like consumer credit are disallowed from being categorized under the regulatory retail portfolio.',
      date: '2025-02-25',
      category: 'RBI'
    },
    {
      id: 2,
      title: 'Exposures of Scheduled Commercial Banks (SCBs) to Non-Banking Financial Companies (NBFCs) – Review of Risk Weights',
      content: 'The Reserve Bank of India has decided to restore the risk weights on exposures of Scheduled Commercial Banks to Non-Banking Financial Companies to the levels specified by their external ratings, reversing the previous increase of 25 percentage points for those with risk weights below 100 percent.',
      date: '2025-02-25',
      category: 'RBI'
    }
  ],
  sebi: [
    {
      id: 3,
      title: 'Framework for Social Stock Exchange',
      content: 'SEBI has introduced a framework for the Social Stock Exchange (SSE) to facilitate fundraising by social enterprises. The framework includes eligibility requirements, disclosure standards, and reporting requirements for organizations seeking to list on the SSE.',
      date: '2025-02-20',
      category: 'SEBI'
    },
    {
      id: 4,
      title: 'Review of Margin Framework for Commodity Derivatives Segment',
      content: 'SEBI has revised the margin framework for the commodity derivatives segment to better align with market volatility and risk management practices. The revisions include changes to SPAN margin parameters and concentration margin calculations.',
      date: '2025-02-18',
      category: 'SEBI'
    }
  ],
  incomeTax: [
    {
      id: 5,
      title: 'Extension of Due Date for Filing ITR for AY 2024-25',
      content: 'The Central Board of Direct Taxes (CBDT) has extended the due date for filing Income Tax Returns for Assessment Year 2024-25 for certain categories of taxpayers. The extension applies to taxpayers subject to tax audit under section 44AB of the Income Tax Act.',
      date: '2025-02-22',
      category: 'Income Tax'
    }
  ],
  gst: [
    {
      id: 6,
      title: 'Changes in GST Rates for Specified Goods and Services',
      content: 'The GST Council has recommended changes in GST rates for certain goods and services. The changes include rate reductions for medical devices and rate increases for certain luxury items. The revised rates will be effective from April 1, 2025.',
      date: '2025-02-24',
      category: 'GST'
    }
  ],
  supremeCourt: [
    {
      id: 7,
      title: 'Judgment on Constitutional Validity of GST Amendments',
      content: 'The Supreme Court has upheld the constitutional validity of amendments made to the GST Act regarding input tax credit claims. The judgment clarifies the time limits for claiming input tax credits and validates the retrospective application of certain provisions.',
      date: '2025-02-15',
      category: 'Supreme Court'
    }
  ],
  aptel: [
    {
      id: 8,
      title: 'Order on Renewable Energy Tariff Determination',
      content: 'The Appellate Tribunal for Electricity (APTEL) has issued an order on the methodology for determining tariffs for renewable energy projects. The order provides guidance on the treatment of capital costs, return on equity, and operational expenses for solar and wind projects.',
      date: '2025-02-21',
      category: 'APTEL'
    }
  ],
  indiaCode: [
    {
      id: 9,
      title: 'Amendments to Companies Act, 2013',
      content: 'The Ministry of Corporate Affairs has notified amendments to the Companies Act, 2013, simplifying compliance requirements for small companies and startups. The amendments reduce filing requirements and introduce a fast-track process for certain corporate actions.',
      date: '2025-02-19',
      category: 'India Code'
    }
  ],
  cbic: [
    {
      id: 10,
      title: 'Opening of Demat Account in the name of Association of Persons',
      content: 'The Central Board of Indirect Taxes and Customs (CBIC) has issued guidelines for opening demat accounts in the name of Association of Persons. The guidelines specify the documentation requirements and verification procedures for such accounts.',
      date: '2025-02-23',
      category: 'CBIC'
    }
  ]
};

// Sidebar Component
const Sidebar = ({ menuOptions, activeSection, onSectionChange }) => {
  return (
    <div className="w-60 h-full bg-amber-50 shadow-md">
      <div className="py-4">
        {menuOptions.map((option) => (
          <button
            key={option.id}
            className={`w-full text-left py-3 px-6 text-lg font-medium transition-colors ${
              activeSection === option.id
                ? 'bg-amber-100 border-l-4 border-blue-900'
                : 'hover:bg-amber-100'
            }`}
            onClick={() => onSectionChange(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Filter Bar Component
const FilterBar = ({ dateOptions, selectedDate, onDateChange, searchQuery, onSearchChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Selected date label
  const selectedDateLabel = dateOptions.find(option => option.value === selectedDate)?.label || 'Last 15 days';

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="relative">
        <button
          className="flex items-center justify-between min-w-40 px-4 py-2 bg-white rounded shadow-sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>{selectedDateLabel}</span>
          <span className="ml-2 text-xs">▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute mt-1 w-40 bg-white rounded shadow-md z-10">
            {dateOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedDate === option.value ? 'bg-gray-100 font-medium' : ''
                }`}
                onClick={() => {
                  onDateChange(option.value);
                  setIsDropdownOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex-1 ml-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">🔍</span>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const { title, content, date, category } = notification;
  
  const getCategoryColor = (category) => {
    const colors = {
      'RBI': 'bg-blue-900',
      'SEBI': 'bg-blue-800',
      'Income Tax': 'bg-blue-700',
      'GST': 'bg-blue-600',
      'Supreme Court': 'bg-blue-500',
      'APTEL': 'bg-blue-400',
      'India Code': 'bg-blue-300',
      'CBIC': 'bg-blue-200'
    };
    
    return colors[category] || 'bg-gray-500';
  };
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-3">{content}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-sm">{date}</span>
        <span className={`${getCategoryColor(category)} text-white text-xs px-2 py-1 rounded`}>
          {category}
        </span>
      </div>
      
      <div className="mt-3">
        <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm transition-colors">
          Chat With the Notification
        </button>
      </div>
    </div>
  );
};

// Notification List Component
const NotificationList = ({ notifications, title }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b">{title} Notifications</h2>
      
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications available.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
const NotificationDashboard = () => {
  const [activeSection, setActiveSection] = useState('rbi');
  const [dateFilter, setDateFilter] = useState('15');
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar menu options
  const menuOptions = [
    { id: 'rbi', name: 'RBI' },
    { id: 'sebi', name: 'SEBI' },
    { id: 'incomeTax', name: 'Income Tax' },
    { id: 'gst', name: 'GST' },
    { id: 'supremeCourt', name: 'Supreme Court' },
    { id: 'aptel', name: 'APTEL' },
    { id: 'indiaCode', name: 'India Code' },
    { id: 'cbic', name: 'CBIC' }
  ];

  // Date filter options
  const dateOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '15', label: 'Last 15 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        menuOptions={menuOptions} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        <FilterBar 
          dateOptions={dateOptions} 
          selectedDate={dateFilter} 
          onDateChange={setDateFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <NotificationList 
          notifications={notificationsData[activeSection] || []} 
          title={menuOptions.find(option => option.id === activeSection)?.name || ''} 
        />
      </div>
    </div>
  );
};

export default NotificationDashboard;