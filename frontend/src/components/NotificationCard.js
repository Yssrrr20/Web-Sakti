import React from 'react';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

const variantStyles = {
  info: {
    icon: <Info className="text-blue-500 w-5 h-5" />,
    bg: 'bg-blue-50 border-blue-300 text-blue-800',
  },
  warning: {
    icon: <AlertCircle className="text-yellow-500 w-5 h-5" />,
    bg: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  },
  success: {
    icon: <CheckCircle2 className="text-green-500 w-5 h-5" />,
    bg: 'bg-green-50 border-green-300 text-green-800',
  },
};

const NotificationCard = ({ type = 'info', title, message }) => {
  const style = variantStyles[type] || variantStyles.info;

  return (
    <div className={`border-l-4 p-4 rounded-lg shadow-md flex items-start space-x-3 ${style.bg} mb-4`}>
      {style.icon}
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default NotificationCard;
