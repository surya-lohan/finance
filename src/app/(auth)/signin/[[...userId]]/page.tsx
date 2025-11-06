import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='min-h-screen grid grid-cols-1 lg:grid-cols-2'>
        <div className='h-full lg:flex flex-col items-center justify-center px-4'>
            <div className='text-center space-y-4 pt-16'>
                <h1 className='font-bold text-4xl text-[#2E2A47]'>Welcome Back!</h1>
                <p className='text-base text-[#7E8CA0]'>Log in or Create your account to get back to your dashboard!</p>
            </div>
            <div className='flex items-center justify-center mt-8'>
                <ClerkLoaded>
                    <SignIn path='/signin' />
                </ClerkLoaded>
                <ClerkLoading>
                    <Loader2 className='animate-spin text-muted-foreground' />
                </ClerkLoading>
            </div>
        </div>
        <div className='h-full bg-blue-600 hidden lg:flex justify-center items-center '>
            <Image src="/logo.svg" alt='Logo' height={100} width={100} className='w-[40vh]' />
        </div>
    </div>
  )
}