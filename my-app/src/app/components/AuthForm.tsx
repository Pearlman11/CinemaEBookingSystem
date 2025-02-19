'use client';


import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './AuthForm.module.css';

export default function AuthFrom() {
    // need to track if were in "Login (True)" mode or "Signup Mode (False)"
    const [isLogin, setIsLogin] = useState(true);

    //creating form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const {login} = useAuth();

    //allow toggeling between modes
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setPassword('');
        setConfirmPassword('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        //if user is signing up, check and make sure the passwords match
        if (!isLogin && password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        //call authentication here. PlaceHolder for now
        if (isLogin) {
            console.log('Logging in with:', { email, password });
            // TODO: Call Login api - on successful login, update auth state
            login();
        } else {
            console.log('Signing up with:', { email, password });
            //TODO: Call signup API - on successful sign up, update auth state
            login();
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block' }}>
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        name='email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password" style={{ display: 'block' }}>
                        Password:
                    </label>
                    <input
                        type="password"
                        id='password'
                        name='password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style = {{width: '100%', padding: '0.5rem'}}
                    />
                </div>
                {!isLogin && (
                     <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block' }}>
                        Confirm Password:
                    </label>
                    <input
                        type="password"
                        id='confirmPassword'
                        name='confirm Password'
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        style = {{width: '100%', padding: '0.5rem'}}
                    />
                </div>
                )}
                <button type='submit' className={styles.formbutton}>
                    {isLogin? 'Login': 'Sign Up'}
                </button>
            </form>
            <p className={styles.loginbuttoncontiner}>
                {isLogin? "Don't have an account?" : 'Already Have an account?'}{' '}
                <button onClick={toggleMode} className={styles.loginbutton}>
                    {isLogin?'Sign Up':'Login'}
                </button>
            </p>
        </div>
    )
}