import React from 'react';
import { Search } from 'lucide-react';

const SearchFilter = ({ onSearch, placeholder, value }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] outline-none"
      />
    </div>
  );
};

export default SearchFilter;