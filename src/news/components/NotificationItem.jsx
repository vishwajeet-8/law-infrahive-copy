import React from 'react';

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

const NotificationItem = ({ notification }) => {
  const { title, content, date, category } = notification;
  
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

export default NotificationItem;