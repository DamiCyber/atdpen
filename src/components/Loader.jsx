import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../assets/style/style.css"
const Loader = () => {
    const [loading, setloading] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        setloading(true)
        setTimeout(() => {
            navigate("/Login")
        }, 5000)
    })
    if (loading) {
        return (
            <div>
                <div className="loader-container">
                    <img
                        src="https://res.cloudinary.com/dgxvuw8wd/image/upload/v1745508053/1f4177ed-47e3-4a5a-b5f3-0e8adf1595c3-removebg-preview_celvbn.png"
                        alt="Logo"
                        className="loader-logo"
                    />
                </div>
            </div>
        )
    }
}

export default Loader