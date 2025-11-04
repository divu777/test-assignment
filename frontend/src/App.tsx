import  { useState } from 'react'
import Navbar from './Navbar'
import User from './User'
import Admin from './Admin'

const App = () => {
  const [active,setActive] = useState('user')
  return (
    <div>
      <Navbar setActive={setActive} active={active}/>
      {active =='user'? <User/> : <Admin/>}
    </div>
  )
}

export default App
