import React from 'react'
import { LoginForm } from "@/components/login-form"
import Image from '../assets/illustration.jpg'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

const Login = () => {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col p-6 md:p-10">
                <div>
                    <Link to="/">
                        <img src={logo} width={150} alt="" />
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:flex lg:items-center lg:justify-center">
                <img
                    src={Image}
                    alt="Image"
                    className="h-[450px] w-[450px] rounded-lg dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}

export default Login