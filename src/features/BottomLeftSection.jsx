import React from 'react'
import Logo from '../components/Logo';
import SocialMedia from '../components/SocialMedia';
const BottomLeftSection = () => {
  return (
    <div className='left w-2/5 lg:w-1/2 px-4 lg:px-16'>
      <div className='mb-32 lg:mb-16 mt-4'>
      <Logo/>
      </div>
      <SocialMedia/>
    </div>
  )
}

export default BottomLeftSection