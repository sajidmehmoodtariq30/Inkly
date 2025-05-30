import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Searchbox = ({ onSearch, placeholder = "Search..." }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.(searchTerm);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="pl-10 pr-4"
                />
            </div>
            <Button type="submit" variant="ghost" size="sm" className="ml-2">
                Search
            </Button>
        </form>
    );
};

export default Searchbox;