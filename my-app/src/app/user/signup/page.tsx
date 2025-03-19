import React, { useState } from 'react';

export default function SignUp() {
    const [isPromotionsOptedIn, setIsPromotionsOptedIn] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle sign-up form submission, including the promotions opt-in status.
        console.log("Promotions Opt-in:", isPromotionsOptedIn ? "Yes" : "No");
    };

    return (
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" placeholder="Enter your name" required />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter your email" required />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Enter your password" required />
                </div>

                {/* Promotions Opt-In */}
                <div>
                    <label>Receive Promotions:</label>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="promotions"
                                value="yes"
                                checked={isPromotionsOptedIn === true}
                                onChange={() => setIsPromotionsOptedIn(true)}
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="promotions"
                                value="no"
                                checked={isPromotionsOptedIn === false}
                                onChange={() => setIsPromotionsOptedIn(false)}
                            />
                            No
                        </label>
                    </div>
                </div>

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
