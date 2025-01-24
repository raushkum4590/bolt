import { HelpCircle, LogOut, Settings, Wallet } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

function SideBarFooter() {
    const options = [
        {
            name: 'Settings',
            icon: Settings,
        },
        {
            name: 'Help Center',
            icon: HelpCircle,
        },
        {
            name: 'My Subscriptions',
            icon: Wallet,
        },
        {
            name: 'Sign Out',
            icon: LogOut,
        },
    ];

    return (
        <div className="p-5 mb-10">
            {options.map((option, index) => (
                <Button variant="ghost" key={index} className="w-full flex justify-start gap-2">
                    {/* Dynamically render the icon */}
                    <option.icon className="w-5 h-5" />
                    {option.name}
                </Button>
            ))}
        </div>
    );
}

export default SideBarFooter;
