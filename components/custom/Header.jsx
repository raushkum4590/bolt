import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import Colors from '@/app/data/Colors'

function Header() {
  return (
    <div className='p-4 flex justify-between items-center'>
        <Image src="/logo.svg" alt="logo" width={40} height={40}/>
        <div className='flex gap-5'>
            <Button variant="ghost">Sign In</Button>
            <Button className='text-white'
            style={{
                backgroundColor:Colors.BLUE
            }} 
            >Get started</Button>
        </div>
    </div>
  )
}

export default Header